import varuint from '../../utils/varuint'
import bufferutils from '../../utils/bufferutils'
import createHash = require("create-hash");
import { fromBase58Check, toBase58Check } from '../../utils/address';
import { I_ADDR_VERSION } from '../../constants/vdxf';
import { VDXFObject } from "../";
import { MMR, MemoryBasedDb } from "./MMR"

const { BufferReader, BufferWriter } = bufferutils;

export interface AttestationData{
    attestationKey?: string;
    salt?: string;
    value?: string;
}


export class Attestation extends VDXFObject {
    components: Map<number,AttestationData>;
    signatures: {[attestor: string]: {signature: string, system: string}};
    mmr: MMR;

    constructor(vdxfkey: string = "", data?: { 
      components?: Map<number,AttestationData>;
      signatures?: {[attestor: string]: {signature: string, system: string}};
      mmr?: MMR;
    }) {
      super(vdxfkey);

      if (data) {
        this.components = data.components || null;
        this.signatures = data.signatures || null;
        this.mmr = data.mmr || null;
      }
      
    }

    dataByteLength(): number {

      let byteLength = 0;
      byteLength += varuint.encodingLength(this.components.size)

      for (const [key, item] of this.components) {
        byteLength += varuint.encodingLength(key)
        byteLength += 20;  //key
        byteLength += 32;  //salt
        byteLength += varuint.encodingLength(Buffer.from(item.value, "utf8").length);
        byteLength += Buffer.from(item.value, "utf8").length;
      }

      const sigKeys = Object.keys(this.signatures);
      byteLength += varuint.encodingLength(sigKeys.length);

      for (const item of sigKeys) {
        byteLength += 20;  //Attestor
        byteLength += 20;  //System
        byteLength += varuint.encodingLength(Buffer.from(this.signatures[item].signature, "base64").length);
        byteLength += Buffer.from(this.signatures[item].signature, "base64").length;

      }   

      if (this.mmr) {
        const nodes = this.mmr.db.nodes;
        const mmrKeys = Object.keys(nodes);
   
        byteLength += varuint.encodingLength(this.mmr.db.leafLength);
        byteLength += varuint.encodingLength(mmrKeys.length);

        for (const item of mmrKeys) {
          byteLength += varuint.encodingLength(parseInt(item));
          byteLength += varuint.encodingLength(nodes[item].length);
          byteLength += nodes[item].length;
        }  
      } else {
        byteLength += varuint.encodingLength(0);
      }
      return byteLength;
    }
  
    toDataBuffer(): Buffer {
      const bufferWriter = new BufferWriter(Buffer.alloc(this.dataByteLength()));

      bufferWriter.writeCompactSize(this.components.size);
      for (const [key, item] of this.components) {
        bufferWriter.writeCompactSize(key);
        bufferWriter.writeSlice(fromBase58Check(item.attestationKey).hash);
        bufferWriter.writeSlice(Buffer.from(item.salt, "hex"));
        bufferWriter.writeVarSlice(Buffer.from(item.value, "utf8"))
      }

      const objKeys = Object.keys(this.signatures);
      bufferWriter.writeCompactSize(objKeys.length);

      for (const item of objKeys) {

        bufferWriter.writeSlice(fromBase58Check(item).hash);
        bufferWriter.writeSlice(fromBase58Check(this.signatures[item].system).hash);
        bufferWriter.writeVarSlice(Buffer.from(this.signatures[item].signature, "base64"))

      }

      if (this.mmr) {

        bufferWriter.writeCompactSize(this.mmr.db.leafLength);
        const nodes = this.mmr.db.nodes;
        const mmrKeys = Object.keys(nodes);
        bufferWriter.writeCompactSize(mmrKeys.length);

        for (const item of mmrKeys) {

          bufferWriter.writeCompactSize(parseInt(item));
          bufferWriter.writeVarSlice(nodes[item])

        }
      } else {
        bufferWriter.writeCompactSize(0);
      }

      return bufferWriter.buffer
    }
  
    fromDataBuffer(buffer: Buffer, offset?: number): number {

      const reader = new bufferutils.BufferReader(buffer, offset);  
      const attestationsByteLength = reader.readCompactSize(); //dummy read

      const componentsLength = reader.readCompactSize();
      this.components = new Map();

      for (var i = 0; i < componentsLength; i++) {
        const key = reader.readCompactSize();
        const attestationKey = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
        const salt = Buffer.from(reader.readSlice(32)).toString('hex');
        const value = Buffer.from(reader.readVarSlice()).toString('utf8');
        this.components.set(key, {attestationKey, salt, value});
      }
    
      const signaturesSize = reader.readCompactSize();
      this.signatures = {};

      for (var i = 0; i < signaturesSize; i++) {

        const attestor = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
        const system = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
        const signature = reader.readVarSlice().toString('base64');
        this.signatures[attestor] = {signature, system};
      }

      const leafLength = reader.readCompactSize();
      
      if (leafLength > 0) {
        const referenceTreeLength = reader.readCompactSize();
        const nodes = {};
        
        for (var i = 0; i < referenceTreeLength; i++) {
          
          const nodeIndex = reader.readCompactSize();
          const signature = reader.readVarSlice();
          nodes[nodeIndex] = signature;
        }

        if (Object.keys(nodes).length > 0) {
          this.mmr = new MMR(new MemoryBasedDb(leafLength, nodes))
        }
      }

      return reader.offset;
    }

    async createMMR() {

      if (!this.mmr) {
        this.mmr = new MMR();
      } else {
        return this.mmr;
      }

      for (const [key, item] of this.components) {

        await this.mmr.append(this.getHash(key), key)

      }

      return this.mmr;
    }

    async routeHash() {

      if (!this.mmr) {
        await this.createMMR();
      }

      return await this.mmr.getRoot();
    }

    // returns an attestation with a sparse MMR containing the leaves specified
    async getProof(keys: Array<number>): Promise<Attestation> {
  
      const itemMaps = new Map();

      keys.forEach((key, index) => {itemMaps.set(index, this.components.get(key))});
            
      const reply = new Attestation(this.vdxfkey, {components: itemMaps, mmr: await this.mmr.getProof(keys, null), signatures: this.signatures});
      
      return reply;

    }

    async checkProof() { 
      
      try {

        for (const [key, item] of this.components) {

          const hash = this.getHash(key);
          const proof = await this.mmr.getProof([key], null);

          if(hash !== proof) {
            throw new Error("Attestation not found in MMR");
          }
        }
      } catch (e) { 
        throw new Error("Error checking MMR");
      }
    }

    getHash(key): Buffer {
      
      const bufferWriter = new BufferWriter(Buffer.alloc(20 + 
                                                          32 + 
                                                          varuint.encodingLength(Buffer.from(this.components.get(key).value, "utf8").length) + 
                                                          Buffer.from(this.components.get(key).value, "utf8").length ));
      bufferWriter.writeSlice(fromBase58Check(this.components.get(key).attestationKey).hash);
      bufferWriter.writeSlice(Buffer.from(this.components.get(key).salt, "hex"));
      bufferWriter.writeCompactSize(Buffer.from(this.components.get(key).value, "utf8").length)
      bufferWriter.writeSlice(Buffer.from(this.components.get(key).value, "utf8"));

      return createHash("sha256").update(bufferWriter.buffer).digest();

    }

  }
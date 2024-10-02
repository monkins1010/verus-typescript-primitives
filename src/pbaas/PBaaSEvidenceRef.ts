import varint from '../utils/varint'
import varuint from '../utils/varuint'
import { fromBase58Check, toBase58Check } from "../utils/address";
import bufferutils from '../utils/bufferutils'
import { BN } from 'bn.js';
import { BigNumber } from '../utils/types/BigNumber';
import { I_ADDR_VERSION } from '../constants/vdxf';
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { UTXORef } from './UTXORef';
import { IdentityMultimapRef } from './IdentityMultimapRef';

const { BufferReader, BufferWriter } = bufferutils

export class PBaaSEvidenceRef implements SerializableEntity {
  version: BigNumber;
  flags: BigNumber;
  output: UTXORef;
  object_num: BigNumber;
  sub_object: BigNumber;
  system_id: string;

  static FLAG_ISEVIDENCE = new BN(1)
  static FLAG_HAS_SYSTEM = new BN(2)
  static FIRST_VERSION = new BN(1)
  static LAST_VERSION = new BN(1)

  constructor(data?: { version?: BigNumber, flags?: BigNumber, output?: UTXORef, object_num?: BigNumber, sub_object?: BigNumber, system_id?: string }) {

    if (data) {
      this.version = data.version || new BN(1, 10);
      this.flags = data.flags || new BN(0);
      this.output = data.output || new UTXORef();
      this.object_num = data.object_num || new BN(0);
      this.sub_object = data.sub_object || new BN(0);
      this.system_id = data.system_id || "";
    }
  }

  setFlags() {
    this.flags = this.flags.and(PBaaSEvidenceRef.FLAG_ISEVIDENCE);
    if (this.system_id && this.system_id.length > 0) {
      this.flags = this.flags.or(PBaaSEvidenceRef.FLAG_HAS_SYSTEM);
    }

  }

  getByteLength() {
    let byteLength = 0;
    this.setFlags();

    byteLength += varint.encodingLength(this.version);
    byteLength += varint.encodingLength(this.flags);
    byteLength += this.output.getByteLength();
    byteLength += varint.encodingLength(this.object_num);
    byteLength += varint.encodingLength(this.sub_object);

    if (this.flags.and(PBaaSEvidenceRef.FLAG_HAS_SYSTEM).gt(new BN(0))) {
      byteLength += 20;
    }

    return byteLength
  }

  toBuffer() {
    const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()))

    bufferWriter.writeVarInt(this.version);
    bufferWriter.writeVarInt(this.flags);
    bufferWriter.writeSlice(this.output.toBuffer());
    bufferWriter.writeVarInt(this.object_num);
    bufferWriter.writeVarInt(this.sub_object);

    if (this.flags.and(PBaaSEvidenceRef.FLAG_HAS_SYSTEM).gt(new BN(0))) {
      bufferWriter.writeSlice(fromBase58Check(this.system_id).hash);
    }

    return bufferWriter.buffer
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.version = reader.readVarInt();
    this.flags = reader.readVarInt();
    this.output = new UTXORef();
    offset = this.output.fromBuffer(reader.buffer, reader.offset);
    this.object_num = reader.readVarInt();
    this.sub_object = reader.readVarInt();

    if (this.flags.and(IdentityMultimapRef.FLAG_HAS_DATAHASH).gt(new BN(0))) {
      this.system_id = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    }

    return reader.offset;
  }

  isValid(): boolean {
    return this.output.isValid() && this.version.gte(PBaaSEvidenceRef.FIRST_VERSION) &&
      this.version.lte(PBaaSEvidenceRef.LAST_VERSION) &&
      (this.flags.and(PBaaSEvidenceRef.FLAG_ISEVIDENCE).gt(new BN(0)));
  }

  toJson() {

    let retval;

    retval.version = this.version.toString(10);
    retval.flags = this.flags.toString(10);
    retval.output = this.output.toJson();

    if (this.flags.and(PBaaSEvidenceRef.FLAG_HAS_SYSTEM).gt(new BN(0))) {
      retval.systemid = this.system_id;
    }
    retval.objectnum = this.object_num.toString(10);
    retval.subobject = this.sub_object.toString(10);

    return retval;
  }
}
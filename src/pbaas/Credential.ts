import varint from '../utils/varint'
import varuint from '../utils/varuint'
import { fromBase58Check, toBase58Check } from "../utils/address";
import bufferutils from '../utils/bufferutils'
import { BN } from 'bn.js';
import { BigNumber } from '../utils/types/BigNumber';
import { I_ADDR_VERSION } from '../constants/vdxf';
import { SerializableEntity } from '../utils/types/SerializableEntity';

const { BufferReader, BufferWriter } = bufferutils

export interface CredentialJson { 
  version: number;
  flags: number;
  credentialkey: string;
  credential?: object; 
  scopes: object;
  label: string;

}
export class Credential implements SerializableEntity {
  version: BigNumber;
  flags: BigNumber;
  credential_key: string;
  credential: object;
  scopes: object;
  label: string;

  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static CURRENT_VERSION = new BN(1);

  static FLAG_LABEL_PRESENT = new BN(1);

  static MAX_JSON_STRING_LENGTH = 512;

  constructor(data?) {

    if (data) {
      this.version = data.version || Credential.CURRENT_VERSION;
      this.flags = data.flags || new BN(0);
      this.credential_key = data.credential_key || '';
      this.credential = data.credential || {};
      this.scopes = data.scopes || {};
      this.label = data.label || '';      
    }
  }

    calcFlags()
    {
        return ((this.label && this.label.length > 0) ? Credential.FLAG_LABEL_PRESENT : new BN(0));
    }

    setFlags()
    {
        this.flags = this.calcFlags();
    }

  getByteLength() {
    let byteLength = 0;
    this.setFlags();

    byteLength += varint.encodingLength(this.version);
    byteLength += varint.encodingLength(this.flags);

    byteLength += 20; // credentialskey

    if (JSON.stringify(this.credential).length > Credential.MAX_JSON_STRING_LENGTH) {
      throw new Error(`Credential JSON exceeds maximum length of ${Credential.MAX_JSON_STRING_LENGTH} characters`);
    }
    byteLength += varuint.encodingLength(JSON.stringify(this.credential).length); // credential json length
    byteLength += Buffer.byteLength(JSON.stringify(this.credential), 'utf8'); // credential json utf8 length

    if (JSON.stringify(this.scopes).length > Credential.MAX_JSON_STRING_LENGTH) {
      throw new Error(`Scopes JSON exceeds maximum length of ${Credential.MAX_JSON_STRING_LENGTH} characters`);
    }
    byteLength += varuint.encodingLength(JSON.stringify(this.scopes).length); // scopes json length
    byteLength += Buffer.byteLength(JSON.stringify(this.scopes), 'utf8'); // scopes json utf8 length

    if (this.flags.and(Credential.FLAG_LABEL_PRESENT).gt(new BN(0))) {
      if (this.label.length > Credential.MAX_JSON_STRING_LENGTH) {
        throw new Error(`Label exceeds maximum length of ${Credential.MAX_JSON_STRING_LENGTH} characters`);
      }
      byteLength += varuint.encodingLength(this.label.length); // label json length
      byteLength += Buffer.byteLength(this.label, 'utf8'); // label json utf8 length
    }

    return byteLength
  }

  toBuffer() {
    const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()))

    bufferWriter.writeVarInt(this.version);
    bufferWriter.writeVarInt(this.flags);
    bufferWriter.writeSlice(fromBase58Check(this.credential_key).hash);
    bufferWriter.writeVarSlice(Buffer.from(JSON.stringify(this.credential), 'utf8'));
    bufferWriter.writeVarSlice(Buffer.from(JSON.stringify(this.scopes), 'utf8'));
    if (this.flags.and(Credential.FLAG_LABEL_PRESENT).gt(new BN(0))) {
      bufferWriter.writeVarSlice(Buffer.from(this.label, 'utf8'));
    }

    return bufferWriter.buffer
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.version = new BN(reader.readVarInt());
    this.flags = new BN(reader.readVarInt());
    this.credential_key = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    const credentialJson = reader.readVarSlice();
    this.credential = credentialJson.length > 0 ? JSON.parse(credentialJson.toString('utf8')) : {};
    const scopesJson = reader.readVarSlice();
    this.scopes = scopesJson.length > 0 ? JSON.parse(scopesJson.toString('utf8')) : {};
    this.label = reader.readVarSlice().toString('utf8');

    return reader.offset;
  }

  isValid(): boolean {
    return this.version.gte(Credential.FIRST_VERSION) &&
      this.version.lte(Credential.LAST_VERSION) &&
      fromBase58Check(this.credential_key).hash.length == 20;
  }

  toJson() {

    let retval: CredentialJson = {

      version: this.version.toNumber(),
      flags: this.flags.toNumber(),
      credentialkey: this.credential_key,
      credential: this.credential,
      scopes: this.scopes,
      label: this.label
    };

    return retval;
  }

  static fromJson(data: CredentialJson): Credential {
    return new Credential({
      version: new BN(data.version),
      flags: new BN(data.flags),
      credential_key: data.credentialkey,
      credential: data.credential,
      scopes: data.scopes,
      label: data.label
    })
  }
}
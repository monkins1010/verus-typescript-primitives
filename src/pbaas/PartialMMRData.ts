import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { BN } from 'bn.js';
import varint from '../utils/varint';
import bufferutils from '../utils/bufferutils';
import varuint from '../utils/varuint';
import { DEFAULT_HASH_TYPE } from '../constants/pbaas';

const { BufferReader, BufferWriter } = bufferutils;

export type PartialMMRDataUnit = { type: BigNumber, data: Buffer };

export type PartialMMRDataInitData = {
  flags?: BigNumber;
  data?: Array<PartialMMRDataUnit>;
  salt?: Array<Buffer>;
  mmrhashtype?: BigNumber;
  priormmr?: Array<Buffer>;
}

export type PartialMMRDataJson = {
  flags?: string;
  data?: Array<{type: string, data: string}>;
  salt?: Array<string>;
  mmrhashtype?: string;
  priormmr?: Array<string>;
}

export class PartialMMRData implements SerializableEntity {
  flags: BigNumber;
  data: Array<PartialMMRDataUnit>;
  mmrhashtype?: BigNumber;

  salt?: Array<Buffer>;
  priormmr?: Array<Buffer>;

  static CONTAINS_SALT = new BN("1", 10);
  static CONTAINS_PRIORMMR = new BN("2", 10);
  
  constructor(data?: PartialMMRDataInitData) {
    this.flags = data && data.flags ? data.flags : new BN("0");
    this.data = data && data.data ? data.data : [];
    this.mmrhashtype = data && data.mmrhashtype ? data.mmrhashtype : DEFAULT_HASH_TYPE;
    
    if (data?.salt) {
      if (!this.containsSalt()) this.toggleContainsSalt();
      this.salt = data.salt;
    }

    if (data?.priormmr) {
      if (!this.containsPriorMMR()) this.toggleContainsPriorMMR();
      this.priormmr = data.priormmr;
    }
  }

  protected containsSalt() {
    return !!(this.flags.and(PartialMMRData.CONTAINS_SALT).toNumber());
  }

  protected containsPriorMMR() {
    return !!(this.flags.and(PartialMMRData.CONTAINS_PRIORMMR).toNumber());
  }

  private toggleContainsSalt() {
    this.flags = this.flags.xor(PartialMMRData.CONTAINS_SALT);
  }

  private toggleContainsPriorMMR() {
    this.flags = this.flags.xor(PartialMMRData.CONTAINS_PRIORMMR);
  }

  private getPartialMMRDataByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    length += varuint.encodingLength(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      const unit = this.data[i];

      length += varint.encodingLength(unit.type);

      length += varuint.encodingLength(unit.data.length);
      length += unit.data.length;
    }

    length += varint.encodingLength(this.mmrhashtype);

    if (this.containsSalt()) {
      length += varuint.encodingLength(this.salt.length);
      for (let i = 0; i < this.salt.length; i++) {
        const salt = this.salt[i];
  
        length += varuint.encodingLength(salt.length);
        length += salt.length;
      }
    }

    if (this.containsPriorMMR()) {
      length += varuint.encodingLength(this.priormmr.length);
      for (let i = 0; i < this.priormmr.length; i++) {
        const priormmr = this.priormmr[i];
  
        length += varuint.encodingLength(priormmr.length);
        length += priormmr.length;
      }
    }

    return length;
  }

  getByteLength(): number {
    return this.getPartialMMRDataByteLength();
  }

  fromBuffer(buffer: Buffer, offset: number = 0): number {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    const numData = reader.readCompactSize();
    for (let i = 0; i < numData; i++) {
      const type = reader.readVarInt();
      const data = reader.readVarSlice();

      this.data.push({
        type,
        data
      })
    }

    this.mmrhashtype = reader.readVarInt();

    if (this.containsSalt()) {
      this.salt = reader.readVector();
    }

    if (this.containsPriorMMR()) {
      this.priormmr = reader.readVector();
    }

    return reader.offset;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getPartialMMRDataByteLength()));
  
    // Serialize flags
    writer.writeVarInt(this.flags);
  
    writer.writeCompactSize(this.data.length);

    for (let i = 0; i < this.data.length; i++) {
      writer.writeVarInt(this.data[i].type);
      writer.writeVarSlice(this.data[i].data);
    }

    writer.writeVarInt(this.mmrhashtype);

    if (this.containsSalt()) {
      writer.writeVector(this.salt);
    }

    if (this.containsPriorMMR()) {
      writer.writeVector(this.priormmr);
    }
  
    return writer.buffer;
  }

  toJson(): PartialMMRDataJson {
    return {
      flags: this.flags ? this.flags.toString(10) : undefined,
      data: this.data ? this.data.map(x => {
        return {
          type: x.type.toString(10),
          data: x.data.toString('hex')
        }
      }) : undefined,
      salt: this.salt ? this.salt.map(x => x.toString('hex')) : undefined,
      mmrhashtype: this.mmrhashtype ? this.mmrhashtype.toString(10) : undefined,
      priormmr: this.priormmr ? this.priormmr.map(x => x.toString('hex')) : undefined
    }
  }

  static fromJson(json: PartialMMRDataJson): PartialMMRData {
    return new PartialMMRData({
      flags: json.flags ? new BN(json.flags, 10) : undefined,
      data: json.data ? json.data.map(x => {
        return {
          type: new BN(x.type, 10),
          data: Buffer.from(x.data, 'hex')
        }
      }) : undefined,
      salt: json.salt ? json.salt.map(x => Buffer.from(x, 'hex')) : undefined,
      mmrhashtype: json.mmrhashtype ? new BN(json.mmrhashtype, 10) : undefined,
      priormmr: json.priormmr ? json.priormmr.map(x => Buffer.from(x, 'hex')) : undefined,
    })
  }
}
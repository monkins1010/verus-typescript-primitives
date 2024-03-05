import varuint from '../utils/varuint';
import bufferutils from '../utils/bufferutils';
import { fromBase58Check, toBase58Check } from '../utils/address';
import {  I_ADDR_VERSION } from '../constants/vdxf';
import { BN } from 'bn.js';
import { DATA_TYPE_STRING } from '../vdxf';
import { VdxfUniType, VdxfUniValue, VdxfUniValueJson } from './VdxfUniValue';
import { isHexString } from '../utils/string';

export const IDENTITY_VERSION_PBAAS = new BN(3, 10);
export const VERSION_INVALID = new BN(0, 10);

const { BufferReader, BufferWriter } = bufferutils

export type ContentMultiMapPrimitive = VdxfUniValue | Buffer;
export type ContentMultiMapPrimitiveJson = VdxfUniValueJson | string;
export type ContentMultiMapJsonValue = ContentMultiMapPrimitiveJson | Array<ContentMultiMapPrimitiveJson>;
export type ContentMultiMapJson = { [key: string]: ContentMultiMapJsonValue };

export type KvValueArrayItem = Buffer | ContentMultiMapJson;

export function isKvValueArrayItemVdxfUniValueJson(x: ContentMultiMapJsonValue): x is VdxfUniValueJson {
  return x != null && typeof x === 'object' && !Array.isArray(x) && Object.keys(x).every((key) => {
    const val = x[key];

    try {
      const { version, hash } = fromBase58Check(key);

      return version === I_ADDR_VERSION && (Buffer.isBuffer(val) || typeof val === 'string')
    } catch(e) {return false}
  })
}

export type KvContent =  Map<string, Array<ContentMultiMapPrimitive> | ContentMultiMapPrimitive>;

export class ContentMultiMap {
  kv_content: KvContent;

  constructor(data?: { kv_content: KvContent }) {
    if (data?.kv_content) this.kv_content = data.kv_content;
  }

  getByteLength() {
    let length = 0;

    length += varuint.encodingLength(this.kv_content.size);

    for (const [key, value] of this.kv_content.entries()) {
      length += fromBase58Check(key).hash.length;
      
      if (Array.isArray(value)) {
        const valueArr = value as Array<ContentMultiMapPrimitive>;
        length += varuint.encodingLength(valueArr.length);

        for (const n of value) {
          if (n instanceof VdxfUniValue) {
            const nCMMNOLength = n.getByteLength();
  
            length += varuint.encodingLength(nCMMNOLength);
            length += nCMMNOLength;
          } else if (Buffer.isBuffer(n)) {
            const nBuf = n as Buffer;
  
            length += varuint.encodingLength(nBuf.length);
            length += nBuf.length;
          } else throw new Error("Unknown ContentMultiMap data, can't calculate ByteLength")
        }
      } else if (value instanceof VdxfUniValue) {
        const valCMMNOLength = value.getByteLength();

        length += varuint.encodingLength(1);

        length += varuint.encodingLength(valCMMNOLength);
        length += valCMMNOLength;
      } else if (Buffer.isBuffer(value)) {
        const valBuf = value as Buffer;

        length += varuint.encodingLength(1);

        length += varuint.encodingLength(valBuf.length);
        length += valBuf.length;
      } else throw new Error("Unknown ContentMultiMap data, can't calculate ByteLength")
    }

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeCompactSize(this.kv_content.size);

    for (const [key, value] of this.kv_content.entries()) {
      writer.writeSlice(fromBase58Check(key).hash);

      if (Array.isArray(value)) { 
        writer.writeCompactSize(value.length);

        for (const n of value) {
          if (n instanceof VdxfUniValue) {
            const nCMMNOBuf = n.toBuffer();
  
            writer.writeVarSlice(nCMMNOBuf);
          } else if (Buffer.isBuffer(n)) {
            const nBuf = n as Buffer;
  
            writer.writeVarSlice(nBuf);
          } else throw new Error("Unknown ContentMultiMap data, can't toBuffer");
        }
      } else if (value instanceof VdxfUniValue) {
        const valCMMNOBuf = value.toBuffer();

        writer.writeCompactSize(1);
        writer.writeVarSlice(valCMMNOBuf);
      } else if (Buffer.isBuffer(value)) {
        const valBuf = value as Buffer;

        writer.writeCompactSize(1);
        writer.writeVarSlice(valBuf);
      } else throw new Error("Unknown ContentMultiMap data, can't toBuffer")
    }

    return writer.buffer
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    const contentMultiMapSize = reader.readVarInt();
    this.kv_content = new Map();

    for (var i = 0; i < contentMultiMapSize.toNumber(); i++) {
      const contentMapKey = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);

      const vectorData = reader.readVector();

      this.kv_content.set(contentMapKey, vectorData);
    }

    return reader.offset;
  }

  static fromJson(obj: { [key: string]: ContentMultiMapJsonValue }): ContentMultiMap {
    const content: KvContent = new Map();

    for (const key in obj) {
      const keybytes = fromBase58Check(key).hash;
      const value = obj[key];

      if (keybytes && value != null) {
        if (Array.isArray(value)) {
          const items = [];

          for (const x of value) {
            if (typeof x === 'string') {
              items.push(Buffer.from(x, 'hex'));
            } else if (typeof x === 'object' && x != null) {
              const uniVal = VdxfUniValue.fromJson(x as VdxfUniValueJson);

              if (uniVal.toBuffer().length > 0) {
                items.push(uniVal);
              }
            }
          }

          content.set(key, items);
        } else if (typeof value === 'string' && isHexString(value)) {
          content.set(key, Buffer.from(value, 'hex'));
        } else if (isKvValueArrayItemVdxfUniValueJson(value)) {
          content.set(key, VdxfUniValue.fromJson(value as VdxfUniValueJson));
        } else {
          throw new Error("Invalid data in multimap")
        }
      }
    }

    return new ContentMultiMap({ kv_content: content })
  }

  toJson(): ContentMultiMapJson {
    const ret: ContentMultiMapJson = {};
    
    for (const [key, value] of this.kv_content.entries()) {
      if (Array.isArray(value)) { 
        const items = [];

        for (const n of value) {
          if (n instanceof VdxfUniValue) {
            items.push(n.toJson());
          } else if (Buffer.isBuffer(n)) {
            items.push(n.toString('hex'));
          } else throw new Error("Unknown ContentMultiMap data, can't toBuffer");
        }

        ret[key] = items;
      } else if (value instanceof VdxfUniValue) {
        ret[key] = value.toJson();
      } else if (Buffer.isBuffer(value)) {
        ret[key] = value.toString('hex');
      } else throw new Error("Unknown ContentMultiMap data, can't toBuffer")
    }

    return ret;
  }
}
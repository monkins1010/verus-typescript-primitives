import varuint from '../utils/varuint'
import bufferutils from '../utils/bufferutils'
import { BigNumber } from '../utils/types/BigNumber';
import { fromBase58Check, toBase58Check } from '../utils/address';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION, VDXF_OBJECT_DEFAULT_VERSION } from '../constants/vdxf';
import { BN } from 'bn.js';
import { DATA_TYPE_STRING } from '../vdxf';
import { SerializableEntity } from '../utils/types/SerializableEntity';
import varint from '../utils/varint';
import { isHexString } from '../utils/string';
import { CurrencyValueMap } from './CurrencyValueMap';
import { Rating, RatingJson } from './Rating';
import { TransferDestination, TransferDestinationJson } from './TransferDestination';
import { ContentMultiMapRemove, ContentMultiMapRemoveJson } from './ContentMultiMapRemove';
import { CrossChainDataRef } from './CrossChainDataRef';
import { SignatureData } from './SignatureData';
import { DataDescriptor } from './DataDescriptor';
import { MMRDescriptor, MMRDescriptorJson } from './MMRDescriptor';
import { BufferDataVdxfObject } from '../index';
import * as VDXF_Data from '../vdxf/vdxfdatakeys';

export const VDXF_UNI_VALUE_VERSION_INVALID = new BN(0, 10);
export const VDXF_UNI_VALUE_VERSION_CURRENT = new BN(1, 10);

const { BufferWriter, BufferReader } = bufferutils

// TODO: Add other type definitions
export type VdxfUniType = string | Buffer;
export type VdxfUniValueJson = { [key: string]: string };

// This UniValue class was adapted from C++ code for encoding JSON objects into bytes. It is not serialization and
// therefore doesn't have a fromBuffer function, as you can't reliably decode it, only encode.
export class VdxfUniValue implements SerializableEntity {
  values: Map<string, VdxfUniType>;
  version: BigNumber;

  constructor(data?: { values: Map<string, VdxfUniType>, version?: BigNumber }) {
    if (data?.values) this.values = data.values;
    if (data?.version) this.version = data.version;
    else this.version = VDXF_UNI_VALUE_VERSION_CURRENT;
  }

  getByteLength() {
    let length = 0;

    for (const key of this.values.keys()) {
      const value = this.values.get(key);
      length += HASH160_BYTE_LENGTH;
      length += varint.encodingLength(this.version);

      if (key == DATA_TYPE_STRING.vdxfid) {
        const valueString = (value as string);
        const valBuf = Buffer.from(valueString, 'utf8');

        //NOTE 3 is from ss type + ver + vdxfidver 
        length += varint.encodingLength(new BN(valBuf.length + 3));

        length += varuint.encodingLength(valBuf.length);
        length += valBuf.length;
      } else throw new Error("Invalid or unrecognized vdxf key for object type")
    }

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    for (const key of this.values.keys()) {
      const value = this.values.get(key);
      writer.writeSlice(fromBase58Check(key).hash)
      writer.writeVarInt(this.version);

      if (key == DATA_TYPE_STRING.vdxfid) {
        const valueString = value as string;
        const valBuf = Buffer.from(valueString, 'utf8');

        //NOTE 3 is from ss type + ver + vdxfidver 
        writer.writeVarInt(new BN(valBuf.length + 3));

        writer.writeVarSlice(valBuf);
      } else throw new Error("Invalid or unrecognized vdxf key for object type")
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0, keylist: Array<string> = []): number {
    const reader = new BufferReader(buffer, offset);
    let lastPrereadOffset = reader.offset;

    function readNextKey() {
      lastPrereadOffset = reader.offset;

      try {
        return toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
      } catch (e) {
        return null;
      }
    }

    this.values = new Map();

    for (const key of keylist) {
      const dataTypeKey = readNextKey();
      this.version = reader.readVarInt();

      if (this.version.gt(VDXF_UNI_VALUE_VERSION_CURRENT)) throw new Error("Unknown VDXFUniValue version");

      if (dataTypeKey == DATA_TYPE_STRING.vdxfid) {
        reader.readVarInt();

        const slice = reader.readVarSlice();

        this.values.set(dataTypeKey, slice.toString('utf8'));
      } else {
        throw new Error("Invalid or unrecognized vdxf key for object type")
      }
    }

    return reader.offset;
  }

  static fromJson(obj: VdxfUniValueJson) {
    const map = new Map()

    for (const key in obj) {
      map.set(key, obj[key]);
    }

    return new VdxfUniValue({
      values: map
    })
  }

  toJson(): VdxfUniValueJson {
    const ret = {};

    for (const key of this.values.keys()) {
      ret[key] = this.values.get(key) as string;
    }

    return ret;
  }

  static vectorEncodeVDXFUni = (obj): Buffer => {
    let ss = Buffer.from('');

    if (typeof (obj) != 'object') {
      if (typeof (obj) != 'string') throw new Error('VectorEncodeVDXFUni: not JSON string as expected');
      if (isHexString(obj)) {
        return Buffer.from(obj, "hex");
      }
      return Buffer.from(obj, "utf-8");
    }

    if (obj.serializedHex) {
      if (!isHexString(obj.serializedHex)) {
        throw new Error("contentmap: If the \"serializedhex\" key is present, it's data must be only valid hex and complete");
      }
      return Buffer.from(obj.serializedHex);
    }

    if (obj.serializedBase64) {
      try {
        return Buffer.from(obj.serializedBase64, 'base64');
      } catch (e) {
        throw new Error("contentmap: If the \"serializedBase64\" key is present, it's data must be only valid base64 and complete");
      }
    }

    if (obj.message) {
      return Buffer.from(obj.message, "utf-8");
    }

    // this should be an object with "vdxfkey" as the key and {object} as the json object to serialize
    const oneValKeys = Object.keys(obj);
    const oneValValues = Object.values(obj);

    for (let k = 0; k < oneValKeys.length; k++) {
      const objTypeKey = oneValKeys[k];
      if (objTypeKey == VDXF_Data.DataByteKey.vdxfid) {
        const oneByte = Buffer.from(oneValValues[k] as string, "hex");
        if (oneByte.length != 1) {
          throw new Error("contentmap: byte data must be exactly one byte");
        }
        ss = Buffer.concat([ss, oneByte]);
      }
      else if (objTypeKey == VDXF_Data.DataInt16Key.vdxfid) {
        const oneShort = Buffer.alloc(2);
        oneShort.writeInt16LE(oneValValues[k] as number);
        ss = Buffer.concat([ss, oneShort]);
      }
      else if (objTypeKey == VDXF_Data.DataUint16Key.vdxfid) {
        const oneUShort = Buffer.alloc(2);
        oneUShort.writeUInt16LE(oneValValues[k] as number);
        ss = Buffer.concat([ss, oneUShort]);
      }
      else if (objTypeKey == VDXF_Data.DataInt32Key.vdxfid) {
        const oneInt = Buffer.alloc(4);
        oneInt.writeInt32LE(oneValValues[k] as number);
        ss = Buffer.concat([ss, oneInt]);

      }
      else if (objTypeKey == VDXF_Data.DataUint32Key.vdxfid) {
        const oneUInt = Buffer.alloc(4);
        oneUInt.writeUInt32LE(oneValValues[k] as number);
        ss = Buffer.concat([ss, oneUInt]);
      }
      else if (objTypeKey == VDXF_Data.DataInt64Key.vdxfid) {
        const oneInt64 = Buffer.alloc(8);
        oneInt64.writeIntLE(oneValValues[k] as number, 0, 8);
        ss = Buffer.concat([ss, oneInt64]);
      }
      else if (objTypeKey == VDXF_Data.DataUint160Key.vdxfid) {
        const oneKey = fromBase58Check(oneValValues[k] as string).hash;
        ss = Buffer.concat([ss, oneKey]);
      }
      else if (objTypeKey == VDXF_Data.DataUint256Key.vdxfid) {
        const oneHash = Buffer.from(oneValValues[k] as string, "hex");
        if (oneHash.length != 32) {
          throw new Error("contentmap: hash data must be exactly 32 bytes");
        }
        ss = Buffer.concat([ss, oneHash.reverse()]);
      }
      else if (objTypeKey == VDXF_Data.DataStringKey.vdxfid) {

        let length = 20;
        length += 1;
        const encodedLength = varuint.encodingLength(Buffer.from(oneValValues[k] as string, "utf-8").length)
        length += varuint.encodingLength(encodedLength + Buffer.from(oneValValues[k] as string, "utf-8").length);
        length += encodedLength;
        length += Buffer.from(oneValValues[k] as string, "utf-8").length;

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(new BN(1));
        writer.writeCompactSize(encodedLength + Buffer.from(oneValValues[k] as string, "utf-8").length);
        writer.writeVarSlice(Buffer.from(oneValValues[k] as string, "utf-8"));

        ss = Buffer.concat([ss, writer.buffer]);
      }
      else if (objTypeKey == VDXF_Data.DataByteVectorKey.vdxfid) {

        let length = 20;
        length += 1;
        const encodedLength = varuint.encodingLength(Buffer.from(oneValValues[k] as string, "hex").length)
        length += varuint.encodingLength(encodedLength + Buffer.from(oneValValues[k] as string, "hex").length);
        length += encodedLength;
        length += Buffer.from(oneValValues[k] as string, "hex").length;

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(new BN(1));
        writer.writeCompactSize(encodedLength + Buffer.from(oneValValues[k] as string, "hex").length);
        writer.writeVarSlice(Buffer.from(oneValValues[k] as string, "hex"));

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.DataCurrencyMapKey.vdxfid) {

        const destinations = Object.keys(oneValValues[k]);
        const values = Object.values(oneValValues[k]);

        const oneCurMap = new CurrencyValueMap({ value_map: new Map(destinations.map((key, index) => [key, new BN(values[index])])), multivalue: true });

        let length = 20;
        length += 1;
        length += varuint.encodingLength(oneCurMap.getByteLength());
        length += oneCurMap.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(new BN(1));
        writer.writeCompactSize(oneCurMap.getByteLength());
        writer.writeSlice(oneCurMap.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.DataRatingsKey.vdxfid) {

        const oneRatingMap = Rating.fromJson(oneValValues[k] as RatingJson);

        let length = 20;
        length += varint.encodingLength(oneRatingMap.version);
        length += varuint.encodingLength(oneRatingMap.getByteLength());
        length += oneRatingMap.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(oneRatingMap.version);
        writer.writeCompactSize(oneRatingMap.getByteLength());
        writer.writeSlice(oneRatingMap.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.DataTransferDestinationKey.vdxfid) {

        const transferDest = TransferDestination.fromJson(oneValValues[k] as TransferDestinationJson);

        let length = 20;
        length += varint.encodingLength(transferDest.typeNoFlags());
        length += varuint.encodingLength(transferDest.getByteLength());
        length += transferDest.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(transferDest.typeNoFlags());
        writer.writeCompactSize(transferDest.getByteLength());
        writer.writeSlice(transferDest.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.ContentMultiMapRemoveKey.vdxfid) {

        const transferDest = ContentMultiMapRemove.fromJson(oneValValues[k] as ContentMultiMapRemoveJson);

        let length = 20;
        length += varint.encodingLength(transferDest.version);
        length += varuint.encodingLength(transferDest.getByteLength());
        length += transferDest.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(transferDest.version);
        writer.writeCompactSize(transferDest.getByteLength());
        writer.writeSlice(transferDest.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.CrossChainDataRefKey.vdxfid) {

        const transferDest = CrossChainDataRef.fromJson(oneValValues[k]);

        let length = 20;
        length += varint.encodingLength(VDXF_OBJECT_DEFAULT_VERSION);
        length += varuint.encodingLength(transferDest.getByteLength());
        length += transferDest.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(VDXF_OBJECT_DEFAULT_VERSION);
        writer.writeCompactSize(transferDest.getByteLength());
        writer.writeSlice(transferDest.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.DataDescriptorKey.vdxfid) {

        const descr = DataDescriptor.fromJson(oneValValues[k]);

        let length = 20;
        length += varint.encodingLength(descr.version);
        length += varuint.encodingLength(descr.getByteLength());
        length += descr.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(descr.version);
        writer.writeCompactSize(descr.getByteLength());
        writer.writeSlice(descr.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.MMRDescriptorKey.vdxfid) {

        const descr = MMRDescriptor.fromJson(oneValValues[k] as MMRDescriptorJson);

        let length = 20;
        length += varint.encodingLength(descr.version);
        length += varuint.encodingLength(descr.getByteLength());
        length += descr.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));

        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(descr.version);
        writer.writeCompactSize(descr.getByteLength());
        writer.writeSlice(descr.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else if (objTypeKey == VDXF_Data.SignatureDataKey.vdxfid) {

        const sigData = SignatureData.fromJson(oneValValues[k]);

        let length = 20;
        length += varint.encodingLength(sigData.version);
        length += varuint.encodingLength(sigData.getByteLength());
        length += sigData.getByteLength();

        const writer = new BufferWriter(Buffer.alloc(length));
        writer.writeSlice(fromBase58Check(objTypeKey).hash);
        writer.writeVarInt(sigData.version);
        writer.writeCompactSize(sigData.getByteLength());
        writer.writeSlice(sigData.toBuffer());

        ss = Buffer.concat([ss, writer.buffer]);

      }
      else {
        throw new Error("contentmap invalid or unrecognized vdxfkey for object type: " + oneValValues[k]);
      }
    }
    return ss;
  }


  static VDXFDataToUniValue = (buffer: Buffer, offset: number = 0, pSuccess = null) => {
    const reader = new BufferReader(buffer, offset);
    let objectUni: any;
    try {
      let checkVal: string;
      let version = new BN(0);
      let objSize = 0;
      checkVal = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);

      if (checkVal == VDXF_Data.DataCurrencyMapKey.vdxfid) {
        const oneCurrencyMap = new CurrencyValueMap();
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        reader.offset = oneCurrencyMap.fromBuffer(reader.buffer, reader.offset);
        if (oneCurrencyMap.isValid()) {
          objectUni = { [checkVal]: oneCurrencyMap.toJson() };
        }
      }
      else if (checkVal == VDXF_Data.DataRatingsKey.vdxfid) {
        const oneRatingObj = new Rating();
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        reader.offset = oneRatingObj.fromBuffer(reader.buffer, reader.offset);
        if (oneRatingObj.isValid()) {
          objectUni = { [checkVal]: oneRatingObj.toJson() };
        }
      }
      else if (checkVal == VDXF_Data.DataTransferDestinationKey.vdxfid) {
        const oneTransferDest = new TransferDestination();
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        reader.offset = oneTransferDest.fromBuffer(reader.buffer, reader.offset);
        if (oneTransferDest.isValid()) {
          objectUni = { [checkVal]: oneTransferDest.toJson() };
        }
      }
      else if (checkVal == VDXF_Data.ContentMultiMapRemoveKey.vdxfid) {
        throw new Error("ContentMultiMapRemoveKey not implemented");
        // TODO: Implement ContentMultiMapRemoveKey

        // CContentMultiMapRemove oneContentRemove;
        // ss >> VARINT(version);
        // ss >> COMPACTSIZE(objSize);
        // ss >> oneContentRemove;
        // if (oneContentRemove.isValid())
        // {
        //     objectUni = UniValue(UniValue::VOBJ);
        //     objectUni.pushKV(EncodeDestination(CIdentityID(checkVal)), oneContentRemove.ToUniValue());
        // }
      }
      else if (checkVal == VDXF_Data.DataStringKey.vdxfid) {
        let stringVal: string;
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        stringVal = reader.readVarSlice.toString();
        objectUni = { [checkVal]: stringVal };
      }
      else if (checkVal == VDXF_Data.DataByteVectorKey.vdxfid) {
        let vecVal: Buffer;
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        vecVal = reader.readVarSlice();
        objectUni = { [checkVal]: vecVal.toString('hex') };
      }
      else if (checkVal == VDXF_Data.CrossChainDataRefKey.vdxfid) {
        const dataRef = new CrossChainDataRef();
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        reader.offset = dataRef.fromBuffer(reader.buffer, reader.offset);
        if (dataRef.isValid()) {
          objectUni = { [checkVal]: dataRef.toJson() };
        }
      }
      else if (checkVal == VDXF_Data.DataDescriptorKey.vdxfid) {
        const dataDescriptor = new DataDescriptor();
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        reader.offset = dataDescriptor.fromBuffer(reader.buffer, reader.offset);
        if (dataDescriptor.isValid()) {
          objectUni = { [checkVal]: dataDescriptor.toJson() };
        }
      }
      else if (checkVal == VDXF_Data.MMRDescriptorKey.vdxfid) {
        const mmrDescriptor = new MMRDescriptor();
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        reader.offset = mmrDescriptor.fromBuffer(reader.buffer, reader.offset);
        if (mmrDescriptor.isValid()) {
          objectUni = { [checkVal]: mmrDescriptor.toJson() };
        }
      }
      else if (checkVal == VDXF_Data.SignatureDataKey.vdxfid) {
        const sigData = new SignatureData();
        version = reader.readVarInt();
        objSize = reader.readCompactSize();
        reader.offset = sigData.fromBuffer(reader.buffer, reader.offset);
        if (sigData.isValid()) {
          objectUni = { [checkVal]: sigData.toJson() };
        }
      }

      // if we have an object that we recognized, encode it
      if (objectUni) {
        if (pSuccess != null) {
          pSuccess.value = true;
        }
      }
      else {
        if (pSuccess != null) {
          pSuccess.value = false;
        }
      }
    }
    catch (e) {
      if (pSuccess != null) {
        pSuccess.value = false;
      }
    }
    return { objectUni, offset: reader.offset, pSuccess };
  }

  static VDXFDataToUniValueArray = (buffer: Buffer, offset: number = 0) => {
    let entryArr = [];
    const reader = new BufferReader(buffer, offset);
    let bytesLeft = buffer.length;

    while (bytesLeft > 20) // size of uint160
    {
      let objOut = { value: false };
      const { objectUni, offset } = VdxfUniValue.VDXFDataToUniValue(reader.buffer, reader.offset, objOut);
      reader.offset = offset;
      bytesLeft = buffer.length - reader.offset;
      if (objOut.value) {
        entryArr.push(objectUni);
      }
      else {
        // add the remaining data as a hex string
        reader.offset = reader.offset - 20;
        entryArr.push(reader.readSlice(bytesLeft + 20).toString('hex'));
        bytesLeft = 0;
        break;
      }
    }
    if (bytesLeft && bytesLeft <= 20) {
      entryArr.push(reader.readSlice(bytesLeft).toString('hex'));
    }
    return entryArr.length == 0 ? null : (entryArr.length == 1 ? entryArr[0] : entryArr);

  }
}
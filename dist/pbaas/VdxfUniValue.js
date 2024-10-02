"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VdxfUniValue = exports.VDXF_UNI_VALUE_VERSION_CURRENT = exports.VDXF_UNI_VALUE_VERSION_INVALID = void 0;
const varuint_1 = require("../utils/varuint");
const bufferutils_1 = require("../utils/bufferutils");
const address_1 = require("../utils/address");
const vdxf_1 = require("../constants/vdxf");
const bn_js_1 = require("bn.js");
const vdxf_2 = require("../vdxf");
const varint_1 = require("../utils/varint");
const string_1 = require("../utils/string");
const CurrencyValueMap_1 = require("./CurrencyValueMap");
const Rating_1 = require("./Rating");
const TransferDestination_1 = require("./TransferDestination");
const ContentMultiMapRemove_1 = require("./ContentMultiMapRemove");
const CrossChainDataRef_1 = require("./CrossChainDataRef");
const SignatureData_1 = require("./SignatureData");
const DataDescriptor_1 = require("./DataDescriptor");
const MMRDescriptor_1 = require("./MMRDescriptor");
const VDXF_Data = require("../vdxf/vdxfdatakeys");
exports.VDXF_UNI_VALUE_VERSION_INVALID = new bn_js_1.BN(0, 10);
exports.VDXF_UNI_VALUE_VERSION_CURRENT = new bn_js_1.BN(1, 10);
const { BufferWriter, BufferReader } = bufferutils_1.default;
// This UniValue class was adapted from C++ code for encoding JSON objects into bytes. It is not serialization and
// therefore doesn't have a fromBuffer function, as you can't reliably decode it, only encode.
class VdxfUniValue {
    constructor(data) {
        if (data === null || data === void 0 ? void 0 : data.values)
            this.values = data.values;
        if (data === null || data === void 0 ? void 0 : data.version)
            this.version = data.version;
        else
            this.version = exports.VDXF_UNI_VALUE_VERSION_CURRENT;
    }
    getByteLength() {
        let length = 0;
        for (const key of this.values.keys()) {
            const value = this.values.get(key);
            length += vdxf_1.HASH160_BYTE_LENGTH;
            length += varint_1.default.encodingLength(this.version);
            if (key == vdxf_2.DATA_TYPE_STRING.vdxfid) {
                const valueString = value;
                const valBuf = Buffer.from(valueString, 'utf8');
                //NOTE 3 is from ss type + ver + vdxfidver 
                length += varint_1.default.encodingLength(new bn_js_1.BN(valBuf.length + 3));
                length += varuint_1.default.encodingLength(valBuf.length);
                length += valBuf.length;
            }
            else
                throw new Error("Invalid or unrecognized vdxf key for object type");
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        for (const key of this.values.keys()) {
            const value = this.values.get(key);
            writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
            writer.writeVarInt(this.version);
            if (key == vdxf_2.DATA_TYPE_STRING.vdxfid) {
                const valueString = value;
                const valBuf = Buffer.from(valueString, 'utf8');
                //NOTE 3 is from ss type + ver + vdxfidver 
                writer.writeVarInt(new bn_js_1.BN(valBuf.length + 3));
                writer.writeVarSlice(valBuf);
            }
            else
                throw new Error("Invalid or unrecognized vdxf key for object type");
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset = 0, keylist = []) {
        const reader = new BufferReader(buffer, offset);
        let lastPrereadOffset = reader.offset;
        function readNextKey() {
            lastPrereadOffset = reader.offset;
            try {
                return (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
            }
            catch (e) {
                return null;
            }
        }
        this.values = new Map();
        for (const key of keylist) {
            const dataTypeKey = readNextKey();
            this.version = reader.readVarInt();
            if (this.version.gt(exports.VDXF_UNI_VALUE_VERSION_CURRENT))
                throw new Error("Unknown VDXFUniValue version");
            if (dataTypeKey == vdxf_2.DATA_TYPE_STRING.vdxfid) {
                reader.readVarInt();
                const slice = reader.readVarSlice();
                this.values.set(dataTypeKey, slice.toString('utf8'));
            }
            else {
                throw new Error("Invalid or unrecognized vdxf key for object type");
            }
        }
        return reader.offset;
    }
    static fromJson(obj) {
        const map = new Map();
        for (const key in obj) {
            map.set(key, obj[key]);
        }
        return new VdxfUniValue({
            values: map
        });
    }
    toJson() {
        const ret = {};
        for (const key of this.values.keys()) {
            ret[key] = this.values.get(key);
        }
        return ret;
    }
}
exports.VdxfUniValue = VdxfUniValue;
VdxfUniValue.vectorEncodeVDXFUni = (obj) => {
    let ss = Buffer.from('');
    if (typeof (obj) != 'object') {
        if (typeof (obj) != 'string')
            throw new Error('VectorEncodeVDXFUni: not JSON string as expected');
        if ((0, string_1.isHexString)(obj)) {
            return Buffer.from(obj, "hex");
        }
        return Buffer.from(obj, "utf-8");
    }
    if (obj.serializedHex) {
        if (!(0, string_1.isHexString)(obj.serializedHex)) {
            throw new Error("contentmap: If the \"serializedhex\" key is present, it's data must be only valid hex and complete");
        }
        return Buffer.from(obj.serializedHex);
    }
    if (obj.serializedBase64) {
        try {
            return Buffer.from(obj.serializedBase64, 'base64');
        }
        catch (e) {
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
            const oneByte = Buffer.from(oneValValues[k], "hex");
            if (oneByte.length != 1) {
                throw new Error("contentmap: byte data must be exactly one byte");
            }
            ss = Buffer.concat([ss, oneByte]);
        }
        else if (objTypeKey == VDXF_Data.DataInt16Key.vdxfid) {
            const oneShort = Buffer.alloc(2);
            oneShort.writeInt16LE(oneValValues[k]);
            ss = Buffer.concat([ss, oneShort]);
        }
        else if (objTypeKey == VDXF_Data.DataUint16Key.vdxfid) {
            const oneUShort = Buffer.alloc(2);
            oneUShort.writeUInt16LE(oneValValues[k]);
            ss = Buffer.concat([ss, oneUShort]);
        }
        else if (objTypeKey == VDXF_Data.DataInt32Key.vdxfid) {
            const oneInt = Buffer.alloc(4);
            oneInt.writeInt32LE(oneValValues[k]);
            ss = Buffer.concat([ss, oneInt]);
        }
        else if (objTypeKey == VDXF_Data.DataUint32Key.vdxfid) {
            const oneUInt = Buffer.alloc(4);
            oneUInt.writeUInt32LE(oneValValues[k]);
            ss = Buffer.concat([ss, oneUInt]);
        }
        else if (objTypeKey == VDXF_Data.DataInt64Key.vdxfid) {
            const oneInt64 = Buffer.alloc(8);
            oneInt64.writeIntLE(oneValValues[k], 0, 8);
            ss = Buffer.concat([ss, oneInt64]);
        }
        else if (objTypeKey == VDXF_Data.DataUint160Key.vdxfid) {
            const oneKey = (0, address_1.fromBase58Check)(oneValValues[k]).hash;
            ss = Buffer.concat([ss, oneKey]);
        }
        else if (objTypeKey == VDXF_Data.DataUint256Key.vdxfid) {
            const oneHash = Buffer.from(oneValValues[k], "hex");
            if (oneHash.length != 32) {
                throw new Error("contentmap: hash data must be exactly 32 bytes");
            }
            ss = Buffer.concat([ss, oneHash.reverse()]);
        }
        else if (objTypeKey == VDXF_Data.DataStringKey.vdxfid) {
            let length = 20;
            length += 1;
            const encodedLength = varuint_1.default.encodingLength(Buffer.from(oneValValues[k], "utf-8").length);
            length += varuint_1.default.encodingLength(encodedLength + Buffer.from(oneValValues[k], "utf-8").length);
            length += encodedLength;
            length += Buffer.from(oneValValues[k], "utf-8").length;
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(new bn_js_1.BN(1));
            writer.writeCompactSize(encodedLength + Buffer.from(oneValValues[k], "utf-8").length);
            writer.writeVarSlice(Buffer.from(oneValValues[k], "utf-8"));
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.DataByteVectorKey.vdxfid) {
            let length = 20;
            length += 1;
            const encodedLength = varuint_1.default.encodingLength(Buffer.from(oneValValues[k], "hex").length);
            length += varuint_1.default.encodingLength(encodedLength + Buffer.from(oneValValues[k], "hex").length);
            length += encodedLength;
            length += Buffer.from(oneValValues[k], "hex").length;
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(new bn_js_1.BN(1));
            writer.writeCompactSize(encodedLength + Buffer.from(oneValValues[k], "hex").length);
            writer.writeVarSlice(Buffer.from(oneValValues[k], "hex"));
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.DataCurrencyMapKey.vdxfid) {
            const destinations = Object.keys(oneValValues[k]);
            const values = Object.values(oneValValues[k]);
            const oneCurMap = new CurrencyValueMap_1.CurrencyValueMap({ value_map: new Map(destinations.map((key, index) => [key, new bn_js_1.BN(values[index])])), multivalue: true });
            let length = 20;
            length += 1;
            length += varuint_1.default.encodingLength(oneCurMap.getByteLength());
            length += oneCurMap.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(new bn_js_1.BN(1));
            writer.writeCompactSize(oneCurMap.getByteLength());
            writer.writeSlice(oneCurMap.toBuffer());
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.DataRatingsKey.vdxfid) {
            const oneRatingMap = Rating_1.Rating.fromJson(oneValValues[k]);
            let length = 20;
            length += varint_1.default.encodingLength(oneRatingMap.version);
            length += varuint_1.default.encodingLength(oneRatingMap.getByteLength());
            length += oneRatingMap.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(oneRatingMap.version);
            writer.writeCompactSize(oneRatingMap.getByteLength());
            writer.writeSlice(oneRatingMap.toBuffer());
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.DataTransferDestinationKey.vdxfid) {
            const transferDest = TransferDestination_1.TransferDestination.fromJson(oneValValues[k]);
            let length = 20;
            length += varint_1.default.encodingLength(transferDest.typeNoFlags());
            length += varuint_1.default.encodingLength(transferDest.getByteLength());
            length += transferDest.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(transferDest.typeNoFlags());
            writer.writeCompactSize(transferDest.getByteLength());
            writer.writeSlice(transferDest.toBuffer());
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.ContentMultiMapRemoveKey.vdxfid) {
            const transferDest = ContentMultiMapRemove_1.ContentMultiMapRemove.fromJson(oneValValues[k]);
            let length = 20;
            length += varint_1.default.encodingLength(transferDest.version);
            length += varuint_1.default.encodingLength(transferDest.getByteLength());
            length += transferDest.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(transferDest.version);
            writer.writeCompactSize(transferDest.getByteLength());
            writer.writeSlice(transferDest.toBuffer());
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.CrossChainDataRefKey.vdxfid) {
            const transferDest = CrossChainDataRef_1.CrossChainDataRef.fromJson(oneValValues[k]);
            let length = 20;
            length += varint_1.default.encodingLength(vdxf_1.VDXF_OBJECT_DEFAULT_VERSION);
            length += varuint_1.default.encodingLength(transferDest.getByteLength());
            length += transferDest.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(vdxf_1.VDXF_OBJECT_DEFAULT_VERSION);
            writer.writeCompactSize(transferDest.getByteLength());
            writer.writeSlice(transferDest.toBuffer());
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.DataDescriptorKey.vdxfid) {
            const descr = DataDescriptor_1.DataDescriptor.fromJson(oneValValues[k]);
            let length = 20;
            length += varint_1.default.encodingLength(descr.version);
            length += varuint_1.default.encodingLength(descr.getByteLength());
            length += descr.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(descr.version);
            writer.writeCompactSize(descr.getByteLength());
            writer.writeSlice(descr.toBuffer());
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.MMRDescriptorKey.vdxfid) {
            const descr = MMRDescriptor_1.MMRDescriptor.fromJson(oneValValues[k]);
            let length = 20;
            length += varint_1.default.encodingLength(descr.version);
            length += varuint_1.default.encodingLength(descr.getByteLength());
            length += descr.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
            writer.writeVarInt(descr.version);
            writer.writeCompactSize(descr.getByteLength());
            writer.writeSlice(descr.toBuffer());
            ss = Buffer.concat([ss, writer.buffer]);
        }
        else if (objTypeKey == VDXF_Data.SignatureDataKey.vdxfid) {
            const sigData = SignatureData_1.SignatureData.fromJson(oneValValues[k]);
            let length = 20;
            length += varint_1.default.encodingLength(sigData.version);
            length += varuint_1.default.encodingLength(sigData.getByteLength());
            length += sigData.getByteLength();
            const writer = new BufferWriter(Buffer.alloc(length));
            writer.writeSlice((0, address_1.fromBase58Check)(objTypeKey).hash);
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
};
VdxfUniValue.VDXFDataToUniValue = (buffer, offset = 0, pSuccess = null) => {
    const reader = new BufferReader(buffer, offset);
    let objectUni;
    try {
        let checkVal;
        let version = new bn_js_1.BN(0);
        let objSize = 0;
        checkVal = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        if (checkVal == VDXF_Data.DataCurrencyMapKey.vdxfid) {
            const oneCurrencyMap = new CurrencyValueMap_1.CurrencyValueMap();
            version = reader.readVarInt();
            objSize = reader.readCompactSize();
            reader.offset = oneCurrencyMap.fromBuffer(reader.buffer, reader.offset);
            if (oneCurrencyMap.isValid()) {
                objectUni = { [checkVal]: oneCurrencyMap.toJson() };
            }
        }
        else if (checkVal == VDXF_Data.DataRatingsKey.vdxfid) {
            const oneRatingObj = new Rating_1.Rating();
            version = reader.readVarInt();
            objSize = reader.readCompactSize();
            reader.offset = oneRatingObj.fromBuffer(reader.buffer, reader.offset);
            if (oneRatingObj.isValid()) {
                objectUni = { [checkVal]: oneRatingObj.toJson() };
            }
        }
        else if (checkVal == VDXF_Data.DataTransferDestinationKey.vdxfid) {
            const oneTransferDest = new TransferDestination_1.TransferDestination();
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
            let stringVal;
            version = reader.readVarInt();
            objSize = reader.readCompactSize();
            stringVal = reader.readVarSlice.toString();
            objectUni = { [checkVal]: stringVal };
        }
        else if (checkVal == VDXF_Data.DataByteVectorKey.vdxfid) {
            let vecVal;
            version = reader.readVarInt();
            objSize = reader.readCompactSize();
            vecVal = reader.readVarSlice();
            objectUni = { [checkVal]: vecVal.toString('hex') };
        }
        else if (checkVal == VDXF_Data.CrossChainDataRefKey.vdxfid) {
            const dataRef = new CrossChainDataRef_1.CrossChainDataRef();
            version = reader.readVarInt();
            objSize = reader.readCompactSize();
            reader.offset = dataRef.fromBuffer(reader.buffer, reader.offset);
            if (dataRef.isValid()) {
                objectUni = { [checkVal]: dataRef.toJson() };
            }
        }
        else if (checkVal == VDXF_Data.DataDescriptorKey.vdxfid) {
            const dataDescriptor = new DataDescriptor_1.DataDescriptor();
            version = reader.readVarInt();
            objSize = reader.readCompactSize();
            reader.offset = dataDescriptor.fromBuffer(reader.buffer, reader.offset);
            if (dataDescriptor.isValid()) {
                objectUni = { [checkVal]: dataDescriptor.toJson() };
            }
        }
        else if (checkVal == VDXF_Data.MMRDescriptorKey.vdxfid) {
            const mmrDescriptor = new MMRDescriptor_1.MMRDescriptor();
            version = reader.readVarInt();
            objSize = reader.readCompactSize();
            reader.offset = mmrDescriptor.fromBuffer(reader.buffer, reader.offset);
            if (mmrDescriptor.isValid()) {
                objectUni = { [checkVal]: mmrDescriptor.toJson() };
            }
        }
        else if (checkVal == VDXF_Data.SignatureDataKey.vdxfid) {
            const sigData = new SignatureData_1.SignatureData();
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
};
VdxfUniValue.VDXFDataToUniValueArray = (buffer, offset = 0) => {
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
};

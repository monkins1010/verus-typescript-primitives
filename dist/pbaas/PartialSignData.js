"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialSignData = void 0;
const bn_js_1 = require("bn.js");
const varint_1 = require("../utils/varint");
const bufferutils_1 = require("../utils/bufferutils");
const IdentityID_1 = require("./IdentityID");
const KeyID_1 = require("./KeyID");
const SaplingPaymentAddress_1 = require("./SaplingPaymentAddress");
const varuint_1 = require("../utils/varuint");
const Hash160_1 = require("../vdxf/classes/Hash160");
const vdxf_1 = require("../constants/vdxf");
const PartialMMRData_1 = require("./PartialMMRData");
const pbaas_1 = require("../constants/pbaas");
const address_1 = require("../utils/address");
const VdxfUniValue_1 = require("./VdxfUniValue");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class PartialSignData {
    constructor(data) {
        this.flags = data && data.flags ? data.flags : new bn_js_1.BN("0");
        this.createmmr = data && data.createmmr ? data.createmmr : false;
        if (data === null || data === void 0 ? void 0 : data.address) {
            if (!this.containsAddress())
                this.toggleContainsAddress();
            this.address = data.address;
        }
        if (data === null || data === void 0 ? void 0 : data.prefixstring) {
            if (!this.containsPrefixString())
                this.toggleContainsPrefixString();
            this.prefixstring = data.prefixstring;
        }
        if (data === null || data === void 0 ? void 0 : data.vdxfkeys) {
            if (!this.containsVdxfKeys())
                this.toggleContainsVdxfKeys();
            this.vdxfkeys = data.vdxfkeys;
        }
        if (data === null || data === void 0 ? void 0 : data.vdxfkeynames) {
            if (!this.containsVdxfKeyNames())
                this.toggleContainsVdxfKeyNames();
            this.vdxfkeynames = data.vdxfkeynames;
        }
        if (data === null || data === void 0 ? void 0 : data.hashtype) {
            this.hashtype = data.hashtype;
        }
        else
            this.hashtype = pbaas_1.DEFAULT_HASH_TYPE;
        if (data === null || data === void 0 ? void 0 : data.boundhashes) {
            if (!this.containsBoundhashes())
                this.toggleContainsBoundHashes();
            this.boundhashes = data.boundhashes;
        }
        if (data === null || data === void 0 ? void 0 : data.encrypttoaddress) {
            if (!this.containsEncrypttoAddress())
                this.toggleContainsEncryptToAddress();
            this.encrypttoaddress = data.encrypttoaddress;
        }
        if (data === null || data === void 0 ? void 0 : data.signature) {
            if (!this.containsCurrentSig())
                this.toggleContainsCurrentSig();
            this.signature = data.signature;
        }
        if ((data === null || data === void 0 ? void 0 : data.datatype) && (data === null || data === void 0 ? void 0 : data.data)) {
            if (!this.containsData())
                this.toggleContainsData();
            this.data = data.data;
            this.datatype = data.datatype;
        }
    }
    containsData() {
        return !!(this.flags.and(PartialSignData.CONTAINS_DATA).toNumber());
    }
    containsAddress() {
        return !!(this.flags.and(PartialSignData.CONTAINS_ADDRESS).toNumber());
    }
    containsEncrypttoAddress() {
        return !!(this.flags.and(PartialSignData.CONTAINS_ENCRYPTTOADDRESS).toNumber());
    }
    containsCurrentSig() {
        return !!(this.flags.and(PartialSignData.CONTAINS_CURRENTSIG).toNumber());
    }
    containsPrefixString() {
        return !!(this.flags.and(PartialSignData.CONTAINS_PREFIXSTRING).toNumber());
    }
    containsVdxfKeys() {
        return !!(this.flags.and(PartialSignData.CONTAINS_VDXFKEYS).toNumber());
    }
    containsVdxfKeyNames() {
        return !!(this.flags.and(PartialSignData.CONTAINS_VDXFKEYNAMES).toNumber());
    }
    containsBoundhashes() {
        return !!(this.flags.and(PartialSignData.CONTAINS_BOUNDHASHES).toNumber());
    }
    toggleContainsData() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_DATA);
    }
    toggleContainsAddress() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_ADDRESS);
    }
    toggleContainsEncryptToAddress() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_ENCRYPTTOADDRESS);
    }
    toggleContainsCurrentSig() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_CURRENTSIG);
    }
    toggleContainsPrefixString() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_PREFIXSTRING);
    }
    toggleContainsVdxfKeys() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_VDXFKEYS);
    }
    toggleContainsVdxfKeyNames() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_VDXFKEYNAMES);
    }
    toggleContainsBoundHashes() {
        this.flags = this.flags.xor(PartialSignData.CONTAINS_BOUNDHASHES);
    }
    isMMRData() {
        return this.datatype && this.datatype.eq(pbaas_1.DATA_TYPE_MMRDATA);
    }
    isVdxfData() {
        return this.datatype && this.datatype.eq(pbaas_1.DATA_TYPE_VDXFDATA);
    }
    getPartialSignDataByteLength() {
        function calculateVectorLength(items, getItemLength, varlength = true) {
            let totalLength = 0;
            totalLength += varuint_1.default.encodingLength(items.length);
            for (const item of items) {
                const itemLength = getItemLength(item);
                if (varlength)
                    totalLength += varuint_1.default.encodingLength(itemLength);
                totalLength += itemLength;
            }
            return totalLength;
        }
        let length = 0;
        length += varint_1.default.encodingLength(this.flags);
        if (this.containsAddress())
            length += this.address.getByteLength();
        if (this.containsPrefixString()) {
            const prefixLen = this.prefixstring.length;
            length += varuint_1.default.encodingLength(prefixLen);
            length += prefixLen;
        }
        if (this.containsVdxfKeys()) {
            length += calculateVectorLength(this.vdxfkeys, (vdxfkey) => vdxfkey.getByteLength(), false);
        }
        if (this.containsVdxfKeyNames()) {
            length += calculateVectorLength(this.vdxfkeynames, (vdxfname) => vdxfname.length);
        }
        length += varint_1.default.encodingLength(this.hashtype);
        if (this.containsBoundhashes()) {
            length += calculateVectorLength(this.boundhashes, (hash) => hash.length);
        }
        if (this.containsEncrypttoAddress()) {
            length += this.encrypttoaddress.getByteLength();
        }
        length += 1; // Createmmr boolean value
        if (this.containsData()) {
            length += varint_1.default.encodingLength(this.datatype);
            if (this.isMMRData()) {
                length += this.data.getByteLength();
            }
            else if (this.isVdxfData()) {
                length += this.data.getByteLength();
            }
            else {
                const datalen = this.data.length;
                length += varuint_1.default.encodingLength(datalen);
                length += datalen;
            }
        }
        return length;
    }
    getByteLength() {
        return this.getPartialSignDataByteLength();
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.flags = reader.readVarInt();
        if (this.containsAddress()) {
            const hash160 = new Hash160_1.Hash160SerEnt();
            hash160.fromBuffer(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH));
            if (hash160.version === vdxf_1.I_ADDR_VERSION) {
                this.address = hash160;
            }
            else if (hash160.version === vdxf_1.R_ADDR_VERSION) {
                this.address = hash160;
            }
            else
                throw new Error("Unrecognized address version");
        }
        if (this.containsPrefixString()) {
            this.prefixstring = reader.readVarSlice();
        }
        if (this.containsVdxfKeys()) {
            const count = reader.readCompactSize();
            this.vdxfkeys = [];
            for (let i = 0; i < count; i++) {
                const varSlice = reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH);
                const idId = new IdentityID_1.IdentityID();
                idId.fromBuffer(varSlice);
                this.vdxfkeys.push(idId);
            }
        }
        if (this.containsVdxfKeyNames()) {
            this.vdxfkeynames = reader.readVector();
        }
        this.hashtype = reader.readVarInt();
        if (this.containsBoundhashes()) {
            this.boundhashes = reader.readVector();
        }
        if (this.containsEncrypttoAddress()) {
            const saplingAddr = new SaplingPaymentAddress_1.SaplingPaymentAddress();
            reader.offset = saplingAddr.fromBuffer(reader.buffer, reader.offset);
            this.encrypttoaddress = saplingAddr;
        }
        this.createmmr = !!reader.readUInt8();
        if (this.containsData()) {
            this.datatype = reader.readVarInt();
            if (this.isMMRData()) {
                const partialMMRData = new PartialMMRData_1.PartialMMRData();
                reader.offset = partialMMRData.fromBuffer(reader.buffer, reader.offset);
                this.data = partialMMRData;
            }
            else if (this.isVdxfData()) {
                const vdxfData = new VdxfUniValue_1.VdxfUniValue();
                reader.offset = vdxfData.fromBuffer(reader.buffer, reader.offset);
                this.data = vdxfData;
            }
            else {
                this.data = reader.readVarSlice();
            }
        }
        return reader.offset;
    }
    toBuffer() {
        // Allocate the required size for partial sign data.
        // Make sure getPartialSignDataByteLength() accounts for all fields in your updated model.
        const writer = new BufferWriter(Buffer.alloc(this.getPartialSignDataByteLength()));
        // Serialize flags
        writer.writeVarInt(this.flags);
        // Address
        if (this.containsAddress()) {
            if (!this.address) {
                throw new Error("Address is required but not provided");
            }
            writer.writeSlice(this.address.toBuffer());
        }
        // Prefix string
        if (this.containsPrefixString()) {
            if (!this.prefixstring) {
                throw new Error("Prefix string is required but not provided");
            }
            writer.writeVarSlice(this.prefixstring);
        }
        // VDXF keys
        if (this.containsVdxfKeys()) {
            if (!this.vdxfkeys) {
                throw new Error("VDXF keys are required but not provided");
            }
            writer.writeCompactSize(this.vdxfkeys.length);
            for (const vdxfkey of this.vdxfkeys) {
                writer.writeSlice(vdxfkey.toBuffer());
            }
        }
        // VDXF key names
        if (this.containsVdxfKeyNames()) {
            if (!this.vdxfkeynames) {
                throw new Error("VDXF key names are required but not provided");
            }
            writer.writeVector(this.vdxfkeynames);
        }
        writer.writeVarInt(this.hashtype);
        // Bound hashes
        if (this.containsBoundhashes()) {
            if (!this.boundhashes) {
                throw new Error("Bound hashes are required but not provided");
            }
            writer.writeVector(this.boundhashes);
        }
        // Encrypt-to address (Sapling)
        if (this.containsEncrypttoAddress()) {
            if (!this.encrypttoaddress || !(this.encrypttoaddress instanceof SaplingPaymentAddress_1.SaplingPaymentAddress)) {
                throw new Error("Sapling payment address is required but not provided");
            }
            writer.writeSlice(this.encrypttoaddress.toBuffer());
        }
        // createmmr (boolean)
        writer.writeUInt8(this.createmmr ? 1 : 0);
        // Data
        if (this.containsData()) {
            if (!this.data || !this.datatype) {
                throw new Error("Data is required but not provided");
            }
            writer.writeVarInt(this.datatype);
            if (this.isMMRData()) {
                const mmrData = this.data;
                writer.writeSlice(mmrData.toBuffer());
            }
            else if (this.isVdxfData()) {
                const vdxfData = this.data;
                writer.writeSlice(vdxfData.toBuffer());
            }
            else {
                writer.writeVarSlice(this.data);
            }
        }
        return writer.buffer;
    }
    toJson() {
        return {
            flags: this.flags ? this.flags.toString(10) : undefined,
            address: this.address ? this.address.toAddress() : undefined,
            prefixstring: this.prefixstring ? this.prefixstring.toString('utf-8') : undefined,
            vdxfkeys: this.vdxfkeys ? this.vdxfkeys.map(x => x.toAddress()) : undefined,
            vdxfkeynames: this.vdxfkeynames ? this.vdxfkeynames.map(x => x.toString('utf-8')) : undefined,
            boundhashes: this.boundhashes ? this.boundhashes.map(x => x.toString('hex')) : undefined,
            hashtype: this.hashtype ? this.hashtype.toString(10) : undefined,
            encrypttoaddress: this.encrypttoaddress ? this.encrypttoaddress.toAddressString() : undefined,
            createmmr: this.createmmr,
            signature: this.signature ? this.signature.toString('base64') : undefined,
            datatype: this.datatype ? this.datatype.toString(10) : undefined,
            data: this.data ? this.data instanceof PartialMMRData_1.PartialMMRData ? this.data.toJson() : this.data.toString('hex') : undefined
        };
    }
    static fromJson(json) {
        let addr;
        if (json.address) {
            const { version, hash } = (0, address_1.fromBase58Check)(json.address);
            if (version === vdxf_1.I_ADDR_VERSION) {
                addr = new IdentityID_1.IdentityID(hash);
            }
            else if (version === vdxf_1.R_ADDR_VERSION) {
                addr = new KeyID_1.KeyID(hash);
            }
            else
                throw new Error("Unrecognized address version");
        }
        const datatype = json.datatype ? new bn_js_1.BN(json.datatype, 10) : undefined;
        return new PartialSignData({
            flags: json.flags ? new bn_js_1.BN(json.flags, 10) : undefined,
            address: addr,
            prefixstring: json.prefixstring ? Buffer.from(json.prefixstring, 'utf-8') : undefined,
            vdxfkeys: json.vdxfkeys ? json.vdxfkeys.map(x => IdentityID_1.IdentityID.fromAddress(x)) : undefined,
            vdxfkeynames: json.vdxfkeynames ? json.vdxfkeynames.map(x => Buffer.from(x, 'utf-8')) : undefined,
            boundhashes: json.boundhashes ? json.boundhashes.map(x => Buffer.from(x, 'hex')) : undefined,
            hashtype: json.hashtype ? new bn_js_1.BN(json.hashtype, 10) : undefined,
            encrypttoaddress: json.encrypttoaddress ? SaplingPaymentAddress_1.SaplingPaymentAddress.fromAddressString(json.encrypttoaddress) : undefined,
            createmmr: json.createmmr,
            signature: json.signature ? Buffer.from(json.signature, 'base64') : undefined,
            datatype: json.datatype ? new bn_js_1.BN(json.datatype, 10) : undefined,
            data: json.data ?
                typeof json.data === 'string' ?
                    Buffer.from(json.data, 'hex')
                    :
                        datatype && datatype.eq(pbaas_1.DATA_TYPE_MMRDATA) ?
                            PartialMMRData_1.PartialMMRData.fromJson(json.data)
                            :
                                VdxfUniValue_1.VdxfUniValue.fromJson(json.data)
                :
                    undefined
        });
    }
    toCLIJson() {
        const ret = {
            address: this.address ? this.address.toAddress() : undefined,
            prefixstring: this.prefixstring ? this.prefixstring.toString('utf-8') : undefined,
            vdxfkeys: this.vdxfkeys ? this.vdxfkeys.map(x => x.toAddress()) : undefined,
            vdxfkeynames: this.vdxfkeynames ? this.vdxfkeynames.map(x => x.toString('utf-8')) : undefined,
            boundhashes: this.boundhashes ? this.boundhashes.map(x => x.toString('hex')) : undefined,
            encrypttoaddress: this.encrypttoaddress ? this.encrypttoaddress.toAddressString() : undefined,
            createmmr: this.createmmr,
            signature: this.signature ? this.signature.toString('base64') : undefined
        };
        if (this.containsData() && this.data && this.datatype) {
            if (this.datatype.eq(pbaas_1.DATA_TYPE_MMRDATA)) {
                const mmrCLIJson = this.data.toCLIJson();
                ret['mmrdata'] = mmrCLIJson.mmrdata;
                ret['mmrsalt'] = mmrCLIJson.mmrsalt;
                ret['mmrhashtype'] = mmrCLIJson.mmrhashtype;
                ret['priormmr'] = mmrCLIJson.priormmr;
            }
            else if (this.datatype.eq(pbaas_1.DATA_TYPE_VDXFDATA)) {
                const uniJson = this.data.toJson();
                if (Array.isArray(uniJson))
                    throw new Error("VDXF univalue arrays not supported as sign data param");
                ret['vdxfdata'] = this.data.toJson();
            }
            else {
                const dataBuf = this.data;
                if (this.datatype.eq(pbaas_1.DATA_TYPE_FILENAME)) {
                    ret['filename'] = dataBuf.toString('utf-8');
                }
                else if (this.datatype.eq(pbaas_1.DATA_TYPE_MESSAGE)) {
                    ret['message'] = dataBuf.toString('utf-8');
                }
                else if (this.datatype.eq(pbaas_1.DATA_TYPE_HEX)) {
                    ret['messagehex'] = dataBuf.toString('hex');
                }
                else if (this.datatype.eq(pbaas_1.DATA_TYPE_BASE64)) {
                    ret['messagebase64'] = dataBuf.toString('base64');
                }
                else if (this.datatype.eq(pbaas_1.DATA_TYPE_DATAHASH)) {
                    ret['datahash'] = dataBuf.toString('hex');
                }
                else
                    throw new Error("Unrecognized datatype");
            }
        }
        if (this.hashtype.eq(pbaas_1.HASH_TYPE_SHA256)) {
            ret['hashtype'] = pbaas_1.HASH_TYPE_SHA256_NAME;
        }
        else if (this.hashtype.eq(pbaas_1.HASH_TYPE_SHA256D)) {
            ret['hashtype'] = pbaas_1.HASH_TYPE_SHA256D_NAME;
        }
        else if (this.hashtype.eq(pbaas_1.HASH_TYPE_BLAKE2B)) {
            ret['hashtype'] = pbaas_1.HASH_TYPE_BLAKE2B_NAME;
        }
        else if (this.hashtype.eq(pbaas_1.HASH_TYPE_KECCAK256)) {
            ret['hashtype'] = pbaas_1.HASH_TYPE_KECCAK256_NAME;
        }
        else
            throw new Error("Unrecognized hash type");
        for (const key in ret) {
            if (ret[key] === undefined)
                delete ret[key];
        }
        return ret;
    }
    static fromCLIJson(json) {
        let addr;
        if (json.address) {
            const { version, hash } = (0, address_1.fromBase58Check)(json.address);
            if (version === vdxf_1.I_ADDR_VERSION) {
                addr = new IdentityID_1.IdentityID(hash);
            }
            else if (version === vdxf_1.R_ADDR_VERSION) {
                addr = new KeyID_1.KeyID(hash);
            }
            else
                throw new Error("Unrecognized address version");
        }
        const config = {
            address: addr,
            prefixstring: json.prefixstring ? Buffer.from(json.prefixstring, 'utf-8') : undefined,
            vdxfkeys: json.vdxfkeys ? json.vdxfkeys.map(x => IdentityID_1.IdentityID.fromAddress(x)) : undefined,
            vdxfkeynames: json.vdxfkeynames ? json.vdxfkeynames.map(x => Buffer.from(x, 'utf-8')) : undefined,
            boundhashes: json.boundhashes ? json.boundhashes.map(x => Buffer.from(x, 'hex')) : undefined,
            encrypttoaddress: json.encrypttoaddress ? SaplingPaymentAddress_1.SaplingPaymentAddress.fromAddressString(json.encrypttoaddress) : undefined,
            createmmr: json.createmmr,
            signature: json.signature ? Buffer.from(json.signature, 'base64') : undefined
        };
        if ('mmrdata' in json) {
            const pmd = PartialMMRData_1.PartialMMRData.fromCLIJson({
                mmrdata: json.mmrdata,
                mmrsalt: json.mmrsalt,
                mmrhashtype: json.mmrhashtype,
                priormmr: json.priormmr
            });
            config.data = pmd;
            config.datatype = pbaas_1.DATA_TYPE_MMRDATA;
        }
        else if (json.filename) {
            config.data = Buffer.from(json.filename, 'utf-8');
            config.datatype = pbaas_1.DATA_TYPE_FILENAME;
        }
        else if (json.message) {
            config.data = Buffer.from(json.message, 'utf-8');
            config.datatype = pbaas_1.DATA_TYPE_MESSAGE;
        }
        else if (json.vdxfdata) {
            config.data = VdxfUniValue_1.VdxfUniValue.fromJson(json.vdxfdata);
            config.datatype = pbaas_1.DATA_TYPE_VDXFDATA;
        }
        else if (json.messagehex) {
            config.data = Buffer.from(json.messagehex, 'hex');
            config.datatype = pbaas_1.DATA_TYPE_HEX;
        }
        else if (json.messagebase64) {
            config.data = Buffer.from(json.messagebase64, 'base64');
            config.datatype = pbaas_1.DATA_TYPE_BASE64;
        }
        else if (json.datahash) {
            config.data = Buffer.from(json.datahash, 'hex');
            config.datatype = pbaas_1.DATA_TYPE_DATAHASH;
        }
        if (json.hashtype) {
            switch (json.hashtype) {
                case pbaas_1.HASH_TYPE_SHA256_NAME:
                    config.hashtype = pbaas_1.HASH_TYPE_SHA256;
                    break;
                case pbaas_1.HASH_TYPE_SHA256D_NAME:
                    config.hashtype = pbaas_1.HASH_TYPE_SHA256D;
                    break;
                case pbaas_1.HASH_TYPE_BLAKE2B_NAME:
                    config.hashtype = pbaas_1.HASH_TYPE_BLAKE2B;
                    break;
                case pbaas_1.HASH_TYPE_KECCAK256_NAME:
                    config.hashtype = pbaas_1.HASH_TYPE_KECCAK256;
                    break;
                default:
                    throw new Error("Unrecognized hash type");
            }
        }
        return new PartialSignData(config);
    }
}
exports.PartialSignData = PartialSignData;
PartialSignData.CONTAINS_DATA = new bn_js_1.BN("1", 10);
PartialSignData.CONTAINS_ADDRESS = new bn_js_1.BN("2", 10);
PartialSignData.CONTAINS_ENCRYPTTOADDRESS = new bn_js_1.BN("4", 10);
PartialSignData.CONTAINS_CURRENTSIG = new bn_js_1.BN("8", 10);
PartialSignData.CONTAINS_PREFIXSTRING = new bn_js_1.BN("16", 10);
PartialSignData.CONTAINS_VDXFKEYS = new bn_js_1.BN("32", 10);
PartialSignData.CONTAINS_VDXFKEYNAMES = new bn_js_1.BN("64", 10);
PartialSignData.CONTAINS_BOUNDHASHES = new bn_js_1.BN("128", 10);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateRequestDetails = void 0;
const varint_1 = require("../../../utils/varint");
const varuint_1 = require("../../../utils/varuint");
const bufferutils_1 = require("../../../utils/bufferutils");
const address_1 = require("../../../utils/address");
const vdxf_1 = require("../../../constants/vdxf");
const createHash = require("create-hash");
const PartialIdentity_1 = require("../../../pbaas/PartialIdentity");
const PartialSignData_1 = require("../../../pbaas/PartialSignData");
const bn_js_1 = require("bn.js");
const pbaas_1 = require("../../../pbaas");
const ResponseUri_1 = require("../ResponseUri");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class IdentityUpdateRequestDetails {
    constructor(data) {
        this.flags = data && data.flags ? data.flags : new bn_js_1.BN("1", 10);
        if (data === null || data === void 0 ? void 0 : data.requestid) {
            this.requestid = data.requestid;
        }
        else
            this.requestid = new bn_js_1.BN("0", 10);
        if (data === null || data === void 0 ? void 0 : data.createdat) {
            this.createdat = data.createdat;
        }
        if (data === null || data === void 0 ? void 0 : data.identity) {
            this.identity = data.identity;
        }
        if (data === null || data === void 0 ? void 0 : data.expiryheight) {
            if (!this.expires())
                this.toggleExpires();
            this.expiryheight = data.expiryheight;
        }
        if (data === null || data === void 0 ? void 0 : data.systemid) {
            if (!this.containsSystem())
                this.toggleContainsSystem();
            this.systemid = data.systemid;
        }
        if (data === null || data === void 0 ? void 0 : data.responseuris) {
            if (!this.containsResponseUris())
                this.toggleContainsResponseUris();
            this.responseuris = data.responseuris;
        }
        if (data === null || data === void 0 ? void 0 : data.signdatamap) {
            if (!this.containsSignData())
                this.toggleContainsSignData();
            this.signdatamap = data.signdatamap;
        }
        if (data === null || data === void 0 ? void 0 : data.salt) {
            if (!this.containsSalt())
                this.toggleContainsSalt();
            this.salt = data.salt;
        }
    }
    isValid() {
        return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_VALID).toNumber());
    }
    expires() {
        return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_EXPIRES).toNumber());
    }
    containsSignData() {
        return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA).toNumber());
    }
    containsSystem() {
        return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM).toNumber());
    }
    containsResponseUris() {
        return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS).toNumber());
    }
    containsSalt() {
        return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SALT).toNumber());
    }
    isTestnet() {
        return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_IS_TESTNET).toNumber());
    }
    toggleIsValid() {
        this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_VALID);
    }
    toggleExpires() {
        this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_EXPIRES);
    }
    toggleContainsSignData() {
        this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA);
    }
    toggleContainsSystem() {
        this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM);
    }
    toggleContainsResponseUris() {
        this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS);
    }
    toggleContainsSalt() {
        this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SALT);
    }
    toggleIsTestnet() {
        this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_IS_TESTNET);
    }
    toSha256() {
        return createHash("sha256").update(this.toBuffer()).digest();
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.flags);
        length += varint_1.default.encodingLength(this.requestid);
        length += varint_1.default.encodingLength(this.createdat);
        length += this.identity.getByteLength();
        if (this.expires())
            length += varint_1.default.encodingLength(this.expiryheight);
        if (this.containsSystem())
            length += this.systemid.getByteLength();
        if (this.containsResponseUris()) {
            length += varuint_1.default.encodingLength(this.responseuris.length);
            length += this.responseuris.reduce((sum, current) => sum + current.getByteLength(), 0);
        }
        if (this.containsSignData()) {
            length += varuint_1.default.encodingLength(this.signdatamap.size);
            for (const [key, value] of this.signdatamap.entries()) {
                length += (0, address_1.fromBase58Check)(key).hash.length;
                length += value.getByteLength();
            }
        }
        if (this.containsSalt()) {
            length += varuint_1.default.encodingLength(this.salt.length);
            length += this.salt.length;
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.flags);
        writer.writeVarInt(this.requestid);
        writer.writeVarInt(this.createdat);
        writer.writeSlice(this.identity.toBuffer());
        if (this.expires())
            writer.writeVarInt(this.expiryheight);
        if (this.containsSystem())
            writer.writeSlice(this.systemid.toBuffer());
        if (this.containsResponseUris()) {
            writer.writeArray(this.responseuris.map((x) => x.toBuffer()));
        }
        if (this.containsSignData()) {
            writer.writeCompactSize(this.signdatamap.size);
            for (const [key, value] of this.signdatamap.entries()) {
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeSlice(value.toBuffer());
            }
        }
        if (this.containsSalt()) {
            writer.writeVarSlice(this.salt);
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset = 0, parseVdxfObjects = false) {
        const reader = new BufferReader(buffer, offset);
        this.flags = reader.readVarInt();
        this.requestid = reader.readVarInt();
        this.createdat = reader.readVarInt();
        this.identity = new PartialIdentity_1.PartialIdentity();
        reader.offset = this.identity.fromBuffer(reader.buffer, reader.offset, parseVdxfObjects);
        if (this.expires()) {
            this.expiryheight = reader.readVarInt();
        }
        if (this.containsSystem()) {
            this.systemid = new pbaas_1.IdentityID();
            reader.offset = this.systemid.fromBuffer(reader.buffer, reader.offset);
        }
        if (this.containsResponseUris()) {
            this.responseuris = [];
            const urisLength = reader.readCompactSize();
            for (let i = 0; i < urisLength; i++) {
                const uri = new ResponseUri_1.ResponseUri();
                reader.offset = uri.fromBuffer(reader.buffer, reader.offset);
                this.responseuris.push(uri);
            }
        }
        if (this.containsSignData()) {
            this.signdatamap = new Map();
            const size = reader.readCompactSize();
            for (let i = 0; i < size; i++) {
                const key = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
                const value = new PartialSignData_1.PartialSignData();
                reader.offset = value.fromBuffer(reader.buffer, reader.offset);
                this.signdatamap.set(key, value);
            }
        }
        if (this.containsSalt()) {
            this.salt = reader.readVarSlice();
        }
        return reader.offset;
    }
    toJson() {
        let signDataJson;
        if (this.signdatamap) {
            signDataJson = {};
            for (const [key, psd] of this.signdatamap.entries()) {
                signDataJson[key] = psd.toJson();
            }
        }
        return {
            flags: this.flags ? this.flags.toString(10) : undefined,
            requestid: this.requestid ? this.requestid.toString(10) : undefined,
            createdat: this.createdat ? this.createdat.toString(10) : undefined,
            identity: this.identity ? this.identity.toJson() : undefined,
            expiryheight: this.expiryheight ? this.expiryheight.toString(10) : undefined,
            systemid: this.systemid ? this.systemid.toAddress() : undefined,
            responseuris: this.responseuris ? this.responseuris.map(x => x.toJson()) : undefined,
            signdatamap: signDataJson,
            salt: this.salt ? this.salt.toString('hex') : undefined
        };
    }
    static fromJson(json) {
        let signdatamap;
        if (json.signdatamap) {
            signdatamap = new Map();
            for (const key in json.signdatamap) {
                signdatamap.set(key, PartialSignData_1.PartialSignData.fromJson(json.signdatamap[key]));
            }
        }
        return new IdentityUpdateRequestDetails({
            flags: json.flags ? new bn_js_1.BN(json.flags, 10) : undefined,
            requestid: json.requestid ? new bn_js_1.BN(json.requestid, 10) : undefined,
            createdat: json.createdat ? new bn_js_1.BN(json.createdat, 10) : undefined,
            identity: json.identity ? PartialIdentity_1.PartialIdentity.fromJson(json.identity) : undefined,
            expiryheight: json.expiryheight ? new bn_js_1.BN(json.expiryheight, 10) : undefined,
            systemid: json.systemid ? pbaas_1.IdentityID.fromAddress(json.systemid) : undefined,
            responseuris: json.responseuris ? json.responseuris.map(x => ResponseUri_1.ResponseUri.fromJson(x)) : undefined,
            signdatamap,
            salt: json.salt ? Buffer.from(json.salt, 'hex') : undefined
        });
    }
    toCLIJson() {
        if (!this.identity)
            throw new Error("No identity details to update");
        const idJson = this.identity.toJson();
        if (this.containsSignData()) {
            for (const [key, psd] of this.signdatamap.entries()) {
                idJson.contentmultimap[key] = {
                    "data": psd.toCLIJson()
                };
            }
        }
        return idJson;
    }
    static fromCLIJson(json, systemid, requestid, createdat, expiryheight, responseuris, salt) {
        let identity;
        let signdatamap;
        if (json.contentmultimap) {
            const cmm = Object.assign({}, json.contentmultimap);
            for (const key in cmm) {
                if (cmm[key]['data']) {
                    if (!signdatamap)
                        signdatamap = new Map();
                    const psd = PartialSignData_1.PartialSignData.fromCLIJson(cmm[key]['data']);
                    signdatamap.set(key, psd);
                    delete cmm[key];
                }
            }
            json = Object.assign(Object.assign({}, json), { contentmultimap: cmm });
        }
        identity = PartialIdentity_1.PartialIdentity.fromJson(json);
        return new IdentityUpdateRequestDetails({
            identity,
            signdatamap,
            systemid: systemid ? pbaas_1.IdentityID.fromAddress(systemid) : undefined,
            requestid: requestid ? new bn_js_1.BN(requestid, 10) : undefined,
            createdat: createdat ? new bn_js_1.BN(createdat, 10) : undefined,
            expiryheight: expiryheight ? new bn_js_1.BN(expiryheight, 10) : undefined,
            responseuris: responseuris ? responseuris.map(x => ResponseUri_1.ResponseUri.fromJson(x)) : undefined,
            salt: salt ? Buffer.from(salt, 'hex') : undefined
        });
    }
}
exports.IdentityUpdateRequestDetails = IdentityUpdateRequestDetails;
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_INVALID = new bn_js_1.BN(0, 10);
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_VALID = new bn_js_1.BN(1, 10);
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA = new bn_js_1.BN(2, 10);
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_EXPIRES = new bn_js_1.BN(4, 10);
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS = new bn_js_1.BN(8, 10);
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM = new bn_js_1.BN(16, 10);
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SALT = new bn_js_1.BN(32, 10);
IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_IS_TESTNET = new bn_js_1.BN(64, 10);

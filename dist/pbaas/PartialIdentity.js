"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialIdentity = exports.PARTIAL_ID_CONTAINS_FLAGS = exports.PARTIAL_ID_CONTAINS_MINSIGS = exports.PARTIAL_ID_CONTAINS_CONTENT_MAP = exports.PARTIAL_ID_CONTAINS_PRIV_ADDRS = exports.PARTIAL_ID_CONTAINS_SYSTEM_ID = exports.PARTIAL_ID_CONTAINS_UNLOCK_AFTER = exports.PARTIAL_ID_CONTAINS_RECOVERY = exports.PARTIAL_ID_CONTAINS_REVOCATION = exports.PARTIAL_ID_CONTAINS_PRIMARY_ADDRS = exports.PARTIAL_ID_CONTAINS_CONTENT_MULTIMAP = exports.PARTIAL_ID_CONTAINS_PARENT = void 0;
const Identity_1 = require("./Identity");
const bn_js_1 = require("bn.js");
const varint_1 = require("../utils/varint");
const bufferutils_1 = require("../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
exports.PARTIAL_ID_CONTAINS_PARENT = new bn_js_1.BN("1", 10);
exports.PARTIAL_ID_CONTAINS_CONTENT_MULTIMAP = new bn_js_1.BN("2", 10);
exports.PARTIAL_ID_CONTAINS_PRIMARY_ADDRS = new bn_js_1.BN("4", 10);
exports.PARTIAL_ID_CONTAINS_REVOCATION = new bn_js_1.BN("8", 10);
exports.PARTIAL_ID_CONTAINS_RECOVERY = new bn_js_1.BN("16", 10);
exports.PARTIAL_ID_CONTAINS_UNLOCK_AFTER = new bn_js_1.BN("32", 10);
exports.PARTIAL_ID_CONTAINS_SYSTEM_ID = new bn_js_1.BN("64", 10);
exports.PARTIAL_ID_CONTAINS_PRIV_ADDRS = new bn_js_1.BN("128", 10);
exports.PARTIAL_ID_CONTAINS_CONTENT_MAP = new bn_js_1.BN("256", 10);
exports.PARTIAL_ID_CONTAINS_MINSIGS = new bn_js_1.BN("512", 10);
exports.PARTIAL_ID_CONTAINS_FLAGS = new bn_js_1.BN("1024", 10);
class PartialIdentity extends Identity_1.Identity {
    constructor(data) {
        super(data);
        this.contains = new bn_js_1.BN("0");
        if (data === null || data === void 0 ? void 0 : data.parent)
            this.toggleContainsParent();
        if (data === null || data === void 0 ? void 0 : data.system_id)
            this.toggleContainsSystemId();
        if (data === null || data === void 0 ? void 0 : data.content_map)
            this.toggleContainsContentMap();
        if (data === null || data === void 0 ? void 0 : data.content_multimap)
            this.toggleContainsContentMultiMap();
        if (data === null || data === void 0 ? void 0 : data.revocation_authority)
            this.toggleContainsRevocation();
        if (data === null || data === void 0 ? void 0 : data.recovery_authority)
            this.toggleContainsRecovery();
        if ((data === null || data === void 0 ? void 0 : data.private_addresses) && data.private_addresses.length > 0)
            this.toggleContainsPrivateAddresses();
        if (data === null || data === void 0 ? void 0 : data.unlock_after)
            this.toggleContainsUnlockAfter();
        if (data === null || data === void 0 ? void 0 : data.flags)
            this.toggleContainsFlags();
        if (data === null || data === void 0 ? void 0 : data.min_sigs)
            this.toggleContainsMinSigs();
        if ((data === null || data === void 0 ? void 0 : data.primary_addresses) && data.primary_addresses.length > 0)
            this.toggleContainsPrimaryAddresses();
    }
    serializeFlags() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_FLAGS).toNumber());
    }
    serializePrimaryAddresses() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_PRIMARY_ADDRS).toNumber());
    }
    serializeMinSigs() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_MINSIGS).toNumber());
    }
    serializeParent() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_PARENT).toNumber());
    }
    serializeSystemId() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_SYSTEM_ID).toNumber());
    }
    serializeContentMap() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_CONTENT_MAP).toNumber());
    }
    serializeContentMultiMap() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_CONTENT_MULTIMAP).toNumber());
    }
    serializeRevocation() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_REVOCATION).toNumber());
    }
    serializeRecovery() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_RECOVERY).toNumber());
    }
    serializePrivateAddresses() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_PRIV_ADDRS).toNumber());
    }
    serializeUnlockAfter() {
        return !!(this.contains.and(exports.PARTIAL_ID_CONTAINS_UNLOCK_AFTER).toNumber());
    }
    toggleContainsParent() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_PARENT);
    }
    toggleContainsSystemId() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_SYSTEM_ID);
    }
    toggleContainsContentMap() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_CONTENT_MAP);
    }
    toggleContainsContentMultiMap() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_CONTENT_MULTIMAP);
    }
    toggleContainsRevocation() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_REVOCATION);
    }
    toggleContainsRecovery() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_RECOVERY);
    }
    toggleContainsPrivateAddresses() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_PRIV_ADDRS);
    }
    toggleContainsUnlockAfter() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_UNLOCK_AFTER);
    }
    toggleContainsFlags() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_FLAGS);
    }
    toggleContainsMinSigs() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_MINSIGS);
    }
    toggleContainsPrimaryAddresses() {
        this.contains = this.contains.xor(exports.PARTIAL_ID_CONTAINS_PRIMARY_ADDRS);
    }
    // Function to toggle all flags
    toggleAllContains() {
        this.toggleContainsParent();
        this.toggleContainsSystemId();
        this.toggleContainsContentMap();
        this.toggleContainsContentMultiMap();
        this.toggleContainsRevocation();
        this.toggleContainsRecovery();
        this.toggleContainsPrivateAddresses();
        this.toggleContainsUnlockAfter();
        this.toggleContainsFlags();
        this.toggleContainsMinSigs();
        this.toggleContainsPrimaryAddresses();
    }
    getPartialIdentityByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.contains);
        length += super.getByteLength();
        return length;
    }
    getByteLength() {
        return this.getPartialIdentityByteLength();
    }
    fromBuffer(buffer, offset = 0, parseVdxfObjects = false) {
        const reader = new BufferReader(buffer, offset);
        this.contains = reader.readVarInt();
        reader.offset = super.fromBuffer(reader.buffer, reader.offset, parseVdxfObjects);
        return reader.offset;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getPartialIdentityByteLength()));
        writer.writeVarInt(this.contains);
        writer.writeSlice(super.toBuffer());
        return writer.buffer;
    }
}
exports.PartialIdentity = PartialIdentity;

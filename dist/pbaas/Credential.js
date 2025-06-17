"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credential = void 0;
const varuint_1 = require("../utils/varuint");
const address_1 = require("../utils/address");
const bufferutils_1 = require("../utils/bufferutils");
const bn_js_1 = require("bn.js");
const vdxf_1 = require("../constants/vdxf");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class Credential {
    constructor(data) {
        if (data) {
            this.version = data.version || Credential.CURRENT_VERSION;
            this.flags = data.flags || new bn_js_1.BN(0);
            this.credential_key = data.credential_key || '';
            this.credential = data.credential || {};
            this.scopes = data.scopes || {};
            this.label = data.label || '';
        }
    }
    calcFlags() {
        return ((this.label && this.label.length > 0) ? Credential.FLAG_LABEL_PRESENT : new bn_js_1.BN(0));
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    getByteLength() {
        let byteLength = 0;
        this.setFlags();
        byteLength += 4; // version uint32
        byteLength += 4; // flags uint32
        byteLength += 20; // credentialskey
        if (JSON.stringify(this.credential).length > Credential.MAX_JSON_STRING_LENGTH) {
            throw new Error(`Credential JSON exceeds maximum length of ${Credential.MAX_JSON_STRING_LENGTH} characters`);
        }
        byteLength += varuint_1.default.encodingLength(JSON.stringify(this.credential).length); // credential json length
        byteLength += Buffer.byteLength(JSON.stringify(this.credential), 'utf8'); // credential json utf8 length
        if (JSON.stringify(this.scopes).length > Credential.MAX_JSON_STRING_LENGTH) {
            throw new Error(`Scopes JSON exceeds maximum length of ${Credential.MAX_JSON_STRING_LENGTH} characters`);
        }
        byteLength += varuint_1.default.encodingLength(JSON.stringify(this.scopes).length); // scopes json length
        byteLength += Buffer.byteLength(JSON.stringify(this.scopes), 'utf8'); // scopes json utf8 length
        if (this.flags.and(Credential.FLAG_LABEL_PRESENT).gt(new bn_js_1.BN(0))) {
            if (this.label.length > Credential.MAX_JSON_STRING_LENGTH) {
                throw new Error(`Label exceeds maximum length of ${Credential.MAX_JSON_STRING_LENGTH} characters`);
            }
            byteLength += varuint_1.default.encodingLength(this.label.length); // label json length
            byteLength += Buffer.byteLength(this.label, 'utf8'); // label json utf8 length
        }
        return byteLength;
    }
    toBuffer() {
        const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()));
        bufferWriter.writeUInt32(this.version.toNumber());
        bufferWriter.writeUInt32(this.flags.toNumber());
        bufferWriter.writeSlice((0, address_1.fromBase58Check)(this.credential_key).hash);
        bufferWriter.writeVarSlice(Buffer.from(JSON.stringify(this.credential), 'utf8'));
        bufferWriter.writeVarSlice(Buffer.from(JSON.stringify(this.scopes), 'utf8'));
        if (this.flags.and(Credential.FLAG_LABEL_PRESENT).gt(new bn_js_1.BN(0))) {
            bufferWriter.writeVarSlice(Buffer.from(this.label, 'utf8'));
        }
        return bufferWriter.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.version = new bn_js_1.BN(reader.readUInt32());
        this.flags = new bn_js_1.BN(reader.readUInt32());
        ;
        this.credential_key = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        const credentialJson = reader.readVarSlice();
        this.credential = credentialJson.length > 0 ? JSON.parse(credentialJson.toString('utf8')) : {};
        const scopesJson = reader.readVarSlice();
        this.scopes = scopesJson.length > 0 ? JSON.parse(scopesJson.toString('utf8')) : {};
        this.label = reader.readVarSlice().toString('utf8');
        return reader.offset;
    }
    isValid() {
        return this.version.gte(Credential.FIRST_VERSION) &&
            this.version.lte(Credential.LAST_VERSION) &&
            (0, address_1.fromBase58Check)(this.credential_key).hash.length == 20;
    }
    toJson() {
        let retval = {
            version: this.version.toNumber(),
            flags: this.flags.toNumber(),
            credentialKey: this.credential_key,
            credential: this.credential,
            scopes: this.scopes,
            label: this.label
        };
        return retval;
    }
    static fromJson(data) {
        return new Credential({
            version: new bn_js_1.BN(data.version),
            flags: new bn_js_1.BN(data.flags),
            credential_key: data.credentialKey,
            credential: data.credential,
            scopes: data.scopes,
            label: data.label
        });
    }
}
exports.Credential = Credential;
Credential.FIRST_VERSION = new bn_js_1.BN(1);
Credential.LAST_VERSION = new bn_js_1.BN(1);
Credential.CURRENT_VERSION = new bn_js_1.BN(1);
Credential.FLAG_LABEL_PRESENT = new bn_js_1.BN(1);
Credential.MAX_JSON_STRING_LENGTH = 512;

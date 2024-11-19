"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attestation = void 0;
const varuint_1 = require("../../utils/varuint");
const bufferutils_1 = require("../../utils/bufferutils");
const createHash = require("create-hash");
const address_1 = require("../../utils/address");
const vdxf_1 = require("../../constants/vdxf");
const __1 = require("../");
const MMR_1 = require("./MMR");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class Attestation extends __1.VDXFObject {
    constructor(vdxfkey = "", data) {
        super(vdxfkey);
        if (data) {
            this.components = data.components || null;
            this.signatures = data.signatures || null;
            this.mmr = data.mmr || null;
        }
    }
    dataByteLength() {
        let byteLength = 0;
        byteLength += varuint_1.default.encodingLength(this.components.size);
        for (const [key, item] of this.components) {
            byteLength += varuint_1.default.encodingLength(key);
            byteLength += 20; //key
            byteLength += 32; //salt
            byteLength += varuint_1.default.encodingLength(Buffer.from(item.value, "utf8").length);
            byteLength += Buffer.from(item.value, "utf8").length;
        }
        const sigKeys = Object.keys(this.signatures);
        byteLength += varuint_1.default.encodingLength(sigKeys.length);
        for (const item of sigKeys) {
            byteLength += 20; //Attestor
            byteLength += 20; //System
            byteLength += varuint_1.default.encodingLength(Buffer.from(this.signatures[item].signature, "base64").length);
            byteLength += Buffer.from(this.signatures[item].signature, "base64").length;
        }
        if (this.mmr) {
            const nodes = this.mmr.db.nodes;
            const mmrKeys = Object.keys(nodes);
            byteLength += varuint_1.default.encodingLength(this.mmr.db.leafLength);
            byteLength += varuint_1.default.encodingLength(mmrKeys.length);
            for (const item of mmrKeys) {
                byteLength += varuint_1.default.encodingLength(parseInt(item));
                byteLength += varuint_1.default.encodingLength(nodes[item].length);
                byteLength += nodes[item].length;
            }
        }
        else {
            byteLength += varuint_1.default.encodingLength(0);
        }
        return byteLength;
    }
    toDataBuffer() {
        const bufferWriter = new BufferWriter(Buffer.alloc(this.dataByteLength()));
        bufferWriter.writeCompactSize(this.components.size);
        for (const [key, item] of this.components) {
            bufferWriter.writeCompactSize(key);
            bufferWriter.writeSlice((0, address_1.fromBase58Check)(item.attestationKey).hash);
            bufferWriter.writeSlice(Buffer.from(item.salt, "hex"));
            bufferWriter.writeVarSlice(Buffer.from(item.value, "utf8"));
        }
        const objKeys = Object.keys(this.signatures);
        bufferWriter.writeCompactSize(objKeys.length);
        for (const item of objKeys) {
            bufferWriter.writeSlice((0, address_1.fromBase58Check)(item).hash);
            bufferWriter.writeSlice((0, address_1.fromBase58Check)(this.signatures[item].system).hash);
            bufferWriter.writeVarSlice(Buffer.from(this.signatures[item].signature, "base64"));
        }
        if (this.mmr) {
            bufferWriter.writeCompactSize(this.mmr.db.leafLength);
            const nodes = this.mmr.db.nodes;
            const mmrKeys = Object.keys(nodes);
            bufferWriter.writeCompactSize(mmrKeys.length);
            for (const item of mmrKeys) {
                bufferWriter.writeCompactSize(parseInt(item));
                bufferWriter.writeVarSlice(nodes[item]);
            }
        }
        else {
            bufferWriter.writeCompactSize(0);
        }
        return bufferWriter.buffer;
    }
    fromDataBuffer(buffer, offset) {
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        const attestationsByteLength = reader.readCompactSize(); //dummy read
        const componentsLength = reader.readCompactSize();
        this.components = new Map();
        for (var i = 0; i < componentsLength; i++) {
            const key = reader.readCompactSize();
            const attestationKey = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
            const salt = Buffer.from(reader.readSlice(32)).toString('hex');
            const value = Buffer.from(reader.readVarSlice()).toString('utf8');
            this.components.set(key, { attestationKey, salt, value });
        }
        const signaturesSize = reader.readCompactSize();
        this.signatures = {};
        for (var i = 0; i < signaturesSize; i++) {
            const attestor = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
            const system = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
            const signature = reader.readVarSlice().toString('base64');
            this.signatures[attestor] = { signature, system };
        }
        const leafLength = reader.readCompactSize();
        if (leafLength > 0) {
            const referenceTreeLength = reader.readCompactSize();
            const nodes = {};
            for (var i = 0; i < referenceTreeLength; i++) {
                const nodeIndex = reader.readCompactSize();
                const signature = reader.readVarSlice();
                nodes[nodeIndex] = signature;
            }
            if (Object.keys(nodes).length > 0) {
                this.mmr = new MMR_1.MMR(new MMR_1.MemoryBasedDb(leafLength, nodes));
            }
        }
        return reader.offset;
    }
    createMMR() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mmr) {
                this.mmr = new MMR_1.MMR();
            }
            else {
                return this.mmr;
            }
            for (const [key, item] of this.components) {
                yield this.mmr.append(this.getHash(key), key);
            }
            return this.mmr;
        });
    }
    routeHash() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mmr) {
                yield this.createMMR();
            }
            return yield this.mmr.getRoot();
        });
    }
    // returns an attestation with a sparse MMR containing the leaves specified
    getProof(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemMaps = new Map();
            keys.forEach((key, index) => { itemMaps.set(index, this.components.get(key)); });
            const reply = new Attestation(this.vdxfkey, { components: itemMaps, mmr: yield this.mmr.getProof(keys, null), signatures: this.signatures });
            return reply;
        });
    }
    checkProof() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const [key, item] of this.components) {
                    const hash = this.getHash(key);
                    const proof = yield this.mmr.getProof([key], null);
                    if (hash !== proof) {
                        throw new Error("Attestation not found in MMR");
                    }
                }
            }
            catch (e) {
                throw new Error("Error checking MMR");
            }
        });
    }
    getHash(key) {
        const bufferWriter = new BufferWriter(Buffer.alloc(20 +
            32 +
            varuint_1.default.encodingLength(Buffer.from(this.components.get(key).value, "utf8").length) +
            Buffer.from(this.components.get(key).value, "utf8").length));
        bufferWriter.writeSlice((0, address_1.fromBase58Check)(this.components.get(key).attestationKey).hash);
        bufferWriter.writeSlice(Buffer.from(this.components.get(key).salt, "hex"));
        bufferWriter.writeCompactSize(Buffer.from(this.components.get(key).value, "utf8").length);
        bufferWriter.writeSlice(Buffer.from(this.components.get(key).value, "utf8"));
        return createHash("sha256").update(bufferWriter.buffer).digest();
    }
}
exports.Attestation = Attestation;

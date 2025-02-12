import varint from '../../../utils/varint'
import varuint from '../../../utils/varuint'
import bufferutils from '../../../utils/bufferutils'
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../../constants/vdxf';
import createHash = require('create-hash');
import { PartialIdentity } from '../../../pbaas/PartialIdentity';
import { PartialSignData, PartialSignDataCLIJson, PartialSignDataJson } from '../../../pbaas/PartialSignData';
import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { ContentMultiMapJson, IdentityID, VerusCLIVerusIDJson, VerusCLIVerusIDJsonBase } from '../../../pbaas';
import { ResponseUri, ResponseUriJson } from '../ResponseUri';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { UINT_256_LENGTH } from '../../../constants/pbaas';

const { BufferReader, BufferWriter } = bufferutils;

export type SignDataMap = Map<string, PartialSignData>;

export type VerusCLIVerusIDJsonWithData = VerusCLIVerusIDJsonBase<ContentMultiMapJson | { [key: string]: { data: PartialSignDataCLIJson } }>

export type IdentityUpdateRequestDetailsJson = {
  flags?: string;
  requestid?: string;
  createdat?: string;
  identity?: VerusCLIVerusIDJson;
  expiryheight?: string;
  systemid?: string;
  responseuris?: Array<ResponseUriJson>;
  signdatamap?: { [key: string]: PartialSignDataJson };
  salt?: string;
  txid?: string;
}

export class IdentityUpdateRequestDetails implements SerializableEntity {
  flags?: BigNumber;
  requestid?: BigNumber;              // ID of request, to be referenced in response
  createdat?: BigNumber;              // Unix timestamp of request creation
  identity?: PartialIdentity;         // Parts of the identity to update
  expiryheight?: BigNumber;           // Time after which update request will no longer be accepted
  systemid?: IdentityID;              // System that identity should be updated on (will default to VRSC/VRSCTEST if not present, depending on testnet flag)
  responseuris?: Array<ResponseUri>;  // Array of uris + type to send response to (type can be post, redirect, etc. depending on how response is expected to be received)
  signdatamap?: SignDataMap;          // Map of data to pass to signdata
  salt?: Buffer;                      // Optional salt
  txid?: Buffer;                      // 32 byte transaction ID of transaction that must be spent to update identity, on same system asked for in request
                                      // stored in natural order, if displayed as text make sure to reverse!

  static IDENTITY_UPDATE_REQUEST_INVALID = new BN(0, 10);
  static IDENTITY_UPDATE_REQUEST_VALID = new BN(1, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA = new BN(2, 10);
  static IDENTITY_UPDATE_REQUEST_EXPIRES = new BN(4, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS = new BN(8, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM = new BN(16, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_TXID = new BN(32, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SALT = new BN(64, 10);
  static IDENTITY_UPDATE_REQUEST_IS_TESTNET = new BN(128, 10);

  constructor (data?: {
    flags?: BigNumber,
    requestid?: BigNumber,
    createdat?: BigNumber,
    identity?: PartialIdentity,
    expiryheight?: BigNumber,
    systemid?: IdentityID,
    txid?: Buffer,
    responseuris?: Array<ResponseUri>,
    signdatamap?: SignDataMap,
    salt?: Buffer
  }) {
    this.flags = data && data.flags ? data.flags : new BN("1", 10);

    if (data?.requestid) {
      this.requestid = data.requestid;
    } else this.requestid = new BN("0", 10);

    if (data?.createdat) {
      this.createdat = data.createdat;
    } else this.createdat = new BN("0", 10);

    if (data?.identity) {
      this.identity = data.identity;
    }

    if (data?.expiryheight) {
      if (!this.expires()) this.toggleExpires();
      this.expiryheight = data.expiryheight;
    }

    if (data?.systemid) {
      if (!this.containsSystem()) this.toggleContainsSystem();
      this.systemid = data.systemid;
    }

    if (data?.txid) {
      if (!this.containsTxid()) this.toggleContainsTxid();
      this.txid = data.txid;
    }

    if (data?.responseuris) {
      if (!this.containsResponseUris()) this.toggleContainsResponseUris();
      this.responseuris = data.responseuris;
    }

    if (data?.signdatamap) {
      if (!this.containsSignData()) this.toggleContainsSignData();
      this.signdatamap = data.signdatamap;
    }

    if (data?.salt) {
      if (!this.containsSalt()) this.toggleContainsSalt();
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

  containsTxid() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_TXID).toNumber());
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

  toggleContainsTxid() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_TXID);
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

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    length += varint.encodingLength(this.requestid);

    length += varint.encodingLength(this.createdat);

    length += this.identity.getByteLength();

    if (this.expires()) length += varint.encodingLength(this.expiryheight);

    if (this.containsSystem()) length += this.systemid.getByteLength();

    if (this.containsTxid()) {
      length += UINT_256_LENGTH;
    }

    if (this.containsResponseUris()) {
      length += varuint.encodingLength(this.responseuris.length);
      length += this.responseuris.reduce(
        (sum: number, current: ResponseUri) => sum + current.getByteLength(),
        0
      );
    }

    if (this.containsSignData()) {
      length += varuint.encodingLength(this.signdatamap.size);
      for (const [key, value] of this.signdatamap.entries()) {
        length += fromBase58Check(key).hash.length;
        length += value.getByteLength();
      }
    }

    if (this.containsSalt()) {
      length += varuint.encodingLength(this.salt.length);
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

    if (this.expires()) writer.writeVarInt(this.expiryheight);

    if (this.containsSystem()) writer.writeSlice(this.systemid.toBuffer());

    if (this.containsTxid()) {
      if (this.txid.length !== UINT_256_LENGTH) throw new Error("invalid txid length");

      writer.writeSlice(this.txid);
    }

    if (this.containsResponseUris()) {
      writer.writeArray(this.responseuris.map((x) => x.toBuffer()));
    }

    if (this.containsSignData()) {
      writer.writeCompactSize(this.signdatamap.size);
      for (const [key, value] of this.signdatamap.entries()) {
        writer.writeSlice(fromBase58Check(key).hash);
        writer.writeSlice(value.toBuffer());
      }
    }

    if (this.containsSalt()) {
      writer.writeVarSlice(this.salt);
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0, parseVdxfObjects: boolean = true) {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    this.requestid = reader.readVarInt();

    this.createdat = reader.readVarInt();

    this.identity = new PartialIdentity();
    reader.offset = this.identity.fromBuffer(reader.buffer, reader.offset, parseVdxfObjects);
    
    if (this.expires()) {
      this.expiryheight = reader.readVarInt();
    }

    if (this.containsSystem()) {
      this.systemid = new IdentityID();
      reader.offset = this.systemid.fromBuffer(reader.buffer, reader.offset);
    }

    if (this.containsTxid()) {
      this.txid = reader.readSlice(UINT_256_LENGTH);
    }

    if (this.containsResponseUris()) {
      this.responseuris = [];
      const urisLength = reader.readCompactSize();

      for (let i = 0; i < urisLength; i++) {
        const uri = new ResponseUri();
        reader.offset = uri.fromBuffer(
          reader.buffer,
          reader.offset
        );
        this.responseuris.push(uri);
      }
    }

    if (this.containsSignData()) {
      this.signdatamap = new Map();

      const size = reader.readCompactSize();

      for (let i = 0; i < size; i++) {
        const key = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
        const value = new PartialSignData();

        reader.offset = value.fromBuffer(reader.buffer, reader.offset);
        
        this.signdatamap.set(key, value);
      }
    }

    if (this.containsSalt()) {
      this.salt = reader.readVarSlice()
    }

    return reader.offset;
  }

  toJson(): IdentityUpdateRequestDetailsJson {
    let signDataJson: { [key: string]: PartialSignDataJson };
    
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
      txid: this.txid ? (Buffer.from(this.txid.toString('hex'), 'hex').reverse()).toString('hex') : undefined,
      responseuris: this.responseuris ? this.responseuris.map(x => x.toJson()) : undefined,
      signdatamap: signDataJson,
      salt: this.salt ? this.salt.toString('hex') : undefined
    }
  }

  static fromJson(json: IdentityUpdateRequestDetailsJson): IdentityUpdateRequestDetails {
    let signdatamap: SignDataMap;

    if (json.signdatamap) {
      signdatamap = new Map();

      for (const key in json.signdatamap) {
        signdatamap.set(key, PartialSignData.fromJson(json.signdatamap[key]))
      }
    }

    return new IdentityUpdateRequestDetails({
      flags: json.flags ? new BN(json.flags, 10) : undefined,
      requestid: json.requestid ? new BN(json.requestid, 10) : undefined,
      createdat: json.createdat ? new BN(json.createdat, 10) : undefined,
      identity: json.identity ? PartialIdentity.fromJson(json.identity) : undefined,
      expiryheight: json.expiryheight ? new BN(json.expiryheight, 10) : undefined,
      systemid: json.systemid ? IdentityID.fromAddress(json.systemid) : undefined,
      responseuris: json.responseuris ? json.responseuris.map(x => ResponseUri.fromJson(x)) : undefined,
      signdatamap,
      salt: json.salt ? Buffer.from(json.salt, 'hex') : undefined,
      txid: json.txid ? Buffer.from(json.txid, 'hex').reverse() : undefined,
    })
  }

  toCLIJson(): VerusCLIVerusIDJsonWithData {
    if (!this.identity) throw new Error("No identity details to update");

    const idJson = (this.identity.toJson() as VerusCLIVerusIDJsonWithData);

    if (this.containsSignData()) {
      for (const [key, psd] of this.signdatamap.entries()) {
        idJson.contentmultimap[key] = {
          "data": psd.toCLIJson()
        }
      }
    }

    return idJson;
  }

  static fromCLIJson(
    json: VerusCLIVerusIDJsonWithData, 
    details?: IdentityUpdateRequestDetailsJson
  ): IdentityUpdateRequestDetails {
    let identity: PartialIdentity;
    let signdatamap: SignDataMap;

    if (json.contentmultimap) {
      const cmm = { ...json.contentmultimap };

      for (const key in cmm) {
        if (cmm[key]['data']) {
          if (!signdatamap) signdatamap = new Map();

          const psd = PartialSignData.fromCLIJson(cmm[key]['data']);
          signdatamap.set(key, psd);

          delete cmm[key];
        }
      }

      json = { ...json, contentmultimap: cmm }
    }

    identity = PartialIdentity.fromJson(json as VerusCLIVerusIDJson);

    return new IdentityUpdateRequestDetails({
      identity,
      signdatamap,
      systemid: details?.systemid ? IdentityID.fromAddress(details.systemid) : undefined,
      requestid: details?.requestid ? new BN(details.requestid, 10) : undefined,
      createdat: details?.createdat ? new BN(details.createdat, 10) : undefined,
      expiryheight: details?.expiryheight ? new BN(details.expiryheight, 10) : undefined,
      responseuris: details?.responseuris ? details.responseuris.map(x => ResponseUri.fromJson(x)) : undefined,
      salt: details?.salt ? Buffer.from(details.salt, 'hex') : undefined,
      txid: details?.txid ? Buffer.from(details.txid, 'hex').reverse() : undefined,
    })
  }
}
import varint from '../../../utils/varint'
import varuint from '../../../utils/varuint'
import bufferutils from '../../../utils/bufferutils'
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../../constants/vdxf';
import createHash = require('create-hash');
import { PartialIdentity } from '../../../pbaas/PartialIdentity';
import { PartialSignData } from '../../../pbaas/PartialSignData';
import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { IdentityID } from '../../../pbaas';
import { ResponseUri } from '../ResponseUri';
const { BufferReader, BufferWriter } = bufferutils;

export type SignDataMap = Map<string, PartialSignData>;

export class IdentityUpdateRequestDetails {
  flags?: BigNumber;
  requestid?: BigNumber;              // ID of request, to be referenced in response
  createdat?: BigNumber;              // Unix timestamp of request creation
  identity?: PartialIdentity;         // Parts of the identity to update
  expiryheight?: BigNumber;           // Time after which update request will no longer be accepted
  systemid?: IdentityID;              // System that identity should be updated on (will default to VRSC/VRSCTEST if not present, depending on testnet flag)
  responseuris?: Array<ResponseUri>;  // Array of uris + type to send response to (type can be post, redirect, etc. depending on how response is expected to be received)
  signdatamap?: SignDataMap;          // Map of data to pass to signdata
  salt?: Buffer;                      // Optional salt

  static IDENTITY_UPDATE_REQUEST_INVALID = new BN(0, 10);
  static IDENTITY_UPDATE_REQUEST_VALID = new BN(1, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA = new BN(2, 10);
  static IDENTITY_UPDATE_REQUEST_EXPIRES = new BN(4, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS = new BN(8, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM = new BN(16, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SALT = new BN(32, 10);
  static IDENTITY_UPDATE_REQUEST_IS_TESTNET = new BN(64, 10);

  constructor (data?: {
    flags?: BigNumber,
    requestid?: BigNumber,
    createdat?: BigNumber,
    identity?: PartialIdentity,
    expiryheight?: BigNumber,
    systemid?: IdentityID,
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
    }

    if (data?.identity) {
      this.identity = data.identity;
    }

    if (data?.expiryheight) {
      this.toggleExpires();
      this.expiryheight = data.expiryheight;
    }

    if (data?.systemid) {
      this.toggleContainsSystem();
      this.systemid = data.systemid;
    }

    if (data?.responseuris) {
      this.toggleContainsResponseUris();
      this.responseuris = data.responseuris;
    }

    if (data?.signdatamap) {
      this.toggleContainsSignData();
      this.signdatamap = data.signdatamap;
    }

    if (data?.salt) {
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

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    length += varint.encodingLength(this.requestid);

    length += varint.encodingLength(this.createdat);

    length += this.identity.getByteLength();

    if (this.expires()) length += varint.encodingLength(this.expiryheight);

    if (this.containsSystem()) length += this.systemid.getByteLength();

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

  fromBuffer(buffer: Buffer, offset: number = 0, parseVdxfObjects: boolean = false) {
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
}
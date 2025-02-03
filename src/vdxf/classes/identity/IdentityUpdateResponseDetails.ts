import varint from '../../../utils/varint'
import bufferutils from '../../../utils/bufferutils'
import createHash = require('create-hash');
import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { UINT_256_LENGTH } from '../../../constants/pbaas';
import varuint from '../../../utils/varuint';
const { BufferReader, BufferWriter } = bufferutils;

export type IdentityUpdateReponseDetailsJson = {
  flags: string,
  requestid: string,
  createdat: string,
  txid?: string,
  salt?: string
}

export class IdentityUpdateResponseDetails {
  flags?: BigNumber;
  requestid?: BigNumber;              // ID of request, to be referenced in response
  createdat?: BigNumber;              // Unix timestamp of request creation
  txid?: Buffer;                      // 32 byte transaction ID of identity update tx posted to blockchain, on same system asked for in request
                                      // stored in natural order, if displayed as text make sure to reverse!
  salt?: Buffer;                      // Optional salt

  static IDENTITY_UPDATE_RESPONSE_INVALID = new BN(0, 10);
  static IDENTITY_UPDATE_RESPONSE_VALID = new BN(1, 10);
  static IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID = new BN(2, 10);
  static IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT = new BN(4, 10);

  constructor (data?: {
    flags?: BigNumber,
    requestid?: BigNumber,
    createdat?: BigNumber,
    txid?: Buffer,
    salt?: Buffer
  }) {
    this.flags = data && data.flags ? data.flags : new BN("1", 10);

    if (data?.requestid) {
      this.requestid = data.requestid;
    } else this.requestid = new BN("0", 10);

    if (data?.createdat) {
      this.createdat = data.createdat;
    }

    if (data?.txid) {
      if (!this.containsTxid()) this.toggleContainsTxid();
      this.txid = data.txid;
    }

    if (data?.salt) {
      if (!this.containsSalt()) this.toggleContainsSalt();
      this.salt = data.salt;
    }
  }

  isValid() {
    return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_VALID).toNumber());
  }

  containsTxid() {
    return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID).toNumber());
  }

  containsSalt() {
    return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT).toNumber());
  }

  toggleIsValid() {
    this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_VALID);
  }

  toggleContainsTxid() {
    this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID);
  }

  toggleContainsSalt() {
    this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT);
  }

  toSha256() {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    length += varint.encodingLength(this.requestid);

    length += varint.encodingLength(this.createdat);

    if (this.containsTxid()) {
      length += UINT_256_LENGTH;
    }

    if (this.containsSalt()) {
      const saltLen = this.salt.length;

      length += varuint.encodingLength(saltLen);
      length += saltLen;
    }

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeVarInt(this.flags);

    writer.writeVarInt(this.requestid);

    writer.writeVarInt(this.createdat);

    if (this.containsTxid()) {
      if (this.txid.length !== UINT_256_LENGTH) throw new Error("invalid txid length");

      writer.writeSlice(this.txid);
    }

    if (this.containsSalt()) {
      writer.writeVarSlice(this.salt);
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    this.requestid = reader.readVarInt();

    this.createdat = reader.readVarInt();

    if (this.containsTxid()) {
      this.txid = reader.readSlice(UINT_256_LENGTH);
    }

    if (this.containsSalt()) {
      this.salt = reader.readVarSlice();
    }

    return reader.offset;
  }

  toJson(): IdentityUpdateReponseDetailsJson {
    return {
      flags: this.flags.toString(10),
      requestid: this.requestid.toString(10),
      createdat: this.createdat.toString(10),
      txid: this.containsTxid() ? (Buffer.from(this.txid.toString('hex'), 'hex').reverse()).toString('hex') : undefined,
      salt: this.containsSalt() ? this.salt.toString('hex') : undefined
    }
  }

  static fromJson(json: IdentityUpdateReponseDetailsJson): IdentityUpdateResponseDetails {
    return new IdentityUpdateResponseDetails({
      flags: new BN(json.flags, 10),
      requestid: new BN(json.requestid, 10),
      createdat: new BN(json.createdat, 10),
      txid: json.txid ? Buffer.from(json.txid, 'hex').reverse() : undefined,
      salt: json.salt ? Buffer.from(json.salt, 'hex') : undefined
    });
  }
}
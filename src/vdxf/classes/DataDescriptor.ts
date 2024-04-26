import { BigNumber } from '../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { BufferDataVdxfObject } from '../index';
import { VDXFKeyInterface } from "../keys"
import varint from '../../utils/varint'
import varuint from '../../utils/varuint'
import bufferutils from '../../utils/bufferutils'
const { BufferReader, BufferWriter } = bufferutils
import { isHexString } from '../../utils/string';
import { fromBase58Check, toBase58Check } from '../../utils/address';
import { CurrencyValueMap } from '../../pbaas/CurrencyValueMap';
import { Rating } from '../../pbaas/Rating';
import { TransferDestination } from '../../pbaas/TransferDestination';
import { ContentMultiMapRemove } from '../../pbaas/ContentMultiMapRemove';
import { CrossChainDataRef } from './CrossChainDataRef';
import { VDXF_OBJECT_DEFAULT_VERSION, HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../constants/vdxf';
import { SignatureData } from './SignatureData';

export class DataDescriptor {

  static VERSION_INVALID = new BN(0);
  static VERSION_FIRST = new BN(1);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  static FLAG_ENCRYPTED_DATA = new BN(1);
  static FLAG_SALT_PRESENT = new BN(2);
  static FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT = new BN(4);
  static FLAG_INCOMING_VIEWING_KEY_PRESENT = new BN(8);
  static FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT = new BN(0x10);
  static FLAG_LABEL_PRESENT = new BN(0x20);
  static FLAG_MIME_TYPE_PRESENT = new BN(0x40);
  static FLAG_MASK = (DataDescriptor.FLAG_ENCRYPTED_DATA.add(
    DataDescriptor.FLAG_SALT_PRESENT).add(
      DataDescriptor.FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT).add(
        DataDescriptor.FLAG_INCOMING_VIEWING_KEY_PRESENT).add(
          DataDescriptor.FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT).add(
            DataDescriptor.FLAG_LABEL_PRESENT).add(
              DataDescriptor.FLAG_MIME_TYPE_PRESENT));

  version: BigNumber;
  flags: BigNumber;
  objectdata: Buffer; // either direct data or serialized UTXORef +offset, length, and/or other type of info for different links
  label: string;                  // label associated with this data
  mimeType: string;               // optional mime type
  salt: Buffer;    // encryption public key, data only present if encrypted or data referenced by unencrypted link is encrypted
  epk: Buffer;    // encryption public key, data only present if encrypted or data referenced by unencrypted link is encrypted
  ivk: Buffer;     // incoming viewing key, optional and contains data only if full viewing key is published at this encryption level
  ssk: Buffer;    // specific symmetric key, optional and only to decrypt this linked sub-object

  constructor(data?: {
    version?: BigNumber,
    flags?: BigNumber,
    objectdata?: Buffer,
    label?: string,
    mimeType?: string,
    salt?: Buffer,
    epk?: Buffer,
    ivk?: Buffer,
    ssk?: Buffer
  }) {
    this.flags = new BN(0);
    this.version = DataDescriptor.DEFAULT_VERSION;

    if (data != null) {
      if (data.flags != null) this.flags = data.flags
      if (data.version != null) this.version = data.version
      if (data.objectdata != null) this.objectdata = data.objectdata
      if (data.label != null) this.label = data.label;
      if (data.mimeType != null) this.mimeType = data.mimeType;
      if (data.salt != null) this.salt = data.salt;

      if (data.epk != null) this.epk = data.epk;
      if (data.ivk != null) this.ivk = data.ivk;
      if (data.ssk != null) this.ssk = data.ssk;

      if (this.label && this.label.length > 64) {
        this.label = this.label.slice(0, 64);
      }
      if (this.mimeType && this.mimeType.length > 128) {
        this.mimeType = this.mimeType.slice(0, 128);
      }

      this.SetFlags();

    }
  }

  static fromJson(data: any): DataDescriptor {

    const newDataDescriptor = new DataDescriptor();

    if (data != null) {
      if (data.flags != null) newDataDescriptor.flags = new BN(data.flags)
      if (data.version != null) newDataDescriptor.version = new BN(data.version)
      if (data.objectdata != null) newDataDescriptor.objectdata = VectorEncodeVDXFUni(data.objectdata)
      if (data.label != null) newDataDescriptor.label = data.label;
      if (data.mimetype != null) newDataDescriptor.mimeType = data.mimetype;
      if (data.salt != null) newDataDescriptor.salt = Buffer.from(data.salt, 'hex');
      if (data.epk != null) newDataDescriptor.epk = Buffer.from(data.epk, 'hex');
      if (data.ivk != null) newDataDescriptor.ivk = Buffer.from(data.ivk, 'hex');
      if (data.ssk != null) newDataDescriptor.ssk = Buffer.from(data.ssk, 'hex');

      if (newDataDescriptor.label && newDataDescriptor.label.length > 64) {
        newDataDescriptor.label = newDataDescriptor.label.slice(0, 64);
      }
      if (newDataDescriptor.mimeType && newDataDescriptor.mimeType.length > 128) {
        newDataDescriptor.mimeType = newDataDescriptor.mimeType.slice(0, 128);
      }
    };

    newDataDescriptor.SetFlags();

    return newDataDescriptor;

  }

  DecodeHashVector(): Array<Buffer> {

    const vdxfData = new VDXF_Data("","");
    vdxfData.fromBuffer(this.objectdata);
    const hashes = [];

    if (vdxfData.vdxfkey == VDXF_Data.VectorUint256Key().vdxfid) {
      const reader = new BufferReader(Buffer.from(vdxfData.data, 'hex'));
      const count = reader.readVarInt();
      for (let i = 0; i < count.toNumber(); i++) {
        hashes.push(reader.readSlice(32));
      }
    }
    return hashes;

  }

  byteLength(): number {

    let length = 0;

    length += varint.encodingLength(this.version);
    length += varint.encodingLength(this.flags);
    length += varuint.encodingLength(this.objectdata.length);
    length += this.objectdata.length;

    if (this.HasLabel()) {
      if (this.label.length > 64) {
        throw new Error("Label too long");
      }
      length += varuint.encodingLength(this.label.length);
      length += this.label.length;
    }

    if (this.HasMIME()) {
      if (this.mimeType.length > 128) {
        throw new Error("MIME type too long");
      }
      length += varuint.encodingLength(this.mimeType.length);
      length += this.mimeType.length;
    }

    if (this.HasSalt()) {
      length += varuint.encodingLength(this.salt.length);
      length += this.salt.length;
    }

    if (this.HasEPK()) {
      length += varuint.encodingLength(this.epk.length);
      length += this.epk.length;
    }

    if (this.HasIVK()) {
      length += varuint.encodingLength(this.ivk.length);
      length += this.ivk.length;
    }

    if (this.HasSSK()) {
      length += varuint.encodingLength(this.ssk.length);
      length += this.ssk.length;
    }
    return length;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.byteLength()));

    writer.writeVarInt(this.version);
    writer.writeVarInt(this.flags);
    writer.writeVarSlice(this.objectdata);

    if (this.HasLabel()) {
      writer.writeVarSlice(Buffer.from(this.label));
    }

    if (this.HasMIME()) {
      writer.writeVarSlice(Buffer.from(this.mimeType));
    }

    if (this.HasSalt()) {
      writer.writeVarSlice(this.salt);
    }

    if (this.HasEPK()) {
      writer.writeVarSlice(this.epk);
    }

    if (this.HasIVK()) {
      writer.writeVarSlice(this.ivk);
    }

    if (this.HasSSK()) {
      writer.writeVarSlice(this.ssk);
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0): number {
    const reader = new BufferReader(buffer, offset);
    this.version = reader.readVarInt();
    this.flags = reader.readVarInt();
    this.objectdata = reader.readVarSlice();

    if (this.HasLabel()) {
      this.label = reader.readVarSlice().toString();
    }

    if (this.HasMIME()) {
      this.mimeType = reader.readVarSlice().toString();
    }

    if (this.HasSalt()) {
      this.salt = reader.readVarSlice();
    }

    if (this.HasEPK()) {
      this.epk = reader.readVarSlice();
    }

    if (this.HasIVK()) {
      this.ivk = reader.readVarSlice();
    }

    if (this.HasSSK()) {
      this.ssk = reader.readVarSlice();
    }
    return reader.offset;

  }

  HasEncryptedData(): boolean {
    return this.flags.and(DataDescriptor.FLAG_ENCRYPTED_DATA).gt(new BN(0));
  }

  HasSalt(): boolean {
    return this.flags.and(DataDescriptor.FLAG_SALT_PRESENT).gt(new BN(0));
  }

  HasEPK(): boolean {
    return this.flags.and(DataDescriptor.FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT).gt(new BN(0));
  }

  HasMIME(): boolean {
    return this.flags.and(DataDescriptor.FLAG_MIME_TYPE_PRESENT).gt(new BN(0));
  }

  HasIVK(): boolean {
    return this.flags.and(DataDescriptor.FLAG_INCOMING_VIEWING_KEY_PRESENT).gt(new BN(0));
  }

  HasSSK(): boolean {
    return this.flags.and(DataDescriptor.FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT).gt(new BN(0));
  }

  HasLabel(): boolean {
    return this.flags.and(DataDescriptor.FLAG_LABEL_PRESENT).gt(new BN(0));
  }

  CalcFlags(): BigNumber {
    return this.flags.and(DataDescriptor.FLAG_ENCRYPTED_DATA).add
      (this.label ? DataDescriptor.FLAG_LABEL_PRESENT : new BN(0)).add
      (this.mimeType ? DataDescriptor.FLAG_MIME_TYPE_PRESENT : new BN(0)).add
      (this.salt ? DataDescriptor.FLAG_SALT_PRESENT : new BN(0)).add
      (this.epk ? DataDescriptor.FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT : new BN(0)).add
      (this.ivk ? DataDescriptor.FLAG_INCOMING_VIEWING_KEY_PRESENT : new BN(0)).add
      (this.ssk ? DataDescriptor.FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT : new BN(0));
  }

  SetFlags() {
    this.flags = this.CalcFlags();
  }

  IsValid(): boolean {
    return this.version.gte(DataDescriptor.FIRST_VERSION) && this.version.lte(DataDescriptor.LAST_VERSION) && (this.flags.and(new BN(~DataDescriptor.FLAG_MASK)).eq(new BN(0)));
  }

};

// VDXF data that describes an encrypted chunk of data
export class VDXF_Data extends BufferDataVdxfObject {
  constructor(data: string, key: string) {
    super(data, key);

  }

  static DataByteKeyName(): string {
    return "vrsc::data.type.byte";
  }
  static DataByteKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iBXUHbh4iacbeZnzDRxishvBSrYk2S2k7t",
      "indexid": "xGMakQ89ZtqGGjg257csr6SiUWZksGmjWp",
      "hash160result": "2e97a8bba443773812341e1d761530d3bba04f58",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.byte"
      }
    }
  }
  static DataInt16KeyName(): string {
    return "vrsc::data.type.int16";
  }
  static DataInt16Key(): VDXFKeyInterface {
    return {
      "vdxfid": "iDtTv3wf1Vk3M2Y46RjLPKtttx5hydwtY1",
      "indexid": "xJiaNrNjroxhyCR5x7PVMiRRvc6ipg6N9g",
      "hash160result": "ee334ebd432db0b24cc2702eda61c28ff44d3872",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.int16"
      }
    }
  }
  static DataUint16KeyName(): string {
    return "vrsc::data.type.uint16";
  }
  static DataUint16Key(): VDXFKeyInterface {
    return {
      "vdxfid": "iHn7urT2yVfS7pQn6WGAmCVWh4HBLV24n3",
      "indexid": "xNcENet7pot6jzHoxBvKjb23iiJCGpekDk",
      "hash160result": "5cfc322d2a216145f7b82714115e7953269de59c",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.uint16"
      }
    }
  }
  static DataInt32KeyName(): string {
    return "vrsc::data.type.int32";
  }
  static DataInt32Key(): VDXFKeyInterface {
    return {
      "vdxfid": "iHpLPprRDv3H5H3ZMaJ9nyHFzkG9xJWZDb",
      "indexid": "xNeSrdHW5EFwhSvbDFxJmMoo2QHAtoEaEM",
      "hash160result": "3e9ba478b23b13232f28d21051d907ce8fdd509d",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.int32"
      }
    }
  }
  static DataUint32KeyName(): string {
    return "vrsc::data.type.uint32";
  }
  static DataUint32Key(): VDXFKeyInterface {
    return {
      "vdxfid": "iKSj5zhd6cSsLudaGhtfmisRNgEM7SPFWY",
      "indexid": "xQGqYo8hwvfXy5Wc8PYpk7PxQLFMwfP7Fp",
      "hash160result": "f279818aeb4fe768956b350d1fc7216ca0e82aaf",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.uint32"
      }
    }
  }
  static DataInt64KeyName(): string {
    return "vrsc::data.type.int64";
  }
  static DataInt64Key(): VDXFKeyInterface {
    return {
      "vdxfid": "iKB3TGi9Dg5HZ4nQAgLQAgp3tuXBaRKHpC",
      "indexid": "xQ19v59E4zHxBEfS2MzZ95LavZYCTTeuyg",
      "hash160result": "ab3705f8a7fae59786ef897b014df85fcd9533ac",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.int64"
      }
    }

  }
  static DataUint64KeyName(): string {
    return "vrsc::data.type.uint64";
  }
  static DataUint64Key(): VDXFKeyInterface {
    return {
      "vdxfid": "iPamkQf38AeGQ8z4zSsZL7t9kXMeUkYLJL",
      "indexid": "xUQtDD67yUrw2Js6r8XiJWQgnBNfNeeoUq",
      "hash160result": "bb2ae9ed3e9f400def0724937fbf65f23ef690dc",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.uint64"
      }
    }

  }
  static DataUint160KeyName(): string {
    return "vrsc::data.type.uint160";
  }
  static DataUint160Key(): VDXFKeyInterface {
    return {
      "vdxfid": "iAAwdbLyKYL39nJ1eQHaHtb75krg4mV1Lq",
      "indexid": "xF146Pn4ArYhmxB3W5wjGH7e7Qsgx9bkpj",
      "hash160result": "d97d2295d4c73f6f6f0697c8086bd822d6977549",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.uint160"
      }
    }

  }
  static DataUint256KeyName(): string {
    return "vrsc::data.type.uint256";
  }
  static DataUint256Key(): VDXFKeyInterface {
    return {
      "vdxfid": "i8k7g7z6grtGYrNZmZr5TQ872aHssXuuua",
      "indexid": "xDaE8vRBYB6wB2FbdFWERnee4EJtjbCtMM",
      "hash160result": "939b27bea698d180237c40b2194025acc673cb39",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.uint256"
      }
    }

  }
  static DataStringKeyName(): string {
    return "vrsc::data.type.string";
  }
  static DataStringKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c",
      "indexid": "xPwgY6oPdusaAgNK3u5yHCQG5NsHEcBpi5",
      "hash160result": "e5c061641228a399169211e666de18448b7b8bab",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.string"
      }
    }

  }
  // this is a key for a typed vector, which will have the object type key following the vector key
  static DataVectorKeyName(): string {
    return "vrsc::data.type.vector";
  }
  static DataVectorKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iAEShwk1xjdGhaUSz3Maa2XR32o3vRuHq7",
      "indexid": "xF4ZAkB6p3qwKkMUqj1jYR3x4gp4mGz657",
      "hash160result": "503875b0dc301189a98927d3ece56c5f921c1f4a",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.vector"
      }
    }
  }
  static DataByteVectorKeyName(): string {
    return "vrsc::data.type.bytevector";
  }
  static DataByteVectorKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iKMhRLX1JHQihVZx2t2pAWW2uzmK6AzwW3",
      "indexid": "xQBot8x69bdPKfSytZgy8u2ZwenKzVjR4X",
      "hash160result": "cc3ae6466006629f5105f71325bb2a19107037ae",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.bytevector"
      }
    }

  }
  static DataInt32VectorKeyName(): string {
    return "vrsc::data.type.int32vector";
  }
  static DataInt32VectorKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iJZt2fcUv1iivbfC3tuPuefabcTppQEoVq",
      "indexid": "xPPzVU3ZmKwPYmYDuaZYt3C7dGUqk939N7",
      "hash160result": "c0847f3025c408059b5a8f6a9e414a8ed8288da5",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.int32vector"
      }
    }
  }
  static DataInt64VectorKeyName(): string {
    return "vrsc::data.type.int64vector";
  }
  static DataInt64VectorKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i4qtYkFS9iNyu2AkqwoSn1xyCdfH9PUvak",
      "indexid": "x9g11YgX12beXC3nhdTbkQVWEHgJ2jqfz1",
      "hash160result": "c6219ea13884987453692cb14c72d5f6a47c020f",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.int64vector"
      }
    }

  }
  static DataCurrencyMapKeyName(): string {
    return "vrsc::data.type.object.currencymap";
  }
  static DataCurrencyMapKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iMrGhzkZq5fpWWSa1RambRySFPb7CuvKuX",
      "indexid": "xSgPAoBegPtV8gKbs7EvZpVyH3c858ZUvL",
      "hash160result": "25db70c2fcae2571f89201181bec04587e1f8fc9",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.object.currencymap"
      }
    }

  }
  static DataRatingsKeyName(): string {
    return "vrsc::data.type.object.ratings";
  }
  static DataRatingsKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iHJComZUXXGniLkDhjYprWYEN8qvQGDoam",
      "indexid": "xN8KGZzZNqVTLWdFZRCypu4mPnrwHFKbCK",
      "hash160result": "32cad57ff1dc5db4b5ba573ce01bc9c89b0d9e97",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.object.ratings"
      }
    }
  }
  static DataURLKeyName(): string {
    return "vrsc::data.type.object.url";
  }
  static DataURLKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iJ7xdhJTJAvJubNnSJFXyA3jujzqGxjLuZ",
      "indexid": "xNx56VjY9V8yXmFpHyugwYaGwQ1rCt6J9W",
      "hash160result": "7748bfaf53dd2ff63ed5f73a41174c360f30a6a0",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.object.url"
      }
    }
  }
  static DataTransferDestinationKeyName(): string {
    return "vrsc::data.type.object.transferdestination";
  }
  static DataTransferDestinationKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i91L6zwZQrkbNVMB1AZ1Z671qybexRmeVK",
      "indexid": "xDqSZoNeGAyFzfECrrDAXUdYsdcfs3Zuku",
      "hash160result": "92f38773849383146037b16a48ea350c1c11ac3c",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.object.transferdestination"
      }
    }
  }
  static UTXORefKeyName(): string {
    return "vrsc::data.type.object.utxoref";
  }
  static UTXORefKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iNcKvh7mazaXptzHf85q6EtpFYFE7asKC1",
      "indexid": "xTSSPVYrSJoCT4sKWojz4dRMHCGF3h9tM4",
      "hash160result": "013e760f7451c289672993ea391ae643c21ce4d1",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.object.utxoref"
      }
    }
  }
  static CrossChainDataRefKeyName(): string {
    return "vrsc::data.type.object.crosschaindataref";
  }
  static CrossChainDataRefKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iP3euVSzNcXUrLNHnQnR9G6q8jeYuGSxgw",
      "indexid": "xTsmNHt5Dvk9UWFKe6Sa7edNAPfZmJVgLc",
      "hash160result": "4d33e0aee0f648c7871b2661d1221b57c05aaed6",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.object.crosschaindataref"
      }
    }

  }
  static EncryptionDescriptorKeyName(): string {
    return "vrsc::data.type.encryptiondescriptor";
  }
  static EncryptionDescriptorKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iHEEK8ipj58BeKZNWuaaR2tDR5RK2kmf9A",
      "indexid": "xN4Lmw9uaPLrGVSQNbEjPRQkSjSKxsHUQu",
      "hash160result": "8d021acc1b68335bd7d37b28ff773c138ea5dd96",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.encryptiondescriptor"
      }
    }
  }
  static SaltedDataKeyName(): string {
    return "vrsc::data.type.salteddata";
  }
  static SaltedDataKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i92U1nLuLJkC44FZZ4Lq9zk4qW3HrWAWNo",
      "indexid": "xDraUamzBcxrgE8bQjzz8PGbsA4JiFskTD",
      "hash160result": "9e13510e01d0d03a7bc90d7a2ef32824f515e33c",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.salteddata"
      }
    }
  }
  static DataDescriptorKeyName(): string {
    return "vrsc::data.type.object.datadescriptor";
  }
  static DataDescriptorKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv",
      "indexid": "x96JULhKLXEgCqPwUxTQGtAKhPK6Qh1iaW",
      "hash160result": "4d4f12424ded2033a526a4e2a8835fc5b2eba208",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.object.datadescriptor"
      }
    }
  }
  static SignatureDataKeyName(): string {
    return "vrsc::data.signaturedata";
  }
  static SignatureDataKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i7PcVF9wwPtQ6p6jDtCVpohX65pTZuP2ah",
      "indexid": "xCDix3b2ni74iyym5ZreoCE47jqUTBFRAb",
      "hash160result": "b48b359e9a00042cec64f7f66ac717d388a4f22a",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.signaturedata"
      }
    }
  }
  static VectorUint256KeyName(): string {
    return "vrsc::data.mmrhashes";
  }
  static VectorUint256Key(): VDXFKeyInterface {
    return {
      "vdxfid": "i9UgJ2WxGw95PKdoCXjpfnBShtP5gi9fxS",
      "indexid": "xEJnkpx38FMk1VWq4DPyeAhyjYQ6X5Gsti",
      "hash160result": "8c1afd59e904f6d2702699963abccbc6d326d841",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.mmrhashes"
      }
    }
  }
  static MMRLinksKeyName(): string {
    return "vrsc::data.mmrlinks";
  }
  static MMRLinksKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iPQsnA1R8UjHNddZKZ3FxsuKQ5WzKqSC7w",
      "indexid": "xUEzExSVynwwzoWbBEhQwGRrRjY1Bc2MYc",
      "hash160result": "f535a4e9ac0f94eda01695d16489a4a102d6b1da",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.mmrlinks"
      }
    }

  }
  static MMRDescriptorKeyName(): string {
    return "vrsc::data.mmrdescriptor";
  }
  static MMRDescriptorKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i9dVDb4LgfMYrZD1JBNP2uaso4bNAkT4Jr",
      "indexid": "xETbgPVRXyaDUj639s2Y1J7QpicP4DvZMt",
      "hash160result": "97273a4c02d6be002f8d69c3979616732ba68243",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.mmrdescriptor"
      }
    }
  }
  static TypeDefinitionKeyName(): string {
    return "vrsc::data.type.typedefinition";
  }
  static TypeDefinitionKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iL5MPPHWXQEY3p2Q1UsmGDvXsgPiqd1W1S",
      "indexid": "xQuTrBibNiTCfyuRsAXvEcT4uLQjhxrpyL",
      "hash160result": "ae8d805d9650c0512a6b6ec33e963386542f18b6",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::data.type.typedefinition"
      }
    }
  }
  static MultiMapKeyName(): string {
    return "vrsc::identity.multimapkey";
  }
  static MultiMapKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i3mbggp3NBR77C5JeFQJTpAxmgMidayLLE",
      "indexid": "x8bi9VF8DVdmjMxLVw4TSChVoLNjUyapgs",
      "hash160result": "6920bb81b420bc95e29a10ed677379b1e39e3a03",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::identity.multimapkey"
      }
    }
  }
  static ContentMultiMapRemoveKeyName(): string {
    return "vrsc::identity.multimapremove";
  }
  static ContentMultiMapRemoveKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i5Zkx5Z7tEfh42xtKfwbJ5LgEWE9rEgpFY",
      "indexid": "xAPsQszCjYtMgCqvBMbkGTsDGAFAmrN33A",
      "hash160result": "d393b986e4f82db7bec82d97b186882d739ded16",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::identity.multimapremove"
      }
    }
  }

  // for any ID, this key indexes content that applies to representing the profile of
  // that ID. there may be many mime-type instances of a particular piece of profile media
  static ProfileMediaKeyName(): string {
    return "vrsc::identity.profile.media";
  }
  static ProfileMediaKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iEYsp2njSt1M4EVYi9uuAPBU2wpKmThkkr",
      "indexid": "xKNzGqDpJCE1gQNaZqa48mi14bqLaG669g",
      "hash160result": "e95b2ee1abb130a93900ddaef2d8e528010f7c79",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::identity.profile.media"
      }
    }

  }

  static ZMemoMessageKeyName(): string {
    return "vrsc::system.zmemo.message";
  }
  static ZMemoMessageKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iNHg1n828PUxktkYeNxC6sdVmuKTipn3L3",
      "indexid": "xT7nUaZ6yhhdP4daW4cM5GA2oZLUaNVaBD",
      "hash160result": "4a8f418203621f10d1a61701be8dbbbb38fa5cce",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::system.zmemo.message"
      }
    }

  }

  static ZMemoSignatureKeyName(): string {
    return "vrsc::system.zmemo.signature";
  }
  static ZMemoSignatureKey(): VDXFKeyInterface {
    return {
      "vdxfid": "i7mrLLjUfGYuHJwnsxFvd282hsdn4staJG",
      "indexid": "xCbxo9AZWamZuUppjdv5bQeZjXeo1vbaCc",
      "hash160result": "7b47c8cd90c4c3ddc542f37ca77473b7325a272f",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::system.zmemo.signature"
      }
    }
  }

  static CurrencyStartNotarizationKeyName(): string {
    return "vrsc::system.currency.startnotarization";
  }
  static CurrencyStartNotarizationKey(): VDXFKeyInterface {
    return {
      "vdxfid": "iRvxVcGLaCXcDiAfnQ5FfeBCo2AiBibAft",
      "indexid": "xWm4xQhRRWkGqt3he5jQe2hjpgBj5C7Tj3",
      "hash160result": "b537201ca6465976bea7bdb03119644a858052f6",
      "qualifiedname": {
        "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
        "name": "vrsc::system.currency.startnotarization"
      }
    }
  }

  GetHash() { };
};

export class CVDXFDataDescriptor extends BufferDataVdxfObject {
  dataDescriptor: DataDescriptor;

  constructor(vdxfData: BufferDataVdxfObject) {
    super(vdxfData.data, vdxfData.vdxfkey);
    this.version = vdxfData.version;
    if (this.data != null) {

      this.dataDescriptor = new DataDescriptor();

      this.dataDescriptor.fromBuffer(Buffer.from(this.data, 'hex'));
      delete this.data;

    }

  }
  dataByteLength(): number {

    let length = 0;

    length += this.dataDescriptor.byteLength();

    return length;
  }

  toDataBuffer(): Buffer {

    return this.dataDescriptor.toBuffer();
  }

  fromDataBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);

    this.data = reader.readVarSlice().toString('hex');

    this.dataDescriptor = new DataDescriptor();
    this.dataDescriptor.fromBuffer(Buffer.from(this.data, 'hex'));
    delete this.data;

    return reader.offset;
  }

  HasEncryptedData(): boolean {
    return this.dataDescriptor.HasEncryptedData();
  }

  HasLabel(): boolean {
    return this.dataDescriptor.HasLabel();
  }

  HasSalt(): boolean {
    return this.dataDescriptor.HasSalt();
  }

  HasEPK(): boolean {
    return this.dataDescriptor.HasEPK();
  }

  HasIVK(): boolean {
    return this.dataDescriptor.HasIVK();
  }

  HasSSK(): boolean {
    return this.dataDescriptor.HasSSK();
  }

  CalcFlags(): BigNumber {
    return this.dataDescriptor.CalcFlags();
  }

  SetFlags() {
    return this.dataDescriptor.SetFlags();
  }

};

export enum EHashTypes {
  HASH_INVALID = 0,
  HASH_BLAKE2BMMR = 1,
  HASH_BLAKE2BMMR2 = 2,
  HASH_KECCAK = 3,
  HASH_SHA256D = 4,
  HASH_SHA256 = 5,
  HASH_LASTTYPE = 5
};


export class MMRDescriptor {
  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  version: BigNumber;
  objectHashType: EHashTypes;
  mmrHashType: EHashTypes;
  mmrRoot: DataDescriptor;
  mmrHashes: DataDescriptor;
  dataDescriptors: DataDescriptor[];

  constructor(data?: {
    version?: BigNumber,
    objectHashType?: EHashTypes,
    mmrHashType?: EHashTypes,
    mmrRoot?: DataDescriptor,
    mmrHashes?: DataDescriptor,
    dataDescriptors?: DataDescriptor[]
  }) {

    if (data) {
      if (data.version) this.version = data.version;
      if (data.objectHashType) this.objectHashType = data.objectHashType;
      if (data.mmrHashType) this.mmrHashType = data.mmrHashType;
      if (data.mmrRoot) this.mmrRoot = data.mmrRoot;
      if (data.mmrHashes) this.mmrHashes = data.mmrHashes;
      if (data.dataDescriptors) this.dataDescriptors = data.dataDescriptors;

    } else {
      this.version = MMRDescriptor.DEFAULT_VERSION;
    }
  }

  static fromJson(data: any): MMRDescriptor {

    const newMMRDescriptor = new MMRDescriptor();

    if (data) {
      if (data.version) newMMRDescriptor.version = new BN(data.version);
      if (data.objecthashtype) newMMRDescriptor.objectHashType = data.objecthashtype;
      if (data.mmrhashtype) newMMRDescriptor.mmrHashType = data.mmrhashtype;
      if (data.mmrroot) newMMRDescriptor.mmrRoot = DataDescriptor.fromJson(data.mmrroot);
      if (data.mmrhashes) newMMRDescriptor.mmrHashes = DataDescriptor.fromJson(data.mmrhashes);
      if (data.datadescriptors) {
        newMMRDescriptor.dataDescriptors = [];

        data.datadescriptors.forEach((data) => {
          newMMRDescriptor.dataDescriptors.push(DataDescriptor.fromJson(data));
        });

      };
    }
    return newMMRDescriptor;
  }

  byteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.version);
    length += varint.encodingLength(new BN(this.objectHashType));
    length += varint.encodingLength(new BN(this.mmrHashType));
    length += this.mmrRoot.byteLength();
    length += this.mmrHashes.byteLength();
    length += varuint.encodingLength(this.dataDescriptors.length);
    this.dataDescriptors.forEach((dataDescriptor) => {
      length += dataDescriptor.byteLength();
    });

    return length;
  }

  toBuffer(): Buffer {

    const writer = new BufferWriter(Buffer.alloc(this.byteLength()));

    writer.writeVarInt(this.version);
    writer.writeVarInt(new BN(this.objectHashType));
    writer.writeVarInt(new BN(this.mmrHashType));
    writer.writeSlice(this.mmrRoot.toBuffer());
    writer.writeSlice(this.mmrHashes.toBuffer());
    writer.writeCompactSize(this.dataDescriptors.length);

    this.dataDescriptors.forEach((dataDescriptor) => {
      writer.writeSlice(dataDescriptor.toBuffer());
    });
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    this.version = reader.readVarInt();
    this.objectHashType = reader.readVarInt().toNumber();
    this.mmrHashType = reader.readVarInt().toNumber();
    this.mmrRoot = new DataDescriptor();
    this.mmrRoot.fromBuffer(reader.readVarSlice());
    this.mmrHashes = new DataDescriptor();
    this.mmrHashes.fromBuffer(reader.readVarSlice());
    const dataDescriptorsLength = reader.readCompactSize();
    this.dataDescriptors = [];
    for (let i = 0; i < dataDescriptorsLength; i++) {
      const dataDescriptor = new DataDescriptor();
      dataDescriptor.fromBuffer(reader.readVarSlice());
      this.dataDescriptors.push(dataDescriptor);
    }
    return reader.offset;
  }

  HasData(): boolean {
    return !!(this.mmrHashes.objectdata && this.dataDescriptors);
  }

  IsValid(): boolean {
    return this.version >= MMRDescriptor.FIRST_VERSION && this.version <= MMRDescriptor.LAST_VERSION;
  }
};

export const VectorEncodeVDXFUni = (obj): Buffer => {
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
    if (objTypeKey == VDXF_Data.DataByteKey().vdxfid) {
      const oneByte = Buffer.from(oneValValues[k] as string, "hex");
      if (oneByte.length != 1) {
        throw new Error("contentmap: byte data must be exactly one byte");
      }
      ss = Buffer.concat([ss, oneByte]);
    }
    else if (objTypeKey == VDXF_Data.DataInt16Key().vdxfid) {
      const oneShort = Buffer.alloc(2);
      oneShort.writeInt16LE(oneValValues[k] as number);
      ss = Buffer.concat([ss, oneShort]);
    }
    else if (objTypeKey == VDXF_Data.DataUint16Key().vdxfid) {
      const oneUShort = Buffer.alloc(2);
      oneUShort.writeUInt16LE(oneValValues[k] as number);
      ss = Buffer.concat([ss, oneUShort]);
    }
    else if (objTypeKey == VDXF_Data.DataInt32Key().vdxfid) {
      const oneInt = Buffer.alloc(4);
      oneInt.writeInt32LE(oneValValues[k] as number);
      ss = Buffer.concat([ss, oneInt]);

    }
    else if (objTypeKey == VDXF_Data.DataUint32Key().vdxfid) {
      const oneUInt = Buffer.alloc(4);
      oneUInt.writeUInt32LE(oneValValues[k] as number);
      ss = Buffer.concat([ss, oneUInt]);
    }
    else if (objTypeKey == VDXF_Data.DataInt64Key().vdxfid) {
      const oneInt64 = Buffer.alloc(8);
      oneInt64.writeIntLE(oneValValues[k] as number, 0, 8);
      ss = Buffer.concat([ss, oneInt64]);
    }
    else if (objTypeKey == VDXF_Data.DataUint160Key().vdxfid) {
      const oneKey = fromBase58Check(oneValValues[k] as string).hash;
      ss = Buffer.concat([ss, oneKey]);
    }
    else if (objTypeKey == VDXF_Data.DataUint256Key().vdxfid) {
      const oneHash = Buffer.from(oneValValues[k] as string, "hex");
      if (oneHash.length != 32) {
        throw new Error("contentmap: hash data must be exactly 32 bytes");
      }
      ss = Buffer.concat([ss, oneHash.reverse()]);
    }
    else if (objTypeKey == VDXF_Data.DataStringKey().vdxfid) {

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
    else if (objTypeKey == VDXF_Data.DataByteVectorKey().vdxfid) {

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
    else if (objTypeKey == VDXF_Data.DataCurrencyMapKey().vdxfid) {

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
    else if (objTypeKey == VDXF_Data.DataRatingsKey().vdxfid) {

      const version = new BN((oneValValues[k] as { version: number }).version);
      const trustLevel = new BN((oneValValues[k] as { trustLevel: number }).trustLevel);

      const destinations = Object.keys((oneValValues[k] as { rating: BigNumber }).rating);
      const values = Object.values(oneValValues[k]);

      const oneRatingMap = new Rating({ ratings: new Map(destinations.map((key, index) => [key, Buffer.from(values[index], 'hex')])), version, trustLevel });

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
    else if (objTypeKey == VDXF_Data.DataTransferDestinationKey().vdxfid) {

      const transferDest = new TransferDestination(oneValValues[k]);

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
    else if (objTypeKey == VDXF_Data.ContentMultiMapRemoveKey().vdxfid) {

      const transferDest = new ContentMultiMapRemove(oneValValues[k]);

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
    else if (objTypeKey == VDXF_Data.CrossChainDataRefKey().vdxfid) {

      const transferDest = new CrossChainDataRef(oneValValues[k]);

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
    else if (objTypeKey == VDXF_Data.DataDescriptorKey().vdxfid) {

      const descr = DataDescriptor.fromJson(oneValValues[k]);

      let length = 20;
      length += varint.encodingLength(descr.version);
      length += varuint.encodingLength(descr.byteLength());
      length += descr.byteLength();

      const writer = new BufferWriter(Buffer.alloc(length));

      writer.writeSlice(fromBase58Check(objTypeKey).hash);
      writer.writeVarInt(descr.version);
      writer.writeCompactSize(descr.byteLength());
      writer.writeSlice(descr.toBuffer());

      ss = Buffer.concat([ss, writer.buffer]);

    }
    else if (objTypeKey == VDXF_Data.MMRDescriptorKey().vdxfid) {

      const descr = MMRDescriptor.fromJson(oneValValues[k]);

      let length = 20;
      length += varint.encodingLength(descr.version);
      length += varuint.encodingLength(descr.byteLength());
      length += descr.byteLength();

      const writer = new BufferWriter(Buffer.alloc(length));

      writer.writeSlice(fromBase58Check(objTypeKey).hash);
      writer.writeVarInt(descr.version);
      writer.writeCompactSize(descr.byteLength());
      writer.writeSlice(descr.toBuffer());

      ss = Buffer.concat([ss, writer.buffer]);

    }
    else if (objTypeKey == VDXF_Data.SignatureDataKey().vdxfid) {

      const sigData = new SignatureData(oneValValues[k]);

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

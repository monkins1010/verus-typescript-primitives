import { BN } from "bn.js";
import { IdentityUpdateRequest, IdentityUpdateResponse, IdentityUpdateEnvelope } from "../../vdxf/classes/identity/IdentityUpdateEnvelope";
import { IdentityUpdateRequestDetails } from "../../vdxf/classes/identity/IdentityUpdateRequestDetails";
import { IdentityUpdateResponseDetails } from "../../vdxf/classes/identity/IdentityUpdateResponseDetails";
import { ContentMultiMap, IDENTITY_VERSION_PBAAS, IdentityID, KeyID, SaplingPaymentAddress } from "../../pbaas";
import { PartialIdentity } from "../../pbaas/PartialIdentity";
import { ResponseUri } from "../../vdxf/classes/ResponseUri";
import { PartialMMRData } from "../../pbaas/PartialMMRData";
import { PartialSignData, PartialSignDataInitData } from "../../pbaas/PartialSignData";
import { DATA_TYPE_MMRDATA } from "../../constants/pbaas";

describe("IdentityUpdateEnvelope Serialization", () => {
  const systemID = IdentityID.fromAddress("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq");
  const signingID = IdentityID.fromAddress("RP4Qct9197i5vrS11qHVtdyRRoAHVNJS47");
  const requestID = new BN("123456", 10);
  const createdAt = new BN("1700000000", 10);
  const expiryHeight = new BN("123456");
  const salt = Buffer.from('=H319X:)@H2Z');
  const txid = "2474d2c7b3586cedd8bf7f4a9af7c26e794ea2fc44853f17a30148e2ed857a95";

  const contentmap = new Map();
  contentmap.set("iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j", Buffer.alloc(32));
  contentmap.set("iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c", Buffer.alloc(32));

  const partialIdentity = new PartialIdentity({
    flags: new BN("0"),
    version: IDENTITY_VERSION_PBAAS,
    min_sigs: new BN(1),
    primary_addresses: [
      KeyID.fromAddress("RQVsJRf98iq8YmRQdehzRcbLGHEx6YfjdH"),
      KeyID.fromAddress("RP4Qct9197i5vrS11qHVtdyRRoAHVNJS47")
    ],
    parent: IdentityID.fromAddress("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"),
    system_id: IdentityID.fromAddress("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"),
    name: "TestID",
    content_map: contentmap,
    content_multimap: ContentMultiMap.fromJson({
      iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j: [
        { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' },
        { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' },
        { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' },
        { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' }
      ],
      iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq: '6868686868686868686868686868686868686868',
      i5v3h9FWVdRFbNHU7DfcpGykQjRaHtMqu7: [
        '6868686868686868686868686868686868686868',
        '6868686868686868686868686868686868686868',
        '6868686868686868686868686868686868686868'
      ],
      i81XL8ZpuCo9jmWLv5L5ikdxrGuHrrpQLz: { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' }
    }),
    recovery_authority: IdentityID.fromAddress("i81XL8ZpuCo9jmWLv5L5ikdxrGuHrrpQLz"),
    revocation_authority: IdentityID.fromAddress("i5v3h9FWVdRFbNHU7DfcpGykQjRaHtMqu7"),
    unlock_after: new BN("123456", 10),
    private_addresses: [SaplingPaymentAddress.fromAddressString("zs1wczplx4kegw32h8g0f7xwl57p5tvnprwdmnzmdnsw50chcl26f7tws92wk2ap03ykaq6jyyztfa")]
  });

  const mmrData = new PartialMMRData({
    flags: new BN('0', 10),
    data: [
      { type: new BN('2', 10), data: Buffer.from('src/__tests__/pbaas/partialmmrdata.test.ts', 'utf-8') },
      { type: new BN('3', 10), data: Buffer.from('Hello test message 12345', 'utf-8') },
    ],
    salt: [Buffer.from('=H319X:)@H2Z'), Buffer.from('s*1UHmVr?feI')],
    mmrhashtype: new BN('1', 10), // e.g. PartialMMRData.HASH_TYPE_SHA256
    priormmr: [
      Buffer.from('80a28cdff6bd91a2e96a473c234371fd8b67705a8c4956255ce7b8c7bf20470f02381c9a935f06cdf986a7c5facd77625befa11cf9fd4b59857b457394a8af979ab2830087a3b27041b37bc318484175'), 
      Buffer.from('d97fd4bbd9e88ca0c5822c12d5c9b272b2044722aa48b1c8fde178be6b59ccea509f403d3acd226c16ba3c32f0cb92e2fcaaa02b40d0bc5257e0fbf2e6c3d3d7f1a1df066967b193d131158ba5bef732')
    ],
  })

  const baseSignDataWithMMR: PartialSignDataInitData = {
    flags: new BN('0', 10),
    address: IdentityID.fromAddress('iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq'),
    prefixstring: Buffer.from('example prefix', 'utf8'),
    vdxfkeys: [IdentityID.fromAddress('i81XL8ZpuCo9jmWLv5L5ikdxrGuHrrpQLz')],
    vdxfkeynames: [Buffer.from('VDXFNAME', 'utf8')],
    boundhashes: [Buffer.from('0873c6ba879ce87f5c207a4382b273cac164361af0b9fe63d6d7b0d7af401fec', 'hex'), Buffer.from('0873c6ba879ce87f5c207a4382b273cac164361af0b9fe63d6d7b0d7af401fec', 'hex')],
    hashtype: new BN('1', 10),
    encrypttoaddress: SaplingPaymentAddress.fromAddressString(
      'zs1wczplx4kegw32h8g0f7xwl57p5tvnprwdmnzmdnsw50chcl26f7tws92wk2ap03ykaq6jyyztfa'
    ),
    createmmr: true,
    signature: Buffer.from('AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp', 'base64'),
    datatype: DATA_TYPE_MMRDATA,
    data: mmrData, // This is the PartialMMRData object
  }

  const signdatamap = new Map();
  signdatamap.set("iBvyi1nuCrTA4g44xN9N7EU1t6a7gwb4h8", new PartialSignData(baseSignDataWithMMR))

  function testSerialization(instance) {
    const fromBufferInstance = new instance.constructor();
    fromBufferInstance.fromBuffer(instance.toBuffer());
    expect(fromBufferInstance.toBuffer().toString("hex")).toBe(instance.toBuffer().toString("hex"));
  }

  test("Serialize/Deserialize unsigned IdentityUpdateRequest", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestid: requestID, 
      createdat: createdAt, 
      systemid: systemID, 
      identity: partialIdentity, 
      expiryheight: expiryHeight, 
      salt: salt, 
      signdatamap 
    });
    const request = new IdentityUpdateRequest({ details: requestDetails });
    testSerialization(request);
  });

  test("Serialize/Deserialize signed IdentityUpdateRequest", () => {
    const requestDetails = new IdentityUpdateRequestDetails({ 
      requestid: requestID, 
      createdat: createdAt, 
      systemid: systemID, 
      identity: partialIdentity, 
      expiryheight: expiryHeight, 
      salt: salt, 
      signdatamap 
    });
    const request = new IdentityUpdateRequest({ 
      details: requestDetails, 
      systemid: systemID, 
      signingid: signingID, 
      signature: "AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp" 
    });

    testSerialization(request);
  });

  test("Serialize/Deserialize unsigned IdentityUpdateResponse", () => {
    const responseDetails = new IdentityUpdateResponseDetails({ requestid: requestID, createdat: createdAt });
    const response = new IdentityUpdateResponse({ details: responseDetails });
    testSerialization(response);
  });

  test("Serialize/Deserialize signed IdentityUpdateResponse", () => {
    const responseDetails = new IdentityUpdateResponseDetails({ requestid: requestID, createdat: createdAt });
    const response = new IdentityUpdateResponse({ 
      details: responseDetails, 
      systemid: systemID, 
      signingid: signingID, 
      signature: "AeNjMwABQSAPBEuajDkRyy+OBJsWmDP3EUoqN9UjCJK9nmoSQiNoZWBK19OgGCYdEqr1CiFfBf8SFHVoUv4r2tb5Q3qsMTrp" 
    });
    testSerialization(response);
  });

  test("Remove optional fields from unsigned IdentityUpdateRequest", () => {
    let baseRequestDetailsConfig = { 
      requestid: requestID, 
      createdat: createdAt, 
      systemid: systemID, 
      identity: partialIdentity,
      expiryheight: expiryHeight,
      responseuris: [ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_REDIRECT), ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_POST)],
      signdatamap: signdatamap,
      salt
    };

    const toRemove = ["expiryheight", "responseuris", "signdatamap", "salt", "systemid"];

    for (let i = 0; i < toRemove.length + 1; i++) {
      const newRequestDetails = new IdentityUpdateRequestDetails({ ...baseRequestDetailsConfig });
      const request = new IdentityUpdateRequest({ details: newRequestDetails });

      testSerialization(request);

      if (i < toRemove.length) {
        delete baseRequestDetailsConfig[toRemove[i]]
      }
    }
  });

  test("Remove optional fields from IdentityUpdateResponse", () => {
    const txidbuf = Buffer.from(txid, 'hex').reverse();
    let baseResponseDetailsConfig = { requestid: requestID, createdat: createdAt, txid: txidbuf, salt };
   
    const toRemove = ["txid", "salt"];

    for (let i = 0; i < toRemove.length + 1; i++) {
      const newResponseDetails = new IdentityUpdateResponseDetails({ ...baseResponseDetailsConfig });
      const response = new IdentityUpdateResponse({ details: newResponseDetails });

      testSerialization(response);

      if (i < toRemove.length) {
        delete baseResponseDetailsConfig[toRemove[i]]
      }
    }
  });
});

import { BN } from "bn.js";
import { ContentMultiMap, IDENTITY_VERSION_PBAAS } from "../../pbaas/ContentMultiMap";
import { Identity } from "../../pbaas/Identity";
import { KeyID } from "../../pbaas/KeyID";
import { IdentityID } from "../../pbaas/IdentityID";
import { DATA_TYPE_STRING } from "../../vdxf";

describe('Serializes and deserializes identity properly', () => {
  test('deserialize/serialize VerusID without zaddr', () => {
    const contentmap = new Map();
    contentmap.set("iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j", Buffer.alloc(32));
    contentmap.set("iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c", Buffer.alloc(32));

    const identity = new Identity({
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
      unlock_after: new BN("123456", 10)
    })
    
    const identityFromBuf = new Identity();

    identityFromBuf.fromBuffer(identity.toBuffer());

    expect(identityFromBuf.toBuffer().toString('hex')).toBe(identity.toBuffer().toString('hex'));
  })

  // test('deserialize id with contentmultimap', async () => {
  //   const serializedIdentity = "0300000000000000011472aa70e6a4c0d0ff07541c5fbe4f08cacd89d35b01000000a6ef9ea235635e328124ff3429db9f9e91b64e2d0543687269730250d65f0c3aea3fd55eadf3b6f31f123fe8f9dbe001fdda02ab8b7b8b4418de66e611921699a328126461c0e5018443fdc0027b226172746973744e616d65223a20226976616e40222c2022616c62756d4e616d65223a202274657374416c62756d222c202267656e7265223a2022726f636b222c202275726c223a202268747470733a2f2f2f6a756b65626f78222c20226e6574776f726b4964223a2022726f6f6d66756c222c20227369676e6174757265223a20224167586d4567414141554567774c45516a534f4d44477651394f715859433654706d766c536a2b6c596731374d57336161494d3538634539756657376746344a7966364d2f6e4a4a564d3377466f64496d344972622f545565466a654b43616e35673d3d222c2022747261636b73223a205b7b227265736f757263654964223a20223139343564633964717472673231222c20226e616d65223a20225c75303431325c75303433655c75303433665c75303433625c7530343536205c75303431325c75303435365c75303433345c75303433655c75303433665c75303433625c75303434665c75303434315c75303433655c75303433325c7530343330202d205c75303431325c75303433355c75303434315c75303433645c75303433302028436f766572206279204772616e646d615c7320536d757a6929222c20226475726174696f6e223a203234302e3433327d5d2c2022616c62756d436f766572223a207b227265736f757263654964223a20223931647370387471367273713176227d2c20226172746973744c6f676f223a207b227265736f757263654964223a202272326630366267747a6872386276227d2c2022736c65657665446f63756d656e74223a207b227265736f757263654964223a202235706336307773713335337a736d227d2c2022636f70696573536f6c64223a20302c202272656c6561736554696d657374616d70223a202231363832353539323132222c20227072696365223a207b2256414c55223a20312c202255534443223a203230307d7d652741687b7ab1473754858d7b8b10886945eaf801fddc02ab8b7b8b4418de66e611921699a328126461c0e5018445fdc2027b22616c62756d436f766572223a207b227265736f757263654964223a20223931647370387471367273713176227d2c2022616c62756d4e616d65223a202274657374416c62756d3131222c20226172746973744c6f676f223a207b227265736f757263654964223a202272326630366267747a6872386276227d2c20226172746973744e616d65223a20226976616e40222c202267656e7265223a2022726f636b222c20226e6574776f726b4964223a2022726f6f6d66756c222c20227369676e6174757265223a20224167586d4567414141554567774c45516a534f4d44477651394f715859433654706d766c536a2b6c596731374d57336161494d3538634539756657376746344a7966364d2f6e4a4a564d3377466f64496d344972622f545565466a654b43616e35673d3d222c2022736c65657665446f63756d656e74223a207b227265736f757263654964223a202235706336307773713335337a736d227d2c2022747261636b73223a205b7b226475726174696f6e223a203234302e3433322c20226e616d65223a20225c75303431325c75303433655c75303433665c75303433625c7530343536205c75303431325c75303435365c75303433345c75303433655c75303433665c75303433625c75303434665c75303434315c75303433655c75303433325c7530343330202d205c75303431325c75303433355c75303434315c75303433645c75303433302028436f766572206279204772616e646d615c7320536d757a6929222c20227265736f757263654964223a20223139343564633964717472673231227d5d2c202275726c223a202268747470733a2f2f2f6a756b65626f78222c2022636f70696573536f6c64223a20302c202272656c6561736554696d657374616d70223a202231363832353336313730222c20227072696365223a207b2256414c55223a20312c202255534443223a203230307d7d00dfae84e93ab133b739076354e9fbb2de42887212dfae84e93ab133b739076354e9fbb2de4288721200a6ef9ea235635e328124ff3429db9f9e91b64e2d00000000"
  //   //TODO: Add in serliazation and deserialization tests for without content multimap, 
  //   // content map pre-pbaas, post-pbaas, no content map pre/post pbaas
  //   const identity_frombuf = new Identity()
  //   identity_frombuf.fromBuffer(Buffer.from(serializedIdentity, 'hex'))
  //   expect(identity_frombuf.toBuffer().toString('hex')).toBe(serializedIdentity)

  //   const identity_tobuf = new Identity({
  //       "version":3,
  //       "flags":0,
  //       "primaryaddresses":[
  //          "RKjVHqM4VF2pCfVcwGzKH7CxvfMUE4H6o8"
  //       ],
  //       "minimumsignatures":1,
  //       "name":"Chris",
  //       "identityaddress":"iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j",
  //       "parent":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  //       "systemid":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  //       "contentmultimap":{
  //          "iAqxJCbv2veLLHGdantvrzJRupyh3dkT6B":[
  //             {
  //                "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c":"{\"artistName\": \"ivan@\", \"albumName\": \"testAlbum\", \"genre\": \"rock\", \"url\": \"https:///jukebox\", \"networkId\": \"roomful\", \"signature\": \"AgXmEgAAAUEgwLEQjSOMDGvQ9OqXYC6TpmvlSj+lYg17MW3aaIM58cE9ufW7gF4Jyf6M/nJJVM3wFodIm4Irb/TUeFjeKCan5g==\", \"tracks\": [{\"resourceId\": \"1945dc9dqtrg21\", \"name\": \"\\u0412\\u043e\\u043f\\u043b\\u0456 \\u0412\\u0456\\u0434\\u043e\\u043f\\u043b\\u044f\\u0441\\u043e\\u0432\\u0430 - \\u0412\\u0435\\u0441\\u043d\\u0430 (Cover by Grandma\\s Smuzi)\", \"duration\": 240.432}], \"albumCover\": {\"resourceId\": \"91dsp8tq6rsq1v\"}, \"artistLogo\": {\"resourceId\": \"r2f06bgtzhr8bv\"}, \"sleeveDocument\": {\"resourceId\": \"5pc60wsq353zsm\"}, \"copiesSold\": 0, \"releaseTimestamp\": \"1682559212\", \"price\": {\"VALU\": 1, \"USDC\": 200}}"
  //             }
  //          ],
  //          "iChNhyJiQSZ3HumofCBhuASjgupq1m1NgP":[
  //             {
  //                "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c":"{\"albumCover\": {\"resourceId\": \"91dsp8tq6rsq1v\"}, \"albumName\": \"testAlbum11\", \"artistLogo\": {\"resourceId\": \"r2f06bgtzhr8bv\"}, \"artistName\": \"ivan@\", \"genre\": \"rock\", \"networkId\": \"roomful\", \"signature\": \"AgXmEgAAAUEgwLEQjSOMDGvQ9OqXYC6TpmvlSj+lYg17MW3aaIM58cE9ufW7gF4Jyf6M/nJJVM3wFodIm4Irb/TUeFjeKCan5g==\", \"sleeveDocument\": {\"resourceId\": \"5pc60wsq353zsm\"}, \"tracks\": [{\"duration\": 240.432, \"name\": \"\\u0412\\u043e\\u043f\\u043b\\u0456 \\u0412\\u0456\\u0434\\u043e\\u043f\\u043b\\u044f\\u0441\\u043e\\u0432\\u0430 - \\u0412\\u0435\\u0441\\u043d\\u0430 (Cover by Grandma\\s Smuzi)\", \"resourceId\": \"1945dc9dqtrg21\"}], \"url\": \"https:///jukebox\", \"copiesSold\": 0, \"releaseTimestamp\": \"1682536170\", \"price\": {\"VALU\": 1, \"USDC\": 200}}"
  //             }
  //          ]
  //       },
  //       "revocationauthority":"iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j",
  //       "recoveryauthority":"iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j",
  //       "timelock":0
  //    })
  //    expect(identity_tobuf.toBuffer().toString('hex')).toBe(serializedIdentity)
  // });
});
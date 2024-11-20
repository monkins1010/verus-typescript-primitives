import { BN } from "bn.js";
import { PRINCIPAL_DEFAULT_FLAGS, PRINCIPAL_VERSION_CURRENT, Principal } from "../../pbaas/Principal";
import { KeyID } from "../../pbaas/KeyID";
import { fromBase58Check } from "../../utils/address";
import { VDXF_UNI_VALUE_VERSION_CURRENT, VdxfUniValue } from "../../pbaas/VdxfUniValue";
import { DATA_TYPE_STRING, VERUSPAY_INVOICE_VDXF_KEY } from "../../vdxf";
import { Rating } from "../../pbaas/Rating";
import { CurrencyValueMap } from "../../pbaas";
import { CrossChainDataRef, CrossChainDataRefJson } from "../../pbaas/CrossChainDataRef";
import { SaltedData } from "../../pbaas/SaltedData";
import { SignatureData } from "../../pbaas/SignatureData";
import { MMRDescriptor } from "../../pbaas/MMRDescriptor";
import { URLRef, URLRefJson } from "../../pbaas/URLRef";

describe('Encodes and decodes VdxfUniValue', () => {
  test('encode/decode VdxfUniValue with string data', () => {
    const values = new Map();
    values.set(DATA_TYPE_STRING.vdxfid, "Test String 123454321");

    const v = new VdxfUniValue({
      values,
      version: VDXF_UNI_VALUE_VERSION_CURRENT
    });

    const vFromBuf = new VdxfUniValue();

    vFromBuf.fromBuffer(v.toBuffer(), 0);

    expect(vFromBuf.toBuffer().toString('hex')).toBe(v.toBuffer().toString('hex'));
    expect(VdxfUniValue.fromJson(v.toJson()).toBuffer().toString('hex')).toBe(vFromBuf.toBuffer().toString('hex'));
  });

  test('fail to encode/decode VdxfUniValue with unknown data', () => {
    const values = new Map();
    values.set(VERUSPAY_INVOICE_VDXF_KEY.vdxfid, Buffer.alloc(20));

    const v = new VdxfUniValue({
      values,
      version: VDXF_UNI_VALUE_VERSION_CURRENT
    });

    const vFromBuf = new VdxfUniValue();

    expect(() => vFromBuf.fromBuffer(v.toBuffer(), 0)).toThrowError();
  });

  // This test uses serialized data from the daemon adter putting in the Rating object into a contentmultimap.
  const multiMapwithRating = "979e0d9bc8c91be03c57bab5b45ddcf17fd5ca32011c0100000002011af5b8015c64d39ab44c60ead8317f9f5a9b6c4c0101"
  
  test('fail to encode/decode VdxfUniValue with unknown data', () => {
    
    const ratingMap = {"version":1, "trustlevel":2, "ratingsmap":{"i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV":"01"}}

    const jsonRating = Rating.fromJson(ratingMap);

    const v = new VdxfUniValue();
    v.fromBuffer(Buffer.from(multiMapwithRating, 'hex'));

    const extractedRating = v.values.get('iHJComZUXXGniLkDhjYprWYEN8qvQGDoam') as Rating;

    expect(jsonRating.toBuffer().toString('hex')).toBe(extractedRating.toBuffer().toString('hex'));
  });

  const multimapwithCurrencymap = "c98f1f7e5804ec1b180192f87125aefcc270db25011d011af5b8015c64d39ab44c60ead8317f9f5a9b6c4c"

  const multimapwithcrosschaindataref = "d6ae5ac0571b22d161261b87c748f6e0aee0334d011302"

  const multimapwithsignaturedata = "2af2a488d317c76af6f764ec2c04009a9e358bb4019901a6ef9ea235635e328124ff3429db9f9e91b64e2d0120b793323968ea80de4df1fb78963cfb8b604b524f6a7c9069293085e076f44d5df478f668655e60f6b49e2424053166ba2cf2413901000000490205d65f00000141205e483e50265341623cd9a089baf4b913f969b5377d588044c09b7d239870d7f7205a4a4581f440db7d01049ebdfe95f5de7a6b07113f9c7f79dc6fd3da69f245"

  const multimapwithmmrdescriptor = "4382a62b73169697c3698d2f00bed6024c3a279701fd5402010501010549b00ad8606acbf5234700daa308a2c64c1f9466c11d47255a60f8ccf9c74ba82b994a03b9b0331bc6f1bf25bbc8b4453a130d65b6a9dc21f7589967e88e51d930682469b03873c54e7720d89d4a9333fe85519a447b886b6c6c8aabee6fb144e9742b76b745dbdfd83c9a0105808207c6db9c149dcaff5f502baf891642e67e7e303c0ba8130f2bff76d8247929bc7ce55fdf66bac03ea808006dc5e71aa12deaff355985c7770ee7a534d9cea2bfc10851ed5c91467083ffb1f746161f5d567b4be5c98d72300e1762697d5f62067d819ac0b35ac2c712c6e8e04cefaecaf759f38f4fa3ff4d3fc4d1dccbb6b820230df92c25958999741329ed3dafc7825900807cbf6b02becc236ce573158a4f0201057c97c0b93faab9462670a5a13da88d9ca796db968ae9c9f1b88df67c564b73cb63f752248402844522efaa62e5b42ce816d0a9f44ca14efaf6f7fe47d916e77b54266c5cac39c6771e899ebda093c566d33bbf60b4a598ea45bf2f5fb1f0cd782baaf092a880a799e0771144a9e9422eec107e43d23ba9386bb46dde0920d7a908ddf6f4d6261d25c62ca086bb3f570b07d74a59256feed13d64d6fbadd201057bd1ce7cab498d9a87bbf3c8d5f255cf209e87adf01f407751959f2d49f23056597a51240e90d5f758adc92e819f77f698fe754c9ea350c213dbcbffdaeb6d9a55bbaf705af9a375c855e7a8ca486bc65b1bd24c35e13f437a7490ecaffeff0323e7508a6cc4e36c5414b4cd7d3125ffabfa3fe85a56e4f6e539925b20822d2b817613d5eb5daf4893afc57289d0081f8fe225c77e1e4839aa0822b9a5"

  test('deserialize currency map from vdxfuniValue', () => {
    const v = new VdxfUniValue();
    v.fromBuffer(Buffer.from(multimapwithCurrencymap, 'hex'));

    const currencyMap = v.values.get('iMrGhzkZq5fpWWSa1RambRySFPb7CuvKuX') as CurrencyValueMap;

    const jsonCurrencyMap = {"i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV":"100000"};
    const currencyMapFromJson = CurrencyValueMap.fromJson(jsonCurrencyMap);

    expect(currencyMap.toBuffer().toString('hex')).toBe(currencyMapFromJson.toBuffer().toString('hex'));
  });

  test('deserialize crosschain data ref from vdxfuniValue', () => {
    const v = new VdxfUniValue();
    v.fromBuffer(Buffer.from(multimapwithcrosschaindataref, 'hex'));

    const crossChainDataRef = v.values.get('iP3euVSzNcXUrLNHnQnR9G6q8jeYuGSxgw') as CrossChainDataRef;

    const jsonCrossChainDataRef = {"version":"1", "url":"https://verus.io"};

    const crossChainDataRefFromJson = new CrossChainDataRef(URLRef.fromJson(jsonCrossChainDataRef));

    expect(crossChainDataRef.toBuffer().toString('hex')).toBe(crossChainDataRefFromJson.toBuffer().toString('hex'));
  });

  test('deserialize signature data from vdxfuniValue', () => {
    const v = new VdxfUniValue();
    v.fromBuffer(Buffer.from(multimapwithsignaturedata, 'hex'));

    const signatureData = v.values.get('i7PcVF9wwPtQ6p6jDtCVpohX65pTZuP2ah') as SignatureData;

    const jsonSignatureData = {
			"version": 1,
			"systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
			"hashtype": 1,
			"signaturehash": "5d4df476e085302969907c6a4f524b608bfb3c9678fbf14dde80ea68393293b7",
			"identityid": "iRmBDWNs2WahXDAvS2TEsJyJwwHXhwcs7w",
			"signaturetype": 1,
			"signature": "AgXWXwAAAUEgXkg+UCZTQWI82aCJuvS5E/lptTd9WIBEwJt9I5hw1/cgWkpFgfRA230BBJ69/pX13nprBxE/nH953G/T2mnyRQ=="
		  }
    const signatureDataFromJson = SignatureData.fromJson(jsonSignatureData);

    expect(signatureData.toBuffer().toString('hex')).toBe(signatureDataFromJson.toBuffer().toString('hex'));
  });

  test('deserialize mmr descriptor from vdxfuniValue', () => {
    const v = new VdxfUniValue();
    v.fromBuffer(Buffer.from(multimapwithmmrdescriptor, 'hex'));

    const mmrDescriptor = v.values.get('i9dVDb4LgfMYrZD1JBNP2uaso4bNAkT4Jr') as MMRDescriptor;

    const jsonMMRDescriptor ={
      "version": 1,
      "objecthashtype": 5,
      "mmrhashtype": 1,
      "mmrroot": {
          "version": 1,
          "flags": 5,
          "objectdata": "b00ad8606acbf5234700daa308a2c64c1f9466c11d47255a60f8ccf9c74ba82b994a03b9b0331bc6f1bf25bbc8b4453a130d65b6a9dc21f7589967e88e51d930682469b03873c54e77",
          "epk": "d89d4a9333fe85519a447b886b6c6c8aabee6fb144e9742b76b745dbdfd83c9a"
      },
      "mmrhashes": {
          "version": 1,
          "flags": 5,
          "objectdata": "8207c6db9c149dcaff5f502baf891642e67e7e303c0ba8130f2bff76d8247929bc7ce55fdf66bac03ea808006dc5e71aa12deaff355985c7770ee7a534d9cea2bfc10851ed5c91467083ffb1f746161f5d567b4be5c98d72300e1762697d5f62067d819ac0b35ac2c712c6e8e04cefaecaf759f38f4fa3ff4d3fc4d1dccbb6b8",
          "epk": "230df92c25958999741329ed3dafc7825900807cbf6b02becc236ce573158a4f"
      },
      "datadescriptors": [
          {
              "version": 1,
              "flags": 5,
              "objectdata": "97c0b93faab9462670a5a13da88d9ca796db968ae9c9f1b88df67c564b73cb63f752248402844522efaa62e5b42ce816d0a9f44ca14efaf6f7fe47d916e77b54266c5cac39c6771e899ebda093c566d33bbf60b4a598ea45bf2f5fb1f0cd782baaf092a880a799e0771144a9e9422eec107e43d23ba9386bb46dde09",
              "epk": "d7a908ddf6f4d6261d25c62ca086bb3f570b07d74a59256feed13d64d6fbadd2"
          },
          {
              "version": 1,
              "flags": 5,
              "objectdata": "d1ce7cab498d9a87bbf3c8d5f255cf209e87adf01f407751959f2d49f23056597a51240e90d5f758adc92e819f77f698fe754c9ea350c213dbcbffdaeb6d9a55bbaf705af9a375c855e7a8ca486bc65b1bd24c35e13f437a7490ecaffeff0323e7508a6cc4e36c5414b4cd7d3125ffabfa3fe85a56e4f6e539925b",
              "epk": "822d2b817613d5eb5daf4893afc57289d0081f8fe225c77e1e4839aa0822b9a5"
          }
      ]
  }
    const mmrDescriptorFromJson = MMRDescriptor.fromJson(jsonMMRDescriptor);

    expect(mmrDescriptor.toBuffer().toString('hex')).toBe(mmrDescriptorFromJson.toBuffer().toString('hex'));
  });

});
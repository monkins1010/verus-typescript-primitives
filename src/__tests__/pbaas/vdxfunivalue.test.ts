import { BN } from "bn.js";
import { PRINCIPAL_DEFAULT_FLAGS, PRINCIPAL_VERSION_CURRENT, Principal } from "../../pbaas/Principal";
import { KeyID } from "../../pbaas/KeyID";
import { fromBase58Check } from "../../utils/address";
import { VDXF_UNI_VALUE_VERSION_CURRENT, VdxfUniValue } from "../../pbaas/VdxfUniValue";
import { DATA_TYPE_STRING, VERUSPAY_INVOICE_VDXF_KEY } from "../../vdxf";
import { Rating } from "../../pbaas/Rating";

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

});
import { Credential } from '../../pbaas/Credential';
import { URLRef, URLRefJson } from '../../pbaas/URLRef';
import { DATA_TYPE_STRING } from "../../vdxf";
import { VDXF_UNI_VALUE_VERSION_CURRENT, VdxfUniValue } from "../../pbaas/VdxfUniValue";
import { BN } from 'bn.js';
import { BigNumber } from '../../utils/types/BigNumber';

describe('Serializes and deserializes Credential', () => {

    function testCredential() {

        const credentialHex = "010000000100000001f503c4f232c4599167a02357c25b75d5ad3ff0177b226e616d65223a2254657374204163636f756e74227d1a7b2261646472657373223a22546573742041646472657373227d074c6162656c2031"

        const credentialObject = Credential.fromJson({
			"version": 1,
			"flags": 1,
			"credentialKey": "i3esdByX2PKx5vJiuNrRb61KAKqsBEMxac",
			"credential": {name:"Test Account"},
			"scopes": {address:"Test Address"},
			"label": "Label 1"
		  });

        const credentialObject2 = new Credential();
        credentialObject2.fromBuffer(Buffer.from(credentialHex, 'hex'));

        expect(credentialObject.toBuffer().toString('hex')).toBe(credentialObject2.toBuffer().toString('hex'));
        expect(credentialObject.toJson()).toStrictEqual(credentialObject2.toJson());

    }

    test('test Credential deserializes with ontent', () => {
        testCredential();
    });
});
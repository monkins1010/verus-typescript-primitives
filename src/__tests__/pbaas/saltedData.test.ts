import { BN } from "bn.js";
import { PRINCIPAL_DEFAULT_FLAGS, PRINCIPAL_VERSION_CURRENT, Principal } from "../../pbaas/Principal";
import { Rating } from "../../pbaas/Rating";
import { fromBase58Check } from "../../utils/address";
import { SaltedData } from "../../pbaas/SaltedData";

describe('Serializes and deserializes SaltedData', () => {
    test('(de)serialize SaltedData', () => {

        const data = Buffer.from("aabbccdd", "hex");

        const s = new SaltedData(
            data,
            Buffer.alloc(32).fill(1)
        );

        const sFromBuf = new SaltedData();

        sFromBuf.fromBuffer(s.toBuffer())

        expect(sFromBuf.toBuffer().toString('hex')).toBe(s.toBuffer().toString('hex'))
    });
    });
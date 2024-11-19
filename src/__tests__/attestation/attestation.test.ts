import { ATTESTATION_READ_REQUEST, IDENTITY_VIEW, ATTESTATION_IDENTITY_DATA, LOGIN_CONSENT_REDIRECT_VDXF_KEY } from "../../vdxf";
import { Attestation, LoginConsentRequest, LoginConsentResponse} from "../../vdxf/classes";
import { RedirectUri, RequestedPermission } from "../../vdxf/classes/Challenge";
import { Context } from "../../vdxf/classes/Context";

import { AttestationData } from "../../vdxf/classes/Attestation";

const SIMPLE_ATTESTATION = 1;

describe('Serializes and deserializes attestation request', () => {
    test('attestation request with reply', async () => {
        const req = new LoginConsentRequest({
          system_id: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
          signing_id: "iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU",
          signature: {
            signature:
              "AYG2IQABQSAN1fp6A9NIVbxvKuOVLLU+0I+G3oQGbRtS6u4Eampfb217Cdf5FCMScQhV9kMxtjI9GWzpchmjuiTB2tctk6qT",
          },
          challenge: {
            challenge_id: "iKNufKJdLX3Xg8qFru9AuLBvivAEJ88PW4",
            requested_access: [new RequestedPermission("", IDENTITY_VIEW.vdxfid),
              new RequestedPermission( {accepted_attestors:["iC9x9VZ2XMop7spFzeXqSKX8WqmrG9cu41"], 
                                                                         attestation_keys:[
                                                                            ATTESTATION_IDENTITY_DATA["firstname"].vdxfid,
                                                                            ATTESTATION_IDENTITY_DATA["lastname"].vdxfid,
                                                                            ATTESTATION_IDENTITY_DATA["attestor"].vdxfid,
                                                                            ATTESTATION_IDENTITY_DATA["identity"].vdxfid,
                                                                            ATTESTATION_IDENTITY_DATA["documenttype"].vdxfid]
                                                                        }, ATTESTATION_READ_REQUEST.vdxfid)],
            session_id: "iRQZGW36o3RcVR1xyVT1qWdAKdxp3wUyrh",
            redirect_uris: [
              new RedirectUri(
                "https://www.verus.io",
                LOGIN_CONSENT_REDIRECT_VDXF_KEY.vdxfid
              ),
            ],
            created_at: 1664382484,
            salt: "i6NawEzHMocZnU4h8pPkGpHApvsrHjxwXE",
            context: new Context({
              ["i4KyLCxWZXeSkw15dF95CUKytEK3HU7em9"]: "test",
            }),
          },
        });

        const componentsMap = new Map();

        componentsMap.set(0, {attestationKey: ATTESTATION_IDENTITY_DATA["firstname"].vdxfid, salt: "8e6744dc4f229e543bbd00d65b395829e44c8eb7b358ee3131ca25e6ecc3b210", value: "Chris"})
        componentsMap.set(1, {attestationKey: ATTESTATION_IDENTITY_DATA["lastname"].vdxfid, salt: "7c3920940db4385cd305557a57a8df33346712096e76b58d7c4ace05e17b90a2", value: "Monkins"})
        componentsMap.set(2, {attestationKey: ATTESTATION_IDENTITY_DATA["identity"].vdxfid, salt: "ce662d61a20ae211728cdb1b924628c84edfe0fcbd59a86f56a125ad73689ac1", value: "chad@"})
        componentsMap.set(3, {attestationKey: ATTESTATION_IDENTITY_DATA["attestor"].vdxfid, salt: "9067dc6a9b38dd15f985770bb819eb62de39a5d1f0e12f9a4807f78968794af4", value: "valu attestation@"})
        componentsMap.set(4, {attestationKey: ATTESTATION_IDENTITY_DATA["documenttype"].vdxfid, salt: "338b6ad44179f46fc24f3ed01fd247c9664384a71ba5465aebceece8d7c45a0a", value: "KYC Attestation v1"})


        const signaturesForAttestation = {"i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV": 
          {signature:"AYG2IQABQSAN1fp6A9NIVbxvKuOVLLU+0I+G3oQGbRtS6u4Eampfb217Cdf5FCMScQhV9kMxtjI9GWzpchmjuiTB2tctk6qT",
          system: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"}};

        const attestationResponse = new Attestation("i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",{components: componentsMap, signatures: signaturesForAttestation});

        await attestationResponse.createMMR();

        const proofResponseRoot = await attestationResponse.routeHash();

        // Get a pruned proof of just item [0] in the MMR
        const prunedMMR = await attestationResponse.getProof([0]);

        const prunedProofRoot = await prunedMMR.mmr.getRoot();

        const prunedMMRBuff = prunedMMR.toBuffer();

        const fromPrunedMMR = new Attestation();

        fromPrunedMMR.fromBuffer(prunedMMRBuff);

        const fromPrunedMMRProofRoot = await fromPrunedMMR.routeHash();
    
        const res = new LoginConsentResponse({
          system_id: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
          signing_id: "iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU",
          signature: {
            signature:
              "AYG2IQABQSAN1fp6A9NIVbxvKuOVLLU+0I+G3oQGbRtS6u4Eampfb217Cdf5FCMScQhV9kMxtjI9GWzpchmjuiTB2tctk6qT",
          },
          decision: {
            decision_id: "iBTMBHzDbsW3QG1MLBoYtmo6c1xuzn6xxb",
            context: new Context({
              ["i4KyLCxWZXeSkw15dF95CUKytEK3HU7em9"]: "test",
            }),
            request: req,
            created_at: 1664392484,
            attestations: [attestationResponse]
          }
        })
    
        const reqbuf = req.toBuffer()
        const _req = new LoginConsentRequest()
        _req.fromBuffer(reqbuf)
    
        const resbuf = res.toBuffer()
        const _res = new LoginConsentResponse()
        _res.fromBuffer(resbuf)

        const checkres = _res.toBuffer()
        expect(checkres).toStrictEqual(resbuf);
        const uri = _req.toWalletDeeplinkUri()
    
        expect(uri).toBe(LoginConsentRequest.fromWalletDeeplinkUri(uri).toWalletDeeplinkUri());

        const mmr = await _res.decision.attestations[0].createMMR();

        const root = await mmr.getRoot();

        expect(prunedProofRoot.toString('hex')).toStrictEqual("fa3cf78b174a39ddf7967afbfda54953ed55e44c6731de8796eb37ba77afddf1")
        expect(proofResponseRoot.toString('hex')).toStrictEqual("fa3cf78b174a39ddf7967afbfda54953ed55e44c6731de8796eb37ba77afddf1")
        expect(fromPrunedMMRProofRoot.toString('hex')).toStrictEqual("fa3cf78b174a39ddf7967afbfda54953ed55e44c6731de8796eb37ba77afddf1")
        expect(Buffer.from(root).toString('hex')).toStrictEqual("fa3cf78b174a39ddf7967afbfda54953ed55e44c6731de8796eb37ba77afddf1")

        // prume MMR and check stateroot is stillthe same

       // const prunedMMRProof = 
      });

  
});

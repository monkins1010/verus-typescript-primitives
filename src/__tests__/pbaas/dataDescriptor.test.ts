import { DataDescriptor,  } from "../../pbaas/DataDescriptor";
import { PBaaSEvidenceRef } from "../../pbaas/PBaaSEvidenceRef";
import { UTXORef } from "../../pbaas/UTXORef";
import { CrossChainDataRef } from "../../pbaas/CrossChainDataRef";
import { VdxfUniValue } from "../../pbaas/VdxfUniValue";
import { SignatureData } from "../../pbaas/SignatureData";
import { TransferDestination, DEST_ID } from "../../pbaas/TransferDestination";
import * as VDXF_Data from '../../vdxf/vdxfdatakeys';
import { toBase58Check, fromBase58Check } from '../../utils/address';
import { BN } from "bn.js";

describe('Serializes and deserializes dataDescriptors', () => {

    test('Nested datadescriptor with dataDescriptor in it', async () => {

        const nestedDescriptor = DataDescriptor.fromJson({
            version: 1,
            "flags": 2,
            "objectdata": {
                "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
                    "version": 1,
                    "flags": 96,
                    "mimetype": "text/plain",
                    "objectdata": {
                        "message": "Something 1"
                    },
                    "label": "label 1"
                }
            },
            "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
        });

        const serializedDesc = nestedDescriptor.toBuffer().toString('hex'); // Serialize the request to a hex string
        const newDescriptor = new DataDescriptor();

        newDescriptor.fromBuffer(Buffer.from(serializedDesc, 'hex')); // Deserialize the request from the hex string
        expect(serializedDesc).toStrictEqual(newDescriptor.toBuffer().toString('hex')) // Compare the original serialized request to the new serialized request

    });

    test('Datadescriptor with CrossChainDataRef', async () => {

        const evid = new PBaaSEvidenceRef();

        evid.version = new BN(1);
        evid.flags = new BN(1); //type IS_EVIDENCE = 1
        evid.output = new UTXORef({ hash: Buffer.from('30395e0868b1953477e14bb5c16349622239a94115a4d1f02b72b6ecf8b1c79c', 'hex'), n: new BN(0) });
        evid.object_num = new BN(0);
        evid.sub_object = new BN(0);
        evid.system_id = "i5v3h9FWVdRFbNHU7DfcpGykQjRaHtMqu7";

        const crossChainRef = new CrossChainDataRef(evid);
        const crossChainVector = VdxfUniValue.vectorEncodeVDXFUni({[VDXF_Data.CrossChainDataRefKey.vdxfid]: crossChainRef});

        const nestedDescriptor = DataDescriptor.fromJson({
            version: 1, 
            "flags": 2, //FLAG_SALT_PRESENT = 2
            "objectdata": crossChainVector.toString('hex'),
            "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
        });

        const serializedDesc = nestedDescriptor.toBuffer().toString('hex'); // Serialize the request to a hex string
        const newDescriptor = new DataDescriptor();

        newDescriptor.fromBuffer(Buffer.from(serializedDesc, 'hex')); // Deserialize the request from the hex string
        expect(serializedDesc).toStrictEqual(newDescriptor.toBuffer().toString('hex')) // Compare the original serialized request to the new serialized request
        expect(newDescriptor.objectdata)
    });
    test('Datadescriptor with TransferDestination', async () => {

        const destid = "iCtawpxUiCc2sEupt7Z4u8SDAncGZpgSKm";

        const txDest = new TransferDestination({
            type: DEST_ID,
            destination_bytes: fromBase58Check(destid).hash
          });

        const txDestVector = VdxfUniValue.vectorEncodeVDXFUni({[VDXF_Data.DataTransferDestinationKey.vdxfid]: txDest});

        const nestedDescriptor = DataDescriptor.fromJson({
            version: 1,
            "flags": 2, //FLAG_SALT_PRESENT = 2
            "objectdata": txDestVector.toString('hex'),
            "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
        });

        const serializedDesc = nestedDescriptor.toBuffer().toString('hex'); // Serialize the request to a hex string
        const newDescriptor = new DataDescriptor();

        newDescriptor.fromBuffer(Buffer.from(serializedDesc, 'hex')); // Deserialize the request from the hex string
        expect(serializedDesc).toStrictEqual(newDescriptor.toBuffer().toString('hex')) // Compare the original serialized request to the new serialized request
    });
    test('Datadescriptor with SignatureData', async () => {

        const destid = "iCtawpxUiCc2sEupt7Z4u8SDAncGZpgSKm";

        const txDest = new SignatureData({
            type: DEST_ID,
            destination_bytes: fromBase58Check(destid).hash
          });

        const txDestVector = VdxfUniValue.vectorEncodeVDXFUni({[VDXF_Data.DataTransferDestinationKey.vdxfid]: txDest});

        const nestedDescriptor = DataDescriptor.fromJson({
            version: 1,
            "flags": 2, //FLAG_SALT_PRESENT = 2
            "objectdata": txDestVector.toString('hex'),
            "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
        });

        const serializedDesc = nestedDescriptor.toBuffer().toString('hex'); // Serialize the request to a hex string
        const newDescriptor = new DataDescriptor();

        newDescriptor.fromBuffer(Buffer.from(serializedDesc, 'hex')); // Deserialize the request from the hex string
        expect(serializedDesc).toStrictEqual(newDescriptor.toBuffer().toString('hex')) // Compare the original serialized request to the new serialized request
    });

});

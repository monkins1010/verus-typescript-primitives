export declare const fromBase58Check: (address: string) => {
    version: number;
    hash: Buffer;
};
export declare const toBase58Check: (hash: Buffer, version: number) => string;
export declare const nameAndParentAddrToIAddr: (name: string, parentIAddr?: string) => string;
export declare const toIAddress: (fullyqualifiedname: string, rootSystemName?: string) => string;
export declare function getDataKey(keyName: string, nameSpaceID?: string, verusChainId?: string): {
    id: string;
    namespace: string;
};
export declare const decodeDestination: (destination: string) => Buffer;
export declare const decodeEthDestination: (destination: string) => Buffer;

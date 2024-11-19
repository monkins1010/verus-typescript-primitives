/// <reference types="node" />
declare class Position {
    i: any;
    h: any;
    r: any;
    constructor(index: any, height: any, rightness: any);
}
export declare class MMR {
    lock: any;
    _leafLength: number;
    db: any;
    constructor(db?: MemoryBasedDb);
    digest(input: any): any;
    get(leafIndex: any): Promise<any>;
    _get(nodePosition: any): Promise<any>;
    append(value: any, leafIndex: any): Promise<void>;
    appendMany(values: any, startLeafIndex: any): Promise<void>;
    getRoot(leafIndex?: number): Promise<any>;
    getNodeLength(): Promise<any>;
    getLeafLength(): Promise<number>;
    delete(leafIndex: any): Promise<void>;
    getProof(leafIndexes: any, referenceTreeLength: any): Promise<any>;
    _getNodeValue(position: any): any;
    _verifyPath(currentPosition: any, currentValue: any, destinationPosition: any): any;
    _setLeafLength(leafLength: any): Promise<void>;
    _hashUp(positionPairs: any): Promise<void>;
    static leftChildPosition(position: any): Position;
    static rightChildPosition(position: any): Position;
    static siblingPosition(position: any): Position;
    static parentIndex(position: any): any;
    static peakPositions(leafIndex: any): any[];
    static localPeakPosition(leafIndex: any, leafLength: any): any;
    static _localPeakPosition(leafIndex: any, peakPositions: any): any;
    static mountainPositions(currentPosition: any, targetNodeIndex: any): any[];
    static godPeakFromLeafIndex(leafIndex: any): Position;
    static getNodePosition(leafIndex: any): Position;
    static proofPositions(leafIndexes: any, referenceTreeLength: any): {};
    static _hasPosition(nodes: any, position: any): boolean;
}
export declare class MemoryBasedDb {
    leafLength: any;
    nodes: {
        [number: number]: Buffer;
    };
    constructor(...args: any[]);
    get(index: any): Promise<Buffer>;
    set(value: any, index: any): Promise<void>;
    getLeafLength(): Promise<any>;
    setLeafLength(leafLength: any): Promise<any>;
    getNodes(): Promise<{
        [number: number]: Buffer;
    }>;
}
export {};

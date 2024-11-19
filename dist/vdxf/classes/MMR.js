"use strict";
// Licence MIT
// Adapted to Verus Blake2b MMR. 
// MMR Code is from
//Copyright (c) 2019 Zac Mitton under MIT License
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
//documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
//the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
//to permit persons to whom the Software is furnished to do so, subject to the following conditions:
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryBasedDb = exports.MMR = void 0;
var blake2b = require('blake2b');
const { Lock } = require('semaphore-async-await');
class Position {
    constructor(index, height, rightness) {
        this.i = index;
        this.h = height;
        this.r = rightness; // inherent unchanging property of every node index
    }
}
class MMR {
    constructor(db = new MemoryBasedDb()) {
        this.db = db;
        this.lock = new Lock(1);
    }
    digest(input) {
        var out = Buffer.allocUnsafe(32);
        return blake2b(out.length, null, null, Buffer.from("VerusDefaultHash")).update(Buffer.concat([...input])).digest(out);
    }
    get(leafIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            let leafValue;
            yield this.lock.acquire();
            try {
                let leafLength = yield this.getLeafLength();
                if (leafIndex >= leafLength) {
                    throw new Error('Leaf not in tree');
                }
                let leafPosition = MMR.getNodePosition(leafIndex);
                let localPeakPosition = MMR.localPeakPosition(leafIndex, leafLength);
                let localPeakValue = yield this._getNodeValue(localPeakPosition);
                leafValue = yield this._verifyPath(localPeakPosition, localPeakValue, leafPosition);
            }
            finally {
                this.lock.release();
            }
            return leafValue;
        });
    }
    _get(nodePosition) {
        return __awaiter(this, void 0, void 0, function* () {
            let nodeValue;
            yield this.lock.acquire();
            try {
                let nodeLength = yield this.getNodeLength();
                let leafLength = yield this.getLeafLength();
                if (nodePosition.i >= nodeLength) {
                    throw new Error('Node not in tree');
                }
                let peakPositions = MMR.peakPositions(leafLength - 1);
                let localPeakPosition;
                for (let i = 0; i < peakPositions.length; i++) {
                    if (peakPositions[i].i >= nodePosition.i) {
                        localPeakPosition = peakPositions[i];
                        break;
                    }
                }
                let localPeakValue = yield this._getNodeValue(localPeakPosition);
                nodeValue = yield this._verifyPath(localPeakPosition, localPeakValue, nodePosition);
            }
            finally {
                this.lock.release();
            }
            return nodeValue;
        });
    }
    append(value, leafIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lock.acquire();
            try {
                let leafLength = yield this.getLeafLength();
                if (leafIndex == undefined || leafIndex == leafLength) {
                    let nodePosition = MMR.getNodePosition(leafLength);
                    let mountainPositions = MMR.mountainPositions(MMR.localPeakPosition(leafLength, leafLength), nodePosition.i);
                    yield this.db.set(value, nodePosition.i);
                    yield this._hashUp(mountainPositions);
                    yield this._setLeafLength(leafLength + 1);
                }
                else {
                    throw new Error('Can only append to end of MMR (leaf ' + leafLength + '). Index ' + leafIndex + ' given.');
                }
            }
            finally {
                this.lock.release();
            }
        });
    }
    appendMany(values, startLeafIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (startLeafIndex == undefined) {
                startLeafIndex = yield this.getLeafLength();
            }
            for (let i = 0; i < values.length; i++) {
                yield this.append(values[i], startLeafIndex + i);
            }
        });
    }
    getRoot(leafIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            let peakValues = [];
            yield this.lock.acquire();
            try {
                if (!leafIndex) {
                    leafIndex = (yield this.getLeafLength()) - 1;
                }
                let peakPositions = MMR.peakPositions(leafIndex);
                for (let i = 0; i < peakPositions.length; i++) {
                    peakValues.push(yield this._getNodeValue(peakPositions[i]));
                }
            }
            finally {
                this.lock.release();
            }
            // note: a single peak differs from its MMR root in that it gets hashed a second time
            return this.digest([...peakValues]);
        });
    }
    getNodeLength() {
        return __awaiter(this, void 0, void 0, function* () { return MMR.getNodePosition(yield this.getLeafLength()).i; });
    }
    getLeafLength() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._leafLength == undefined) { // dirty length
                this._leafLength = yield this.db.getLeafLength();
            }
            return this._leafLength;
        });
    }
    delete(leafIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lock.acquire();
            try {
                let leafLength = yield this.getLeafLength();
                if (leafIndex < leafLength) {
                    yield this._setLeafLength(leafIndex);
                }
            }
            finally {
                this.lock.release();
            }
        });
    }
    getProof(leafIndexes, referenceTreeLength) {
        return __awaiter(this, void 0, void 0, function* () {
            let proofMmr;
            yield this.lock.acquire();
            try {
                referenceTreeLength = referenceTreeLength || (yield this.getLeafLength());
                let positions = MMR.proofPositions(leafIndexes, referenceTreeLength);
                let nodes = {};
                let nodeIndexes = Object.keys(positions);
                yield Promise.all(nodeIndexes.map((i) => __awaiter(this, void 0, void 0, function* () {
                    let nodeValue = yield this._getNodeValue(positions[i]);
                    nodes[i] = nodeValue;
                })));
                proofMmr = new MMR(new MemoryBasedDb(referenceTreeLength, nodes));
            }
            finally {
                this.lock.release();
                return proofMmr;
            }
        });
    }
    _getNodeValue(position) {
        return __awaiter(this, void 0, void 0, function* () {
            // caller's responsibility to request a position within leafLength
            let nodeValue = yield this.db.get(position.i);
            if (nodeValue) {
                return nodeValue;
            }
            else if (position.h > 0) { // implied node
                let leftChildValue = yield this._getNodeValue(MMR.leftChildPosition(position));
                let rightChildValue = yield this._getNodeValue(MMR.rightChildPosition(position));
                return this.digest([leftChildValue, rightChildValue]);
            }
            else {
                throw new Error('Missing node in db');
            }
        });
    }
    _verifyPath(currentPosition, currentValue, destinationPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (currentPosition.i == destinationPosition.i) { // base case
                return currentValue;
            }
            else {
                let leftChildPosition = MMR.leftChildPosition(currentPosition);
                let rightChildPosition = MMR.rightChildPosition(currentPosition);
                let leftValue = yield this._getNodeValue(leftChildPosition);
                let rightValue = yield this._getNodeValue(rightChildPosition);
                if (!currentValue.equals(this.digest([leftValue, rightValue]))) {
                    throw new Error('Hash mismatch of node #' + currentPosition.i + ' and its children');
                }
                if (destinationPosition.i > currentPosition.i - Math.pow(2, currentPosition.h) - currentPosition.h + 1) { //umm yeah, check this line
                    return this._verifyPath(rightChildPosition, rightValue, destinationPosition);
                }
                else {
                    return this._verifyPath(leftChildPosition, leftValue, destinationPosition);
                }
            }
        });
    }
    _setLeafLength(leafLength) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.setLeafLength(leafLength);
            this._leafLength = leafLength;
        });
    }
    _hashUp(positionPairs) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = positionPairs.length - 1; i >= 0; i--) {
                let leftValue = yield this._getNodeValue(positionPairs[i][0]);
                let rightValue = yield this._getNodeValue(positionPairs[i][1]);
                let writeIndex = MMR.parentIndex(positionPairs[i][0]);
                yield this.db.set(this.digest([leftValue, rightValue]), writeIndex);
            }
        });
    }
    static leftChildPosition(position) {
        if (position.h <= 0) {
            throw new Error('Height 0 does not have child');
        }
        return new Position(position.i - Math.pow(2, position.h), position.h - 1, false);
    }
    static rightChildPosition(position) {
        if (position.h <= 0) {
            throw new Error('Height 0 does not have child');
        }
        return new Position(position.i - 1, position.h - 1, true);
    }
    static siblingPosition(position) {
        let multiplier = position.r ? -1 : 1;
        return new Position(position.i + multiplier * (Math.pow(2, (position.h + 1)) - 1), position.h, !position.r);
    }
    static parentIndex(position) {
        if (position.r) {
            return position.i + 1;
        }
        else {
            return position.i + Math.pow(2, (position.h + 1));
        }
    }
    static peakPositions(leafIndex) {
        let currentPosition = this.godPeakFromLeafIndex(leafIndex);
        let peakPositions = [];
        while (leafIndex >= 0) {
            currentPosition = this.leftChildPosition(currentPosition);
            if (leafIndex >= Math.pow(2, currentPosition.h) - 1) {
                peakPositions.push(currentPosition);
                currentPosition = this.siblingPosition(currentPosition);
                leafIndex -= Math.pow(2, currentPosition.h); // leafIndex becomes a kindof accumulator
            }
        }
        return peakPositions;
    }
    static localPeakPosition(leafIndex, leafLength) {
        let lastLeafIndex = leafLength <= leafIndex ? leafIndex : leafLength - 1;
        return MMR._localPeakPosition(leafIndex, MMR.peakPositions(lastLeafIndex));
    }
    static _localPeakPosition(leafIndex, peakPositions) {
        for (let i = 0; i < peakPositions.length; i++) {
            let currentRange = Math.pow(2, (peakPositions[i].h));
            if (leafIndex < currentRange) {
                return peakPositions[i];
            }
            else {
                leafIndex -= currentRange;
            }
        }
    }
    static mountainPositions(currentPosition, targetNodeIndex) {
        let mountainPositions = [];
        while (currentPosition.h > 0) {
            let children = [this.leftChildPosition(currentPosition), this.rightChildPosition(currentPosition)];
            mountainPositions.push(children);
            if (targetNodeIndex > currentPosition.i - Math.pow(2, currentPosition.h) - currentPosition.h + 1) {
                currentPosition = children[1];
            }
            else {
                currentPosition = children[0];
            }
        }
        return mountainPositions;
    }
    static godPeakFromLeafIndex(leafIndex) {
        let peakHeight = 0;
        while (Math.pow(2, peakHeight) <= leafIndex + 1) {
            peakHeight++;
        }
        return new Position(Math.pow(2, (peakHeight + 1)) - 2, peakHeight, false);
    }
    static getNodePosition(leafIndex) {
        let currentPosition = this.godPeakFromLeafIndex(leafIndex);
        let accumulator = 0;
        while (currentPosition.h > 0) {
            let serviceRange = Math.pow(2, (currentPosition.h - 1));
            if (leafIndex >= accumulator + serviceRange) {
                currentPosition = this.rightChildPosition(currentPosition);
                accumulator += serviceRange;
            }
            else {
                currentPosition = this.leftChildPosition(currentPosition);
            }
        }
        return currentPosition;
    }
    static proofPositions(leafIndexes, referenceTreeLength) {
        let positions = {};
        let finalPeakPositions = MMR.peakPositions(referenceTreeLength - 1);
        // add peak positions
        for (let i = 0; i < finalPeakPositions.length; i++) { // log(n)/2
            positions[finalPeakPositions[i].i] = finalPeakPositions[i];
        }
        //add local mountain proof positions for each leaf
        for (let i = 0; i < leafIndexes.length; i++) { // k*2log(n)
            let nodePosition = MMR.getNodePosition(leafIndexes[i]);
            let finalLocalPeak = MMR._localPeakPosition(leafIndexes[i], finalPeakPositions);
            // positions[finalLocalPeak.i] = finalLocalPeak // ?? should already have all peaks
            let mountainPositions = MMR.mountainPositions(finalLocalPeak, nodePosition.i);
            for (let j = 0; j < mountainPositions.length; j++) {
                positions[mountainPositions[j][0].i] = mountainPositions[j][0];
                positions[mountainPositions[j][1].i] = mountainPositions[j][1];
            }
        }
        // find implied positions (ones which can be calculated based on child positions that are present)
        let positionIndexes = Object.keys(positions);
        let impliedIndexes = [];
        for (let j = 0; j < positionIndexes.length; j++) { // k*log(n)
            if (positions[positionIndexes[j]].h > 0) {
                let hasLeftChild = MMR._hasPosition(positions, MMR.leftChildPosition(positions[positionIndexes[j]]));
                let hasRightChild = MMR._hasPosition(positions, MMR.rightChildPosition(positions[positionIndexes[j]]));
                if (hasLeftChild && hasRightChild) {
                    impliedIndexes.push(positionIndexes[j]); // don't remove them yet because recursion will be slower
                }
            }
        }
        // finally remove implied nodes
        for (var i = 0; i < impliedIndexes.length; i++) { // k*log(n)
            impliedIndexes[i];
            delete positions[impliedIndexes[i]];
        }
        return positions;
    }
    static _hasPosition(nodes, position) {
        let has = !!nodes[position.i];
        if (!has && position.h > 0) {
            if (MMR._hasPosition(nodes, MMR.leftChildPosition(position))
                && MMR._hasPosition(nodes, MMR.rightChildPosition(position))) {
                has = true;
            }
        }
        return has;
    }
}
exports.MMR = MMR;
class MemoryBasedDb {
    constructor(...args) {
        if (args[0] == undefined || typeof args[0] == 'number') {
            this.leafLength = args[0] || 0;
            this.nodes = args[1] || {};
        }
    }
    get(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.nodes[index];
        });
    }
    set(value, index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.nodes[index] = value;
        });
    }
    getLeafLength() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.leafLength;
        });
    }
    setLeafLength(leafLength) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.leafLength = leafLength;
        });
    }
    getNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.nodes;
        });
    }
}
exports.MemoryBasedDb = MemoryBasedDb;

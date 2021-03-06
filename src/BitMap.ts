import { assert } from "./util";

// Moderately memory-efficient way of storing some number of bits.

export default class BitMap {
    public words: Uint32Array;

    constructor(public numBits: number) {
        assert(numBits > 0);

        const numWords = (this.numBits + 31) >>> 5;
        this.words = new Uint32Array(numWords);
    }

    public setWord(wordIndex: number, wordValue: number): void {
        this.words[wordIndex] = wordValue;
    }

    public setWords(wordValues: number[], firstWordIndex: number = 0): void {
        for (let i = 0; i < wordValues.length; i++)
            this.words[firstWordIndex + i] = wordValues[i];
    }

    public setBit(bitIndex: number, bitValue: boolean): void {
        const wordIndex = bitIndex >>> 5;
        const mask = 1 << (31 - (bitIndex & 0x1F));
        if (bitValue)
            this.words[wordIndex] |= mask;
        else
            this.words[wordIndex] &= ~mask;
    }

    public getBit(bitIndex: number): boolean {
        const wordIndex = bitIndex >>> 5;
        const mask = 1 << (31 - (bitIndex & 0x1F));
        return !!(this.words[wordIndex] & mask);
    }

    public hasAnyBit(): boolean {
        for (let i = 0; i < this.words.length; i++)
            if (this.words[i] !== 0)
                return true;

        return false;
    }
}

export function bitMapSerialize(view: DataView, offs: number, bitMap: BitMap): number {
    const numBytes = (bitMap.numBits + 7) >>> 3;
    for (let i = 0; i < numBytes; i++) {
        const shift = 24 - ((i & 0x03) << 3);
        view.setUint8(offs++, (bitMap.words[i >>> 2] >>> shift) & 0xFF);
    }
    return offs;
}

export function bitMapDeserialize(view: DataView, offs: number, bitMap: BitMap): number {
    const numBytes = (bitMap.numBits + 7) >>> 3;
    for (let i = 0; i < numBytes; i++) {
        const shift = 24 - ((i & 0x03) << 3);
        bitMap.words[i >>> 2] |= view.getUint8(offs++) << shift;
    }
    return numBytes;
}

interface Entry {
  key: number;
  value: number;
}

/**
 * Transposition Table is a simple hash map with fixed storage size.
 * In case of collision we keep the last entry and overide the previous one.
 */
class TranspositionTable {
  constructor() {
    this.T = [];
  }

  private T: Entry[];

  private index(key: number): number {
    return key % this.T.length;
  }

  /*
   * Empty the Transition Table.
   */
  public reset(): void {
    this.T = [];
  }

  /**
   * Store a value for a given key
   * @param key: 56-bit key
   * @param value: non-null 8-bit value. null (0) value are used to encode missing data.
   */
  public put(key: number, value: number): void {
    const i: number = this.index(key);
    this.T[i].key = key;
    this.T[i].value = value;
  }

  /**
   * Get the value of a key
   * @param key
   * @return 8-bit value associated with the key if present, 0 otherwise.
   */
  public get(key: number): number {
    const i: number = this.index(key); // compute the index position
    if (this.T[i].key === key) {
      return this.T[i].value; // and return value if key matches
    }
    return 0; // or 0 if missing entry
  }
}

export default TranspositionTable;

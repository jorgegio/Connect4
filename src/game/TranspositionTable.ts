export interface TTableEntry {
  key: bigint;
  value: bigint;
}

/**
 * Transposition Table is a simple hash map with fixed storage size.
 * In case of collision we keep the last entry and overide the previous one.
 */
export class TranspositionTable {
  constructor(size: number) {
    this.T = new Map<number, TTableEntry>();
    this.size = size;
  }

  private T: Map<number, TTableEntry>;
  private readonly size: number;

  private index(key: bigint): number {
    return Number(key) % this.size;
  }

  /*
   * Empty the Transition Table.
   */
  public reset(): void {
    this.T.clear();
  }

  /**
   * Store a value for a given key
   * @param key: 56-bit key
   * @param value: non-null 8-bit value. null (0) value are used to encode missing data.
   */
  public put(key: bigint, value: bigint): void {
    const i = Number(this.index(key));
    this.T.set(i, { key, value });
  }

  /**
   * Get the value of a key
   * @param key
   * @return 8-bit value associated with the key if present, 0 otherwise.
   */
  public get(key: bigint): bigint {
    const i = this.index(key); // compute the index position
    const entry: TTableEntry | undefined = this.T.get(i);
    if (entry?.key === key) {
      return entry.value; // and return value if key matches
    }
    return 0n; // or 0 if missing entry
  }
}

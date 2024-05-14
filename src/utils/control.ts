export function repeatNode<T>(len: number, callback: (index: number) => T): T[] {
  if (len === 0 || isNaN(len)) return [];
  return [...Array(len).keys()].map(callback);
}

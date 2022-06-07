import { parseEntry } from "./entry.js";

export function searchDir(view, coords) {
  const nVals = view.byteLength / 17;
  const getVal = k => parseEntry(view, k);
  return binarySearch(getVal, nVals, compareCoords, coords);
}

function compareCoords(a, b) {
  const s = Math.sign;
  return s(b.z - a.z) || s(b.x - a.x) || s(b.y - a.y);
}

function binarySearch(getVal, nVals, compare, target) {
  let m = 0;
  let n = nVals - 1;

  while (m <= n) {
    const k = (n + m) >> 1; // === Math.floor((n + m) / 2) ?
    const val = getVal(k);
    const cmp = compare(val, target);

    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return val;
    }
  }

  return null;
}

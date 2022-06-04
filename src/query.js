import { parseEntry } from "./entry.js";

export function queryTile(view, z, x, y) {
  const entry = queryView(view, z, x, y);
  if (entry && entry.is_dir) {
    throw Error("queryTile: got a directory instead of a tile");
  }
  return entry;
}

export function queryLeafdir(view, tile) {
  // Directory entries are at the end, and all have the same z value
  const numEntries = view.byteLength / 17;
  const lastEntry = parseEntry(view, numEntries - 1);
  if (!lastEntry.is_dir) return null;

  // Find the coordinates of the leaf directory containing the tile
  const z = lastEntry.z;
  const zscale = 1 / 2 ** (tile.z - z);
  const x = Math.trunc(tile.x * zscale);
  const y = Math.trunc(tile.y * zscale);

  // Find the entry for this leaf directory
  const entry = queryView(view, z | 0x80, x, y);
  if (entry && !entry.is_dir) {
    throw Error("queryLeafdir: got a tile instead of a directory");
  }
  return entry;
}

function queryView(view, z, x, y) {
  let m = 0;
  let n = view.byteLength / 17 - 1;

  while (m <= n) {
    const k = (n + m) >> 1; // === Math.floor((n + m) / 2) ??
    const entry = parseEntry(view, k);
    const cmp = compareCoords(entry, { z, x, y });

    if (cmp > 0) {
      m = k + 1; // TODO: Next round we get a half-way point?
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return entry;
    }
  }

  return null;
}

function compareCoords(a, b) {
  const s = Math.sign;
  return s(b.z - a.z) || s(b.x - a.x) || s(b.y - a.y);
}

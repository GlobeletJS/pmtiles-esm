import { initLeafCache } from "./leaf-cache.js";
import { searchDir } from "./search-dir.js";
import { parseEntry } from "./entry.js";

export function initTileGetter(root) {
  const getLeafDir = initLeafCache(root.url);

  return { 
    getEntry: (coords) => findTileEntry(root.dir, coords),
    getTile: (coords) => findTileEntry(root.dir, coords).then(readTile),
  };

  function findTileEntry(dir, coords) {
    const entry = searchDir(dir, coords);
    if (entry && !entry.is_dir) return Promise.resolve(entry);

    const leafEntry = findLeafEntry(dir, coords);
    if (!leafEntry) {
      const msg = "Nothing found for coords " + JSON.stringify(coords);
      return Promise.reject(Error(msg));
    }

    return getLeafDir(leafEntry)
      .then(leafDir => findTileEntry(leafDir, coords)); // Recursive call
  }

  function readTile(entry) {
    const { offset, length } = entry;
    const lastByte = offset + length - 1;
    const headers = { Range: "bytes=" + offset + "-" + lastByte };

    return fetch(root.url, { headers })
      .then(response => response.arrayBuffer());
  }
}

function findLeafEntry(dir, coords) {
  const numEntries = dir.byteLength / 17;
  const lastEntry = parseEntry(dir, numEntries - 1);
  if (!lastEntry.is_dir) return null;

  const zscale = 1 / 2 ** (coords.z - lastEntry.z);
  const x = Math.trunc(coords.x * zscale);
  const y = Math.trunc(coords.y * zscale);
  const z = lastEntry.z | 0x80;

  return searchDir(dir, { z, x, y });
}

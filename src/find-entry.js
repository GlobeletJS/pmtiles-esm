import { initLeafCache } from "./leaf-cache.js";
import { searchDir } from "./search-dir.js";
import { parseEntry } from "./entry.js";

export function initTileFinder(root) {
  const getLeafDir = initLeafCache(root.url);

  return function(coords) {
    return findTileEntry(root.dir, coords);
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
      .then(leafDir => findTileEntry(leafDir, coords));
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

import { initTileFinder } from "./find-entry.js";

export function initTileGetter(root) {
  const findEntry = initTileFinder(root);

  return function(coords) {
    return findEntry(coords).then(readTile);
  };

  function readTile(entry) {
    const { offset, length } = entry;
    const lastByte = offset + length - 1;
    const headers = { Range: "bytes=" + offset + "-" + lastByte };

    return fetch(root.url, { headers })
      .then(response => response.arrayBuffer());
  }
}

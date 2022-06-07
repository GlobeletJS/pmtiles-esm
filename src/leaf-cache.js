export function initLeafCache(url, maxLeaves = 64) {
  const leaves = new Map();

  return function(entry) {
    const leaf = leaves.get(entry.offset);
    if (!leaf) return fetchLeaf(entry);

    leaf.lastUsed = performance.now();
    return Promise.resolve(leaf.dir);
  };

  function fetchLeaf(entry) {
    const lastByte = entry.offset + entry.length - 1;
    const headers = { Range: "bytes=" + entry.offset + "-" + lastByte };

    return fetch(url, { headers })
      .then(response => response.arrayBuffer())
      .then(buffer => new DataView(buffer))
      .then(dir => cacheLeaf(entry, dir));
  }

  function cacheLeaf(entry, dir) {
    const lastUsed = performance.now();
    leaves.set(entry.offset, { lastUsed, dir });

    if (leaves.size > maxLeaves) pruneLeastRecentlyUsedLeaf();
    return dir;
  }

  function pruneLeastRecentlyUsedLeaf() {
    let minUsed = Infinity;
    let minKey = undefined;

    leaves.forEach((val, key) => {
      if (val.lastUsed > minUsed) return;
      minUsed = val.lastUsed;
      minKey = key;
    });

    if (minKey) leaves.delete(minKey);
  }
}

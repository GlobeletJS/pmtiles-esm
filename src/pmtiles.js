import { fetchRoot } from "./root.js";
import { queryTile, queryLeafdir } from "./query.js";

export class PMTiles {
  constructor(url, maxLeaves = 64) {
    this.root = null;
    this.url = url;
    this.leaves = new Map();
    this.maxLeaves = maxLeaves;
  }

  async metadata() {
    const root = await this.getRoot();
    return root.metadata;
  }

  async getRoot() {
    if (this.root) return this.root;
    this.root = await fetchRoot(this.url);
    return this.root;
  }

  async getZxy(z, x, y) {
    const root = await this.getRoot();
    const entry = queryTile(root.dir, z, x, y);
    if (entry) return entry;

    const leafdir_entry = queryLeafdir(root.dir, { z, x, y });
    if (!leafdir_entry) return null;

    const leafdir = await this.getLeafdir(leafdir_entry);
    return queryTile(new DataView(leafdir), z, x, y);
  }

  async getLeafdir(entry) {
    const leaf = this.leaves.get(entry.offset);
    if (leaf) return leaf.buffer;

    const buffer = await this.fetchLeafdir(entry);

    // Add this leaf directory to the leaves Map
    this.leaves.set(entry.offset, {
      lastUsed: performance.now(),
      buffer,
    });

    // Make sure the leaves Map is not getting too big: remove the oldest
    if (this.leaves.size > this.maxLeaves) {
      let minUsed = Infinity;
      let minKey = undefined;
      this.leaves.forEach((val, key) => {
        if (val.lastUsed < minUsed) {
          minUsed = val.lastUsed;
          minKey = key;
        }
      });
      if (minKey) this.leaves.delete(minKey);
    }

    return buffer;
  }

  fetchLeafdir(entry) {
    const lastByte = entry.offset + entry.length - 1;
    const headers = { Range: "bytes=" + entry.offset + "-" + lastByte };

    return fetch(this.url, { headers })
      .then(response => response.arrayBuffer());
  }
}

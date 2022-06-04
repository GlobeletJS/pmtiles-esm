import { PMTiles } from "./pmtiles.js";

export class ProtocolCache {
  tiles;

  constructor() {
    this.tiles = new Map();
  }

  add(p) {
    this.tiles.set(p.url, p);
  }

  get(url) {
    return this.tiles.get(url);
  }

  protocol(params, callback) {
    const re = new RegExp(/pmtiles:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/);
    const result = params.url.match(re);
    const [, url, z, x, y] = result[1];

    let instance = this.tiles.get(url);
    if (!instance) {
      instance = new PMTiles(url);
      this.tiles.set(url, instance);
    }
    let cancel = () => {};

    instance.getZxy(+z, +x, +y).then((val) => {
      if (!val) return callback(null, new Uint8Array(), null, null);

      const controller = new AbortController();
      cancel = () => controller.abort();
      const lastByte = val.offset + val.length - 1;
      const headers = { Range: "bytes=" + val.offset + "-" + lastByte };

      fetch(url, { signal: controller.signal, headers })
        .then(resp => resp.arrayBuffer())
        .then(arr => callback(null, arr, null, null))
        .catch(() => callback(new Error("Canceled"), null, null, null));
    });

    return { cancel: () => cancel() }; // cancel method may change
  }
}

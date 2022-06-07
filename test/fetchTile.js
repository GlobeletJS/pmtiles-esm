import fetch from "node-fetch";
import Protobuf from "pbf-esm";
import { VectorTile } from "../node_modules/vector-tile-esm/src/index.js";
import { fetchRoot } from "../src/root.js";
import { initTileGetter } from "../src/fetch-tile.js";

global.fetch = fetch;
const pmtilesUrl = "http://localhost:8082/pmtiles-esm/examples/test.pmtiles";

const testTile = { z: 13, x: 1931, y: 3396 };

function parseMVT(buffer) {
  const tile = new VectorTile(new Protobuf(buffer));

  const size = 512;

  return Object.values(tile.layers)
    .reduce((d, l) => (d[l.name] = l.toGeoJSON(size), d), {});
}

fetchRoot(pmtilesUrl)
  .then(initTileGetter)
  .then(getter => getter.getTile(testTile))
  .then(parseMVT)
  .then(json => console.log(JSON.stringify(json, null, 2)))
  .catch(err => console.log(err.message));

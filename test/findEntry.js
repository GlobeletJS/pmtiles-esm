import fetch from "node-fetch";
import { fetchRoot } from "../src/root.js";
import { initTileGetter } from "../src/fetch-tile.js";

global.fetch = fetch;
const pmtilesUrl = "http://localhost:8082/pmtiles-esm/examples/test.pmtiles";

const testTile = { z: 13, x: 1931, y: 3396 };

fetchRoot(pmtilesUrl)
  .then(initTileGetter)
  .then(getter => getter.getEntry(testTile))
  .then(entry => console.log(JSON.stringify(entry)))
  .catch(err => console.log(err.message));

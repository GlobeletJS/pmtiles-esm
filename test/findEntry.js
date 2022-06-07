import fetch from "node-fetch";
import { fetchRoot } from "../src/root.js";
import { initTileFinder } from "../src/find-entry.js";

global.fetch = fetch;
const pmtilesUrl = "http://localhost:8082/pmtiles-esm/examples/test.pmtiles";

const testTile = { z: 13, x: 1931, y: 3396 };

fetchRoot(pmtilesUrl)
  .then(initTileFinder)
  .then(getTile => getTile(testTile))
  .then(entry => console.log(JSON.stringify(entry)))
  .catch(err => console.log(err.message));

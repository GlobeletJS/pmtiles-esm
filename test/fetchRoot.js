import fetch from "node-fetch";
import { fetchRoot } from "../src/root.js";

global.fetch = fetch;
const pmtilesUrl = "http://localhost:8082/pmtiles-esm/examples/test.pmtiles";

fetchRoot(pmtilesUrl)
  .then(root => {
    root.metadata.json = JSON.parse(root.metadata.json);
    console.log(JSON.stringify(root.metadata, null, 2));
    return root;
  });

export function getMetaData(metaView) {
  const dec = new TextDecoder("utf-8");
  const metadata = JSON.parse(dec.decode(metaView));

  const { compression, bounds, minzoom, maxzoom } = metadata;

  if (compression) console.warn("Archive has compression type: " +
    compression + " and may not be readable directly by browsers");

  if (bounds === undefined) throw missingMeta("bounds");
  if (minzoom === undefined) throw missingMeta("minzoom");
  if (maxzoom === undefined) throw missingMeta("maxzoom");

  return metadata;
}

function missingMeta(prop) {
  const msg = "pmtiles v2 REQUIRES a " + prop + " property in the metadata";
  return Error(msg);
}

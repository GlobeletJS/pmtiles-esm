import { getMetaData } from "./metadata.js";

export function fetchRoot(url) {
  const controller = new AbortController();
  const headers = { Range: "bytes=0-511999" };

  return fetch(url, { signal: controller.signal, headers })
    .then(getBuffer)
    .then(buffer => parseRoot(buffer, url))
    .catch(error => {
      controller.abort();
      console.error(error);
    });
}

function getBuffer(response) {
  const length = response.headers.get("Content-Length");
  if (length && +length === 512000) return response.arrayBuffer();

  throw Error("Content-Length mismatch: byte serving not supported. Aborting");
}

function parseRoot(buffer, url) {
  // First 10 bytes tell us how to divide the rest of the buffer
  const headerView = new DataView(buffer, 0, 10);
  const { metaLength, dirStart, dirEnd } = parseHeader(headerView);

  // Parse metadata as JSON
  const metaView = new DataView(buffer, 10, metaLength);
  const metadata = getMetaData(metaView);

  // Root directory: Start from a slice so main buffer can be garbage-collected
  const dirBuffer = buffer.slice(dirStart, dirEnd);
  const dir = new DataView(dirBuffer);

  // NOTE: dir.buffer is a Transferable
  return { dir, metadata, url };
}

function parseHeader(headerView) {
  const magic = headerView.getUint16(0, true);
  const version = headerView.getUint16(2, true);
  const metaLength = headerView.getUint32(4, true);
  const dirEntries = headerView.getUint16(8, true);

  if (magic !== 19792) throw Error('File header does not begin with "PM"');
  if (version === 1) throw Error("File is pmtiles v1: no longer supported!");

  const dirStart = 10 + metaLength;
  const dirEnd = dirStart + dirEntries * 17;

  return { metaLength, dirStart, dirEnd };
}

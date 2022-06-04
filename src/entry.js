export function parseEntry(view, i) {
  const j = i * 17;
  const z_raw = view.getUint8(j);

  return {
    z: z_raw & 127,
    x: getUint24(view, j + 1),
    y: getUint24(view, j + 4),
    offset: getUint48(view, j + 7),
    length: view.getUint32(j + 13, true),
    is_dir: z_raw >> 7 === 1,
  };
}

function getUint24(view, pos) {
  return shift(view.getUint16(pos + 1, true), 8) + view.getUint8(pos);
}

function getUint48(view, pos) {
  return shift(view.getUint32(pos + 2, true), 16) + view.getUint16(pos, true);
}

function shift(n, shift) {
  return n * Math.pow(2, shift);
}

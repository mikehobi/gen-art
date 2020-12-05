export function distance(a, b) {
  let [aX, aY] = a;
  let [bX, bY] = b;
  return Math.sqrt(Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2));
}

export function distSq(a, b) {
  let [ax, ay] = a;
  let [bx, by] = b;
  var dx = bx - ax;
  var dy = by - ay;
  return dx * dx + dy * dy;
  // return Math.sqrt(Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2));
}

export function griddy(rows, cols) {
  let grid = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let i = 0; i < cols; i++) {
      row.push(undefined);
    }
    grid.push(row);
  }
  // let grid = Array(rows);
  // grid.fill(Array(cols));
  return grid;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function pixelData(data, w, h, x, y) {
  // console.log(data);

  let xx = 0 + x * 4;
  let yy = 4 + y * 4;
  let index = xx + yy * h - 4;

  var r = data[index];
  var g = data[index + 1];
  var b = data[index + 2];
  var a = data[index + 3] / 255;

  return [r ?? 0, g ?? 0, b ?? 0, a ?? 0];
}

export function offsetLines(lines, offset) {
  let newLines = [];
  let [offsetX, offsetY] = offset;
  lines.forEach((points) => {
    let newPoints = [];
    points.forEach((point) => {
      let [x, y] = point;
      newPoints.push([x + offsetX, y + offsetY]);
    });
    newLines.push(newPoints);
  });
  return newLines;
}

export const gridIndex = (x, y, cols) => {
  return x + cols * y;
};

export const gridCoord = (index, cols) => {
  let x = index % cols;
  let y = Math.floor(index / cols);
  return [x, y];
};

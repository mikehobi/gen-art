const { inverseLerp, lerp } = require("canvas-sketch-util/math");

export function distance(a, b) {
  let [aX, aY] = a;
  let [bX, bY] = b;
  return Math.sqrt(Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2));
}

export const inch = (inch) => {
  return 2.54 * inch;
};

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

export function sphereize(lines, startX, startY, endX, endY) {
  let newLines = [];
  lines.forEach((points) => {
    let newPoints = [];
    points.forEach((point) => {
      let [x, y] = point;

      let u = inverseLerp(startX, endX, x);
      let v = inverseLerp(endX, endY, y);

      let uu = u * Math.PI + Math.PI * 0.5;
      let vv = v * Math.PI;

      u = Math.sin(uu) * Math.sin(vv);
      v = Math.cos(vv);
      let z = Math.cos(uu) * Math.sin(vv);

      var scale = 0.5;

      u *= scale;
      v *= scale;

      u += scale;
      v += scale;

      x = lerp(startX, endX, u);
      y = lerp(startY, endY, v);

      newPoints.push([x, y]);
    });
    newLines.push(newPoints);
  });
  return newLines;
}

function cylinder(pos) {
  let [u, v] = pos;

  let uu = u * Math.PI * 2 + Math.PI * 0.5;
  let vv = -1 + 2 * v;

  u = Math.sin(uu);
  v = vv;

  u *= 0.5;
  v *= 0.5;
  u += 0.5;
  v += 0.5;

  let z = Math.cos(uu);
  v += z * 0.1;

  return [u, v];
}

function sphere(pos) {
  let [u, v] = pos;

  let uu = u * Math.PI * 2 + Math.PI * 0.5;
  let vv = v * Math.PI;

  u = Math.sin(uu) * Math.sin(vv);
  v = Math.cos(vv);
  u *= 0.5;
  v *= 0.5;
  u += 0.5;
  v += 0.5;

  let z = Math.cos(uu) * Math.sin(vv + Math.PI);

  return [u, v];
}

export const gridIndex = (x, y, cols) => {
  return x + cols * y;
};

export const gridCoord = (index, cols) => {
  let x = index % cols;
  let y = Math.floor(index / cols);
  return [x, y];
};

export function inside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  var x = point[0],
    y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

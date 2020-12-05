const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { offsetLines } = require("../utils");

const settings = {
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 8;
const xmargin = 6;

const rowCount = 70;
const colCount = 46;
const createGrid = (rowCount, colCount) => {
  const rows = [];
  for (let y = 0; y < rowCount; y++) {
    let arr = [];
    for (let x = 0; x < colCount; x++) {
      const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
      const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);
      arr.push({
        pos: [u, v],
      });
    }
    rows.push(arr);
  }
  return rows;
};

const sketch = (props) => {
  const { width, height, units } = props;

  const points = createGrid(rowCount, colCount);

  let paths = [];

  let last = [0, 0];

  // Aply
  function noisy(pos) {
    let [u, v] = pos;
    let r = random.chance(v * v);

    // v += v * 0.3;

    if (r) {
      let amount = 0.09 * v * v;
      v += random.range(-amount, amount);
      u += random.range(-amount, amount);

      let r2 = random.chance(v * v * v);
      if (r2) {
        v += 0.1 * v + 0.2 * v;
      }
    }

    // let noise = random.noise2D(u, v, 2, 0.05;
    // u += noise;
    return [u, v];
  }

  points.forEach((arr, index) => {
    // Start at beginning
    var [u, v] = arr[0].pos;
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);
    last = [x, y];

    arr.forEach((i) => {
      const p = createPath((context) => {
        var [u, v] = noisy(i.pos);
        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v);
        context.moveTo(x, y);
        context.lineTo(x + 0.001, y + 0.001);
      });

      paths.push(p);
    });
  });

  let lines = pathsToPolylines(paths, { units });

  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];
  lines = clipPolylinesToBox(lines, box);

  lines = offsetLines(lines, [0, -2]);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.05,
      optimize: true,
    });
};

canvasSketch(sketch, settings);

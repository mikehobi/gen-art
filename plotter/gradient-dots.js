const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 10;
const xmargin = 8;

const rowCount = 200;
const colCount = 200;
const createGrid = (rowCount, colCount) => {
  const rows = [];
  for (let y = 0; y < rowCount; y++) {
    let arr = [];
    for (let x = 0; x < colCount; x++) {
      const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
      const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);

      let r = random.chance(v);

      if (r) {
        arr.push({
          pos: [u, v],
        });
      }
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

  function noisy(pos) {
    let [u, v] = pos;
    let noise = random.noise2D(u, v, 10.0, 1);
    u += Math.sin(noise) * 0.002;
    return [u, v];
  }

  points.forEach((arr, index) => {
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

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.01,
      // optimize: true,
    });
};

canvasSketch(sketch, settings);

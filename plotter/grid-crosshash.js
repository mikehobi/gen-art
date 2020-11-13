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

const ymargin = 8;
const xmargin = 4;

const rowCount = 70;
const colCount = 10;

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

  // random.setSeed(4444);
  random.setSeed(2114);

  const points = createGrid(rowCount, colCount);

  let paths = [];

  let last = [0, 0];

  function noisy(pos, invert) {
    let [u, v] = pos;
    let f = 2;
    var noise = random.noise2D(u, v, f, (30 / f) * (1 / rowCount));

    if (invert) {
      v += noise * 0.4 * Math.sin(v * Math.PI * 2);
    } else {
      v += noise * 0.4 * Math.sin(v * Math.PI * 2);
    }

    return [u, v];
  }

  points.forEach((arr) => {
    // Start at beginning
    var [u, v] = noisy(arr[0].pos);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);
    last = [x, y];

    arr.forEach((i) => {
      const p = createPath((context) => {
        var [u, v] = noisy(i.pos);

        // Use last coord if needed.
        var [x, y] = last;
        context.moveTo(x, y);

        var toX = lerp(xmargin, width - xmargin, u);
        var toY = lerp(ymargin, height - ymargin, v);

        context.lineTo(toX, toY);

        context.closePath();

        last = [toX, toY];
      });

      paths.push(p);
    });

    var [v, u] = noisy(arr[0].pos);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);
    last = [x, y];

    arr.forEach((i) => {
      const p = createPath((context) => {
        var [v, u] = noisy(i.pos, true);
        var [x, y] = last;
        context.moveTo(x, y);

        var toX = lerp(xmargin, width - xmargin, u);
        var toY = lerp(ymargin, height - ymargin, v);

        context.lineTo(toX, toY);

        last = [toX, toY];
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
      lineWidth: 0.03,
      optimize: true,
    });
};

canvasSketch(sketch, settings);

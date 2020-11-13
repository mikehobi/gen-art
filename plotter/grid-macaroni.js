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
  // dimensions: "A4",
  dimensions: "postcard",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 1;
const xmargin = 1;

const rowCount = 10;
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

  const points = createGrid(rowCount, colCount);

  let paths = [];

  let last = [0, 0];

  function noisy(pos) {
    let [u, v] = pos;
    let noise = random.noise2D(u, v, 1.0, 3);
    u += Math.sin(noise) * 0.01;
    v += Math.cos(noise) * 0.01;
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
        var [u, v] = i.pos;

        // Use last coord if needed.
        // var [x, y] = last;

        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v);

        // let [toU, toV] = noisy(i.pos);

        // var toX = lerp(xmargin, width - xmargin, toU);
        // var toY = lerp(ymargin, height - ymargin, toV);

        // context.moveTo(x, y);
        let p = random.noise2D(u, v, 4.0, 7.14);
        // let p2 = random.noise2D(u + 1, v + 1, 10.0, 1);
        let start = p;
        let end = p + Math.PI * 1.999998;
        context.arc(x, y, 0.5, start, end);

        last = [x, y];
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
      lineWidth: 0.05,
      optimize: true,
    });
};

canvasSketch(sketch, settings);

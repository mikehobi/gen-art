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
  dimensions: "tabloid",
  units: "cm",
  pixelsPerInch: 300,
};

const drawHeight = 20;
const drawWidth = 20;

// const ymargin = 6;
// const xmargin = 4;

const rowCount = 70;
const colCount = 70;
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

  const ymargin = (height - drawHeight) / 2;
  const xmargin = (width - drawWidth) / 2;

  const points = createGrid(rowCount, colCount);

  let paths = [];

  let last = [0, 0];

  let gridWidth = width - xmargin * 2;
  let tileWidth = gridWidth / colCount;
  let gridHeight = height - ymargin * 2;
  let tileHeight = gridHeight / rowCount;

  points.forEach((arr, index) => {
    // Start at beginning
    var [u, v] = arr[0].pos;
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);
    last = [x, y];

    arr.forEach((i) => {
      const p = createPath((context) => {
        var [u, v] = i.pos;
        var [lx, ly] = last;

        // center
        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v);

        let noise = random.noise2D(u, v, 2.5);

        // context.moveTo(lx, ly);
        context.moveTo(x - tileWidth / 2, y - tileHeight / 2 + noise);
        context.lineTo(x + tileWidth / 2, y + tileHeight / 2 + noise);

        last = [x + tileWidth / 2, y + tileHeight / 2 + noise];
      });

      paths.push(p);
    });
  });

  let lines = pathsToPolylines(paths, { units });

  // const margin = 1;
  // const box = [margin, margin, width - margin, height - margin];
  // lines = clipPolylinesToBox(lines, box);

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

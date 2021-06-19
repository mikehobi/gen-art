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

const drawHeight = 30;
const drawWidth = 20;

// const ymargin = 6;
// const xmargin = 4;

const rowCount = 15;
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
        // var [lx, ly] = last;

        var x = lerp(xmargin, width - xmargin - tileWidth, u);
        var y = lerp(ymargin, height - ymargin - tileHeight, v);

        // const noise = random.noise2D(u, v, 2);
        // const noiseX = random.noise2D(u + 999, v, 2);

        // var centerX = x + tileWidth / 2;
        var centerY = y + tileHeight / 2;

        for (var j = 0; j < 16; j++) {
          let rl = random.range(y, y + tileHeight);
          let rl2 = random.range(y, y + tileHeight);

          context.moveTo(x, rl);
          context.bezierCurveTo(
            x,
            centerY + random.noise2D(u, v, 2) * 3,
            x + tileWidth,
            centerY + random.noise2D(u, v, 2) * 3,
            x + tileWidth,
            rl2
          );
        }
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
      lineWidth: 0.02,
      optimize: true,
    });
};

canvasSketch(sketch, settings);

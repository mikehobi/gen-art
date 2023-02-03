const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const {
  clipPolylinesToBox,
  createHatchLines,
} = require("canvas-sketch-util/geometry");
const { lerp, mapRange } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
var renderPath = 1;
const settings = {
  dimensions: "tabloid",
  units: "cm",
  pixelsPerInch: 300,

  name: "(hills)" + renderPath,
  suffix: random.getSeed(),
};

const inch = (inch) => {
  return 2.54 * inch;
};

// const defaultSeed = "597277";
const defaultSeed = "657283";
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

// Adjust margins to drawHeight and drawWidth
const drawHeight = 16;
const drawWidth = 10;

const ymargin = inch((17 - drawHeight) / 2);
const xmargin = inch((11 - drawWidth) / 2);

const rowCount = 50;
const colCount = 2;

const offset = [0, 0]; // y min, y max

const sketch = (props) => {
  const { width, height, units } = props;

  const createGrid = () => {
    const rows = [];
    for (let y = 0; y < rowCount; y++) {
      let arr = [];
      for (let x = 0; x < colCount; x++) {
        const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
        const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);
        arr.push({
          pos: [u, 1 - v],
        });
      }
      rows.push(arr);
    }
    return rows;
  };

  const points = createGrid();

  let paths = [];
  let last = [0, 0];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  points.forEach((arr, row) => {
    var [u, v] = arr[0].pos;
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);
    last = [x, y];

    arr.forEach((point, col) => {
      var [u, v] = point.pos;
      var [lastX, lastY] = last;

      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

      const p = createPath((context) => {
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
      });

      paths.push(p);

      last = [x, y];
    });
  });

  lines = pathsToPolylines(paths, { units });

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.01,
      optimize: {
        sort: false,
        removeDuplicates: false,
        removeCollinear: false,
        merge: true,
      },
    });
};

canvasSketch(sketch, settings);

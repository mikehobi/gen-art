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
const drawHeight = 14;
const drawWidth = 8;

const ymargin = inch((17 - drawHeight) / 2);
const xmargin = inch((11 - drawWidth) / 2);

const rowCount = 160;
const colCount = 20;

const intensity = 0.009;
const frequency = 2.4;
const z = 0.9;
const zShift = 0.05;
const offset = [0, 0]; // y min, y max

var viewAllPaths = false;

if (viewAllPaths) {
  renderPath = -1;
}

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

  function noisy(pos, z) {
    let [u, v] = pos;
    let noise = random.noise3D(u, v, z, frequency, intensity);
    noise *= Math.sin(v * Math.PI);
    v += noise;
    return [u, v];
  }

  let center = {
    x: width / 2,
    y: height / 2,
  };

  let min = -intensity;
  let max = intensity;

  function dipInInk() {
    const p = createPath((context) => {
      context.moveTo(2, 2);
      context.lineTo(2.05, 2.05);
    });
    paths.push(p);
  }

  if (renderPath == 0 || renderPath == -1) {
    points.forEach((arr, row) => {
      dipInInk();

      var [u, v] = noisy(arr[0].pos, z + zShift);
      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v);
      last = [x, y];

      arr.forEach((point, col) => {
        var [u, v] = noisy(point.pos, z + zShift);
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
  }

  if (renderPath == 1 || renderPath == -1) {
    points.forEach((arr, row) => {
      dipInInk();
      var [u, v] = noisy(arr[arr.length - 1].pos, z + zShift + zShift);
      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v);
      last = [x, y];

      arr.reverse().forEach((point, col) => {
        var [u, v] = noisy(point.pos, z + zShift + zShift);
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
  }

  if (renderPath == 2 || renderPath == -1) {
    points.forEach((arr, row) => {
      var [u, v] = noisy(arr[0].pos, z);
      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v);
      last = [x, y];

      arr.forEach((point, col) => {
        var [u, v] = noisy(point.pos, z);
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
  }

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

const unevenFrames = (x, y, width, height, count = 5) => {
  let lines = [];

  function noisyXY(x, y, i) {
    let a = random.noise2D(x + i, y + i, 1.0, 0.25);
    let b = random.noise2D(x + i, y + i, 1.0, 0.25);
    return [x + a, y + b];
  }

  function noisyMoveTo(context, x, y, i) {
    let [xx, yy] = noisyXY(x, y, i);
    context.moveTo(xx, yy);
  }

  function noisyLineTo(context, x, y, i) {
    // let n = random.noise2D(x + i, y + i, 1.0, 0.5);
    let [xx, yy] = noisyXY(x, y, i);
    context.lineTo(xx, yy);
  }

  for (let i = 0; i < count; i++) {
    let p = createPath((context) => {
      noisyMoveTo(context, x, y, i);
      noisyLineTo(context, width - x, y, i);
      noisyLineTo(context, width - x, height - y, i);
      noisyLineTo(context, x, height - y, i);
      noisyLineTo(context, x, y, i);
    });
    lines.push(p);
  }

  return lines;
};

canvasSketch(sketch, settings);

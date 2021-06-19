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

const inch = (inch) => {
  return 2.54 * inch;
};

const defaultSeed = "865791";
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  dimensions: "letter",
  units: "cm",
  pixelsPerInch: 300,
  prefix: "(hills2)",
  suffix: random.getSeed(),
};

// Adjust margins to drawHeight and drawWidth
const drawHeight = 4;
const drawWidth = 4;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);

const rowCount = 300;
const colCount = 200;

const intensity = 0.008;
const frequency = 10;
const z = 0.09;
const zShift = 0.02;
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

  let paths = [[], []];
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

  points.forEach((arr, row) => {
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

      // DIVIDE
      let noise = random.noise3D(x * 0.5, y * 2, 999, 1, 1);
      let index = 0;
      if (noise > 0) {
        index = 1;
      }

      paths[index].push(p);

      last = [x, y];
    });
  });

  lines = pathsToPolylines(paths[1], { units });

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

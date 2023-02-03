const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const {
  clipPolylinesToBox,
  createHatchLines,
  clipLineToCircle,
} = require("canvas-sketch-util/geometry");
const { lerp, mapRange } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { noise1D } = require("canvas-sketch-util/random");

const settings = {
  dimensions: "letter",
  units: "cm",
  pixelsPerInch: 300,
};

const inch = (inch) => {
  return 2.54 * inch;
};

// const defaultSeed = "3290320";
const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

// Adjust margins to drawHeight and drawWidth
const drawHeight = 4.5;
const drawWidth = 4.5;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);

const rowCount = 100;
const colCount = 100;

const intensity = 0.03;
const frequency = 4;
const z = 0;
const offset = [0, 0]; // y min, y max

const zShift = 0.01;

const cmy = ["yellow", "cyan", "magenta"];

function indexFromColor(color) {
  return cmy.indexOf(color);
}

const renderColor = "magenta";

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

  // let paths = [];
  let last = [0, 0];

  function noisy(pos, z, sphere = true) {
    let [u, v] = pos;

    let uu = u * Math.PI + Math.PI * 0.5;
    let vv = v * Math.PI;

    // if (sphere) {
    u = Math.sin(uu) * Math.sin(vv);
    v = Math.cos(vv);
    u *= 0.5;
    v *= 0.5;
    u += 0.5;
    v += 0.5;
    // }

    let noise = random.noise3D(u, v, z, frequency, intensity);
    v += noise;
    // u += noise;

    return [u, v];
  }

  let center = {
    x: width / 2,
    y: height / 2,
  };

  let min = -intensity;
  let max = intensity;

  let paths = [[], [], []];

  const [r, g, b] = cmy;
  let COLORS = [r];
  COLORS.forEach((color, index) => {
    points.forEach((arr, z) => {
      // let rand = noise1D(z) > 0;
      let rand = random.rangeFloor(0, 3);

      var [u, v] = noisy(arr[0].pos, z + index * zShift, 1);
      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v);
      last = [x, y];

      arr.forEach((point, col) => {
        var [u, v] = noisy(point.pos, z + index * zShift, 1);
        var [lastX, lastY] = last;

        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

        const p = createPath((context) => {
          context.moveTo(lastX, lastY);
          context.lineTo(x, y);
        });

        console.log(indexFromColor(color));
        paths[indexFromColor(color)].push(p);

        last = [x, y];
      });
    });
  });

  // pathsToRender = paths[indexFromColor(renderColor)];
  pathsToRender = paths;

  lines = pathsToPolylines(pathsToRender, { units });
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

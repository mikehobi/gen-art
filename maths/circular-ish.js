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

const settings = {
  dimensions: [1080, 1920],
  pixelsPerInch: 300,
  animate: true,
  duration: 15,
};

const inch = (inch) => {
  return 2.54 * inch;
};

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

// Adjust margins to drawHeight and drawWidth
const drawHeight = 800;
const drawWidth = 800;

// const ymargin = inch((11 - drawHeight) / 2);
// const xmargin = inch((8.5 - drawWidth) / 2);

const ymargin = (1920 - drawHeight) / 2;
const xmargin = (1080 - drawHeight) / 2;

const rowCount = 100;
const colCount = 50;

const intensity = 0.004;
const frequency = 10;
const z = 0;
const offset = [0, 0]; // y min, y max

const zShift = 0.1;
const cmy = ["yellow", "magenta", "red"];
const [r, g, b] = cmy;

var viewAllPaths = false;
var renderPath = 0;

if (viewAllPaths) {
  renderPath = -1;
}

const sketch = () => {
  return ({ context, width, height, playhead }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

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

    let last = [0, 0];

    function noisy(pos, z, playhead) {
      let [u, v] = pos;
      let noise = random.noise3D(
        u + playhead,
        v + playhead,
        z + playhead,
        frequency + Math.sin(playhead * 5),
        intensity
      );

      let uu = u * Math.PI + Math.PI * 0.5;
      let vv = v * Math.PI;

      u = Math.sin(uu) * Math.sin(vv);
      v = Math.cos(vv);

      u *= 0.5;
      v *= 0.5;

      u += 0.5;
      v += 0.5;

      v += noise * 1.5 * Math.sin(vv);
      u += noise * 1.35 * Math.cos(uu);

      return [u, v];
    }

    let center = {
      x: width / 2,
      y: height / 2,
    };

    // const zShift = 0.1;
    // const cmy = ["yellow", "magenta", "red"];
    // const [r, g, b] = cmy;
    let COLORS = [r, g, b];
    COLORS.forEach((color, index) => {
      points.forEach((arr) => {
        var [u, v] = noisy(arr[0].pos, z + index * zShift, 1);
        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v);
        last = [x, y];

        context.beginPath();

        arr.forEach((point, col) => {
          var [u, v] = noisy(point.pos, z + index * zShift, 1);
          var [lastX, lastY] = last;

          var x = lerp(xmargin, width - xmargin, u);
          var y = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

          context.lineWidth = 1;
          context.strokeStyle = color;
          context.moveTo(lastX, lastY);
          context.lineTo(x, y);

          last = [x, y];
        });
        context.closePath();
        context.stroke();
      });
    });
  };
};

canvasSketch(sketch, settings);

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
  dimensions: [1920, 1920],
  pixelsPerInch: 300,
  animate: true,
  duration: 4,
  suffix: random.getSeed(),
  name: "(asdf)",
};

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

// Adjust margins to drawHeight and drawWidth
const drawHeight = 1920 / 2;
const drawWidth = 1920 / 2;

// const ymargin = inch((11 - drawHeight) / 2);
// const xmargin = inch((8.5 - drawWidth) / 2);

const ymargin = (1920 - drawHeight) / 2;
const xmargin = (1920 - drawHeight) / 2;

const rowCount = 300;
const colCount = 20;

const intensity = 0.004;
const frequency = 10;
const z = 0;
const offset = [0, 0]; // y min, y max

const zShift = 0.1;
const cmy = ["yellow", "magenta", "cyan"];
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
      let noise = random.noise3D(u, v, z, 4, intensity);

      let uu = u * Math.PI - Math.PI * 4 * (playhead / settings.duration);
      let vv = v * Math.PI * 2;

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

    let COLORS = [r, g, b];
    COLORS.forEach((color, index) => {
      points.forEach((arr) => {
        var [u, v] = noisy(arr[0].pos, z + index * zShift, playhead);
        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v);
        last = [x, y];

        context.beginPath();

        arr.forEach((point, col) => {
          var [u, v] = noisy(point.pos, z + index * zShift, playhead);
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

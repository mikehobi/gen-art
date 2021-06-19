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
const { noise1D, noise2D } = require("canvas-sketch-util/random");
const { inch, inside, clamp } = require("../utils");

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  dimensions: [1920, 1920],
  pixelsPerInch: 300,
  name: "(maths/sphere-ish)",
  suffix: random.getSeed(),
  animate: true,
  duration: 16,
};

const drawHeight = 1300;
const drawWidth = 1300;

const ymargin = (1920 - drawHeight) / 2;
const xmargin = (1920 - drawWidth) / 2;

const rowCount = 200;
const colCount = 50;

const smooth = 1;

const intensity = 0.05;
const frequency = 1;

// const cmy = ["rgba(255,0,255,1)", "rgba(255,255,0,1)", "rgba(0,255,255,1)"];
const cmy = ["yellow", "magenta", "cyan"];
const [r, g, b] = cmy;

function sphere(pos, index, playhead) {
  let [u, v] = pos;

  let uu = u * Math.PI * 2;
  let vv = v * Math.PI;

  u = Math.sin(uu) * Math.sin(vv);
  v = Math.cos(vv);

  u *= 0.5;
  v *= 0.5;
  u += 0.5;
  v += 0.5;

  let z = Math.cos(uu) * Math.sin(vv);

  let zeeb = random.noise3D(
    Math.sin(u + 2 * Math.PI * playhead),
    Math.cos(v + 2 * Math.PI * playhead),
    z + index * 0.05
  );

  let noise = random.noise3D(u, v, zeeb * 0.4, 2, 0.005);

  // v += noise * 2;

  v += noise;
  // u += z * 0.025;
  // v += z * 0.9 * Math.sin(playhead * Math.PI * 2);

  return [u, v, z];
}

const sketch = (props) => {
  return ({ context, width, height, playhead }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const createLongGrid = () => {
      const rows = [];
      let smoothColCount = colCount * smooth;
      for (let y = 0; y < rowCount; y++) {
        let arr = [];
        for (let x = 0; x < smoothColCount; x++) {
          const u = smoothColCount <= 1 ? 0.5 : x / (smoothColCount - 1);
          const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);
          arr.push({
            pos: [u, 1 - v],
          });
        }
        rows.push(arr);
      }
      return rows;
    };

    const long_points = createLongGrid();

    let COLORS = [r, g, b];
    COLORS.forEach((color, index) => {
      let last = [0, 0];
      let lastPoints = [];
      long_points.forEach((arr, i) => {
        let rando = random.range(1, 1.1);

        var [u, v] = sphere(arr[0].pos, index, playhead);
        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v) + rando;
        last = [x, y];

        let nextPoints = [];

        context.beginPath();

        context.lineWidth = 1;
        context.strokeStyle = color;

        arr.forEach((point, col) => {
          var [u, v] = sphere(point.pos, index, playhead);
          // var [lx, ly] = last;

          var x = lerp(xmargin, width - xmargin, u);
          var y = lerp(ymargin, height - ymargin, v) + rando;

          // context.moveTo(lx, ly);
          context.lineTo(x, y);
          // last = [x, y];
          // nextPoints.push([x, y]);
        });
        context.stroke();

        context.closePath();

        lastPoints[i] = nextPoints;
      });
    });
  };
};

canvasSketch(sketch, settings);

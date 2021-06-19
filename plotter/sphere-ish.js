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
const { inch, inside, clamp } = require("../utils");

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  dimensions: "letter",
  units: "cm",
  pixelsPerInch: 300,
  name: "(sphere-ish)",
  suffix: random.getSeed(),
};

let randomSize = random.range(4, 5);

const drawHeight = randomSize;
const drawWidth = randomSize;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);

const rowCount = 20;
const colCount = 100;

const smooth = 4;

const intensity = 0.1;
const frequency = 1;
const z = 0;
const offset = [0, 0]; // y min, y max

const zShift = 0.01;

function sphere(pos) {
  let [u, v] = pos;

  let uu = u * Math.PI * 2 + Math.PI * 0.5;
  let vv = v * Math.PI;

  u = Math.sin(uu) * Math.sin(vv);
  v = Math.cos(vv);

  u *= 0.5;
  v *= 0.5;
  u += 0.5;
  v += 0.5;

  let z = Math.cos(uu) * Math.sin(vv - 0.06);

  let noise = random.noise2D(u, v, frequency, intensity);

  u += z * 0.025;
  v += z * 0.2 + noise;

  return [u, v, z];
}

const sketch = (props) => {
  const { width, height, units } = props;

  const createLatGrid = () => {
    const rows = [];
    let smoothRowCount = rowCount * smooth;
    for (let x = 0; x < colCount; x++) {
      let arr = [];
      for (let y = 0; y < smoothRowCount; y++) {
        const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
        const v = smoothRowCount <= 1 ? 0.5 : y / (smoothRowCount - 1);
        arr.push({
          pos: [u, v],
        });
      }
      rows.push(arr);
    }
    return rows;
  };

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

  const lat_points = createLatGrid();
  const long_points = createLongGrid();

  let paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  let last = [0, 0];

  //   lat_points.forEach((arr, z) => {
  //     var [u, v] = sphere(arr[0].pos);
  //     var x = lerp(xmargin, width - xmargin, u);
  //     var y = lerp(ymargin, height - ymargin, v);
  //     last = [x, y];

  //     arr.forEach((point, col) => {
  //       var [u, v, z] = sphere(point.pos);
  //       var [lastX, lastY] = last;

  //       var x = lerp(xmargin, width - xmargin, u);
  //       var y = lerp(ymargin, height - ymargin, v);

  //       if (z > 0) {
  //         const p = createPath((context) => {
  //           context.moveTo(lastX, lastY);
  //           context.lineTo(x, y);
  //         });
  //         paths.push(p);
  //       }

  //       last = [x, y];
  //     });
  //   });

  let lastPoints = [];
  long_points.forEach((arr, i) => {
    let rando = random.range(1, 1.1);

    var [u, v] = sphere(arr[0].pos);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v) + rando;
    last = [x, y];

    let nextPoints = [];

    arr.forEach((point, col) => {
      var [u, v] = sphere(point.pos);
      var [lx, ly] = last;

      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v) + rando;

      if (lastPoints[i - 1]) {
        let intersect;
        let numberToCheck = 50;

        let max = clamp(i - numberToCheck, 0, 999);
        for (let j = i; j > max; j--) {
          intersect = inside([x, y], lastPoints[j - 1]);
          if (intersect) {
            break;
          }
        }
        if (!intersect) {
          const p = createPath((context) => {
            context.moveTo(lx, ly);
            context.lineTo(x, y);
          });
          paths.push(p);
        }
      } else {
        const p = createPath((context) => {
          context.moveTo(lx, ly);
          context.lineTo(x, y);
        });
        paths.push(p);
      }
      last = [x, y];
      nextPoints.push([x, y]);
    });

    lastPoints[i] = nextPoints;
  });

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

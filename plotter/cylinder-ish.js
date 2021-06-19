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

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

let randomSize = random.range(4, 6);
// let randomSize = 4;
const drawHeight = randomSize;
const drawWidth = randomSize;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);

const rowCount = 60;
const colCount = 60;

const smooth = 1;

const intensity = 2;
const frequency = 1;
const z = 0;
const offset = [0, 0]; // y min, y max

const zShift = 0.01;

let random_1 = random.range(3.8, 4);
let random_2 = random.range(2.9, 3.1);
function cylinder(pos) {
  let [u, v] = pos;

  // let uu = u * Math.PI * 2 + Math.PI * 1.6;
  // let vv = -1 + 2 * v;

  let uu = u * Math.PI * 2 + Math.PI * 0.5;
  let vv = v * Math.PI;

  u = Math.sin(uu) * Math.sin(vv);
  v = Math.cos(vv);

  u *= 0.5;
  v *= 0.5;
  u += 0.5;
  v += 0.5;

  // let noise = random.noise3D(u, v, 3, frequency, intensity);

  let z = Math.cos(uu) * Math.sin(vv);

  v += z * 0.1;

  return [u, v];
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
          pos: [u, 1 - v],
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
  let last = [0, 0];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  // lat_points.forEach((arr, z) => {
  //   var [u, v] = cylinder(arr[0].pos);
  //   var x = lerp(xmargin, width - xmargin, u);
  //   var y = lerp(ymargin, height - ymargin, v);
  //   last = [x, y];

  //   arr.forEach((point, col) => {
  //     var [u, v] = cylinder(point.pos);
  //     var [lastX, lastY] = last;

  //     var x = lerp(xmargin, width - xmargin, u);
  //     var y = lerp(ymargin, height - ymargin, v);

  //     const p = createPath((context) => {
  //       context.moveTo(lastX, lastY);
  //       context.lineTo(x, y);
  //     });

  //     paths.push(p);

  //     last = [x, y];
  //   });
  // });

  long_points.forEach((arr, z) => {
    var [u, v] = cylinder(arr[0].pos);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);
    last = [x, y];

    arr.forEach((point, col) => {
      var [u, v] = cylinder(point.pos);
      var [lastX, lastY] = last;

      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v);

      const p = createPath((context) => {
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
      });

      paths.push(p);

      last = [x, y];
    });
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

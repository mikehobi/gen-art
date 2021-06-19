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

// let randomSize = random.range(4, 6);
let randomSize = 6;
const drawHeight = randomSize;
const drawWidth = randomSize;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);

const rowCount = 32;
const colCount = 32;

const smooth = 10;

function torus(pos) {
  let [u, v] = pos;

  let uu = u * Math.PI + Math.PI * 1.5;
  //   let vv = -1 + 2 * v;
  let vv = v * Math.PI;

  u = Math.sin(uu) * Math.sin(vv);
  v = Math.cos(vv);

  v *= Math.sin(vv) * Math.cos(uu * 0.5) * 2 * Math.sin(vv);

  // normalize
  u *= 0.5;
  v *= 0.5;
  u += 0.5;
  v += 0.5;

  //   vec2 uv = vec2(atan(C.x,C.z)/pi, acos(dot(cR,V))/pi);
  //   uv.x= (uv.x+1.)*0.5;

  //   u = u * Math.PI * 2 + Math.PI;
  //   v = v * Math.PI;

  //   v = Math.sin(v * 0.5) * Math.cos(u * 1);
  //   u = Math.sin(u * 3) * Math.sin(v * 2);

  //   u *= 0.5;
  //   v *= 0.5;
  //   u += 0.5;
  //   v += 0.5;

  //   let z = Math.cos(uu) * Math.sin(vv);
  //   v += z * 0.1;

  //   v += vv * 0.5;

  return [u, v];
}

function cylinder(pos) {
  let [u, v] = pos;

  let uu = u * Math.PI * 2 + Math.PI * 0.5;
  let vv = -1 + 2 * v;

  u = Math.sin(uu);
  v = vv;

  u *= 0.5;
  v *= 0.5;
  u += 0.5;
  v += 0.5;

  let z = Math.cos(uu);
  v += z * 0.1;

  return [u, v];
}

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

  let z = Math.cos(uu) * Math.sin(vv + Math.PI);

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

  //   lat_points.forEach((arr, z) => {
  //     var [u, v] = cylinder(arr[0].pos);
  //     var x = lerp(xmargin, width - xmargin, u);
  //     var y = lerp(ymargin, height - ymargin, v);
  //     last = [x, y];

  //     arr.forEach((point, col) => {
  //       var [u, v] = cylinder(point.pos);
  //       var [lastX, lastY] = last;

  //       var x = lerp(xmargin, width - xmargin, u);
  //       var y = lerp(ymargin, height - ymargin, v);

  //       const p = createPath((context) => {
  //         context.moveTo(lastX, lastY);
  //         context.lineTo(x, y);
  //       });

  //       paths.push(p);

  //       last = [x, y];
  //     });
  //   });

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

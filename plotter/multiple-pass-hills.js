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

const settings = {
  dimensions: "letter",
  units: "cm",
  pixelsPerInch: 300,
};

const inch = (inch) => {
  return 2.54 * inch;
};

const defaultSeed = "73539";
// const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

// Adjust margins to drawHeight and drawWidth
const drawHeight = 5;
const drawWidth = 5;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);
// const ymargin = 2;
// const xmargin = 2;

const rowCount = 12;
const colCount = 80;

const intensity = 0.04;
const frequency = 2;
const z = 0.4;
const offset = [0, 0]; // y min, y max

let offff = -(1 / rowCount / 3);
let noff = -(1 / rowCount / 3) * 2;

const sketch = (props) => {
  const { width, height, units } = props;

  function checkIntersect(x, y, points, row, col, z = 1, offset = [0, 0]) {
    //check last rows

    for (let i = 0; i <= rowCount; i++) {
      if (points[row - i]) {
        var last = points[row - i][col];
        var [u, v] = noisy(offy(last.pos, offset));
        var lx = lerp(xmargin, width - xmargin, u);
        var ly = lerp(ymargin, height - ymargin, v);

        if (ly <= y) {
          return [x, ly];
        }
      }
    }

    //check next
    for (let i = 1; i <= rowCount; i++) {
      if (points[row + i]) {
        var next = points[row + i][col];
        var [u, v] = noisy(offy(next.pos, offset));
        var lx = lerp(xmargin, width - xmargin, u);
        var ly = lerp(ymargin, height - ymargin, v);

        if (ly >= y) {
          return [lx, ly];
        }
      }
    }

    return [x, y];
  }

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

  let paths = [[], [], []];
  let last = [0, 0];

  function noisy(pos, z = 1, multi = 1) {
    let [u, v] = pos;
    let noise = random.noise3D(u, v, z, frequency, intensity);
    noise *= Math.sin(v * Math.PI);
    v += noise * multi;
    return [u, v];
  }

  let center = {
    x: width / 2,
    y: height / 2,
  };

  let min = -intensity;
  let max = intensity;

  points.forEach((arr, row) => {
    var [u, v] = noisy(arr[0].pos);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);

    let [nx, ny] = checkIntersect(x, y, points, row, 0);

    last = [nx, ny];

    arr.forEach((point, col) => {
      var [u, v] = noisy(point.pos);
      var [lastX, lastY] = last;

      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

      let [nx, ny] = checkIntersect(x, y, points, row, col);

      const p = createPath((context) => {
        context.moveTo(lastX, lastY);
        context.lineTo(nx, ny);
      });

      paths[0].push(p);

      last = [nx, ny];
    });
  });

  function offy(pos, off) {
    let [x, y] = pos;
    let [ox, oy] = off;
    return [x + ox, y + oy];
  }

  points.forEach((arr, row) => {
    // const rand = random.rangeFloor(99, 999);
    const rand = 999;
    var [u, v] = noisy(offy(arr[0].pos, [0, offff]), rand);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);

    let [nx, ny] = checkIntersect(x, y, points, row, 0);

    last = [nx, ny];

    arr.forEach((point, col) => {
      var [u, v] = noisy(offy(point.pos, [0, offff]), rand);
      var [lastX, lastY] = last;

      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

      let [nx, ny] = checkIntersect(x, y, points, row, col);

      const p = createPath((context) => {
        context.moveTo(lastX, lastY);
        context.lineTo(nx, ny);
      });

      paths[1].push(p);

      last = [nx, ny];
    });
  });

  // THIRD
  points.forEach((arr, row) => {
    const rand = 777;

    var [u, v] = noisy(offy(arr[0].pos, [0, noff]), rand);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);

    let [nx, ny] = checkIntersect(x, y, points, row, 0, 999, [0, offff]);
    if (ny === y) {
      [nx, ny] = checkIntersect(x, y, points, row, 0);
    }

    last = [nx, ny];

    arr.forEach((point, col) => {
      var [u, v] = noisy(offy(point.pos, [0, noff]), rand);
      var [lastX, lastY] = last;

      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

      let [nx, ny] = checkIntersect(x, y, points, row, col, 999, [0, offff]);
      if (ny === y) {
        [nx, ny] = checkIntersect(x, y, points, row, col);
      }

      const p = createPath((context) => {
        context.moveTo(lastX, lastY);
        context.lineTo(nx, ny);
      });

      paths[2].push(p);

      last = [nx, ny];
    });
  });

  lines = pathsToPolylines(paths, { units });

  const box = [xmargin, ymargin, width - xmargin, height - ymargin];
  lines = clipPolylinesToBox(lines, box);

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

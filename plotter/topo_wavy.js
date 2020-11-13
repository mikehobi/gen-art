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
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 2.54;
const xmargin = 2.54;

const rowCount = 70;
const colCount = 300;

const intensity = 0.06;
const frequency = 3;
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

  let paths = [];
  let last = [0, 0];

  function noisy(pos) {
    let [u, v] = pos;
    let noise = random.noise2D(u, v, frequency, intensity);
    noise *= Math.sin(v * Math.PI);
    u += noise * Math.sin(v * Math.PI);
    v += noise * Math.sin(u * Math.PI);
    // v += 0.2 * Math.cos(v * Math.PI) * (1 - Math.sin(u * Math.PI));
    return [u, v];
  }

  function checkPrevious(x, y, points, row, col) {
    // Crop top/bottom
    // if (y <= ymargin || y >= height - ymargin) {
    //   return true;
    // }

    for (let i = 1; i < row + 1; i++) {
      var last = points[row - i][col];
      var [, v] = noisy(last.pos);
      var yy = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

      if (yy <= y) {
        return true;
      }
    }
    return false;
  }

  points.forEach((arr, row) => {
    var [u, v] = noisy(arr[0].pos);
    var x = lerp(xmargin, width - xmargin, u);
    var y = lerp(ymargin, height - ymargin, v);
    last = [x, y];

    arr.forEach((point, col) => {
      var [u, v] = noisy(point.pos);
      var [lastX, lastY] = last;

      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin - offset[0], height - ymargin + offset[1], v);

      let intersect = checkPrevious(x, y, points, row, col);
      if (!intersect) {
        const p = createPath((context) => {
          context.moveTo(lastX, lastY);
          context.lineTo(x, y);
        });
        paths.push(p);
      }

      last = [x, y];
    });
  });

  // const frame = createPath((context) => {
  //   context.rect(xmargin, ymargin, width - xmargin * 2, height - ymargin * 2);
  // });
  // paths.push(frame);

  // const frameLines = unevenFrames(xmargin, ymargin, width, height, 10);
  // frameLines.forEach((l) => {
  //   paths.push(l);
  // });

  let lines = pathsToPolylines(paths, { units });

  // const margin = 4;
  // const box = [margin, margin, width - margin, height - margin];
  // lines = clipPolylinesToBox(lines, box);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.01,
      // optimize: true,
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

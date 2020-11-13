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

// const ymargin = 6;
const ymargin = 10;
const xmargin = 4;

const sketch = (props) => {
  const { width, height, units } = props;

  random.setSeed(382314); // cool with -sin bizz
  // random.setSeed(389928);
  // random.setSeed(9);
  // random.setSeed(96190);
  // console.log(random.getRandomSeed());

  const createGrid = () => {
    const rows = [];
    const rowCount = 30;
    const colCount = 300;
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
    let noise = random.noise2D(u, v, 12, 0.05);
    v += noise * Math.sin(u * Math.PI);
    // v += 0.3 * Math.cos(v * Math.PI) * (1 - Math.sin(u * Math.PI));
    v -= 0.4 * Math.cos(v * Math.PI) * (1 - Math.sin(u * Math.PI));
    // v += 0.5 + Math.cos(u * Math.PI * 2) * 0.15;
    // v -= 0.3;
    // v -= 1 * Math.cos(v * Math.PI) * (1 - Math.sin(u * Math.PI));
    return [u, v];
  }

  function checkPrevious(x, y, points, row, col) {
    for (let i = 1; i < row + 1; i++) {
      var last = points[row - i][col];
      var [u, v] = noisy(last.pos);
      var yy = lerp(ymargin, height - ymargin, v);

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
      var y = lerp(ymargin, height - ymargin, v);

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

  let lines = pathsToPolylines(paths, { units });

  const margin = 4;
  const box = [margin, margin, width - margin, height - margin];
  lines = clipPolylinesToBox(lines, box);

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

canvasSketch(sketch, settings);

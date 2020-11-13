const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 4;
const xmargin = 4;

const rowCount = 40;
const colCount = 30;
const createGrid = (rowCount, colCount) => {
  const rows = [];
  for (let y = 0; y < rowCount; y++) {
    let arr = [];
    for (let x = 0; x < colCount; x++) {
      const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
      const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);

      //   let r = random.chance(v);
      let r = random.rangeFloor(0, 3);

      switch (r) {
        case 0:
          break;
        case 1:
          break;
        case 2:
          arr.push({
            pos: [u, v],
          });
          break;
      }
    }
    rows.push(arr);
  }
  return rows;
};

const sketch = (props) => {
  const { width, height, units } = props;

  random.setSeed(223483);

  const points = createGrid(rowCount, colCount);

  let paths = [];

  function noisy(pos, invert) {
    let [u, v] = pos;
    let noise = random.noise2D(u, v, 0.6, 4);
    let a = invert ? 1 : -1;
    u += Math.sin(noise) * 0.012 * a;
    v += Math.cos(noise) * 0.012 * a;

    return [u, v];
  }

  points.forEach((arr, index) => {
    arr.forEach((i) => {
      const p = createPath((context) => {
        var [u, v] = noisy(i.pos, false);
        var [uu, vv] = noisy(i.pos, true);
        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v);
        context.moveTo(x, y);

        x = lerp(xmargin, width - xmargin, uu);
        y = lerp(ymargin, height - ymargin, vv);
        context.lineTo(x, y);
      });

      paths.push(p);
    });
  });

  let lines = pathsToPolylines(paths, { units });

  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];
  lines = clipPolylinesToBox(lines, box);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.05,
      // optimize: true,
    });
};

canvasSketch(sketch, settings);

const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { pixelData } = require("../utils");

const settings = {
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 8;
const xmargin = 4;

const rowCount = 100;
const colCount = 100;
const createGrid = (rowCount, colCount) => {
  const rows = [];
  for (let y = 0; y < rowCount; y++) {
    let arr = [];
    for (let x = 0; x < colCount; x++) {
      const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
      const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);
      arr.push({
        pos: [u, v],
      });
    }
    rows.push(arr);
  }
  return rows;
};

const sketch = (props) => {
  const { width, height, units, context } = props;

  let img = new Image();
  img.src = "./plotter/images/obama.png";
  // document.body.append(img);

  let imgh = 1000;
  let imgw = 1000;
  let offScreenCanvas = new OffscreenCanvas(imgw, imgh);
  let offCtx = offScreenCanvas.getContext("2d");

  offCtx.drawImage(img, 0, 0);
  var imgData = offCtx.getImageData(0, 0, imgw, imgh);

  // for (let i = 0; i < 200; i++) {
  //   let [r, g, b, a] = pixelData(imgData.data, imgw, imgh, i, 200);
  //   console.log(`x: ${i} y: 0, rgba(${r},${g},${b},${a})`);
  // }

  const points = createGrid(rowCount, colCount);

  let paths = [];

  let last = [0, 0];

  // Apply noise here!
  function noisy(pos) {
    let [u, v] = pos;

    var x = Math.floor(lerp(0, imgw, u));
    var y = Math.floor(lerp(0, imgh, v));

    let [r, g, b, a] = pixelData(imgData.data, imgw, imgh, x, y);
    // var brightness = 1 - (r + g + b) / 3 / 255;
    var brightness = 1 - r / 255;

    v -= brightness * 0.01;

    return [u, v];
  }

  points.forEach((arr, index) => {
    // Start at beginning
    // var [u, v] = arr[0].pos;
    // var x = lerp(xmargin, width - xmargin, u);
    // var y = lerp(ymargin, height - ymargin, v);
    // last = [x, y];

    arr.forEach((i) => {
      const p = createPath((context) => {
        // console.log(i.pos);
        var [u, v] = i.pos;

        var x = lerp(xmargin, width - xmargin, u);
        var y = lerp(ymargin, height - ymargin, v);
        context.moveTo(x, y);

        let [toU, toV] = noisy(i.pos);

        var toX = lerp(xmargin, width - xmargin, toU);
        var toY = lerp(ymargin, height - ymargin, toV);
        context.lineTo(toX, toY);
        last = [x, y];
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
      optimize: true,
    });
};

canvasSketch(sketch, settings);

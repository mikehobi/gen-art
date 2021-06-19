const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance, inch } = require("../utils");

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: "tabloid",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",

  name: "(hex)",
  suffix: random.getSeed(),
};

// const drawHeight = 10;
// const drawWidth = 7.5;

// const ymargin = inch((11 - drawHeight) / 2);
// const xmargin = inch((8.5 - drawWidth) / 2);
const ymargin = 1;
const xmargin = 1;

const sketch = (props) => {
  const { width, height, units } = props;
  let center = [width / 2, height / 2];

  var startPoint = [
    center[0] + random.range(-10, 10),
    center[1] + random.range(-10, 10),
  ];

  const paths = [];
  function addLine(a, b) {
    const p = createPath((context) => {
      context.moveTo(a[0], a[1]);
      context.lineTo(b[0], b[1]);
    });
    paths.push(p);
  }

  function drawHex(origin, size = 1, offset = Math.PI / 6, lastPoints) {
    const side = (point, side) => {
      let x = point[0] + Math.cos(offset + side * (Math.PI / 3)) * (size / 2);
      let y = point[1] + Math.sin(offset + side * (Math.PI / 3)) * (size / 2);
      return [x, y];
    };

    let points = [];
    let chance = random.chance() > 0.5;
    for (var i = 0; i < 6; i++) {
      addLine(side(origin, i), side(origin, i + 1));
      points.push(side(origin, i));
      // if (lastPoints.length > 0) {
      //   // let p = chance ? i : i + 1;
      //   let p = i;
      //   addLine(lastPoints[i], side(origin, p));
      // } else if (i % 2 === 0) {
      //   let p = i + 1;
      //   addLine(startPoint, side(origin, p));
      // }
    }
    return points;
  }

  // GO GO GO

  var count = 300;
  var lastPoints = [];
  var startOffset = (random.range(0, 6) * Math.PI) / 6;
  for (let i = 0; i < count; i++) {
    let noise = random.noise1D(i * 0.0095) * 0.5;
    // let noise = 1;
    lastPoints = drawHex(startPoint, i * 0.25, startOffset + noise, lastPoints);
  }

  const frame = createPath((context) => {
    context.rect(xmargin, ymargin, width - xmargin * 2, height - ymargin * 2);
  });
  paths.push(frame);

  let lines = pathsToPolylines(paths, { units });

  const box = [xmargin, ymargin, width - xmargin, height - ymargin];
  lines = clipPolylinesToBox(lines, box);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.05,
      optimize: true,
      background: "black",
      foreground: "white",
    });
};

canvasSketch(sketch, settings);

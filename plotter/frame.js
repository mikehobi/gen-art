const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance, offsetLines } = require("../utils");

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: "letter",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in",
};

let xmargin = 1;
let ymargin = 1;

const sketch = (props) => {
  const { width, height, units } = props;

  var w = width - xmargin * 2;
  var h = height - ymargin * 2;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  let target = createPath((context) => {
    context.arc(center.x, center.y, 1, 0, Math.PI * 2, false);
  });
  paths.push(target);

  let line = createPath((c) => {
    c.moveTo(center.x - 2, center.y);
    c.lineTo(center.x + 2, center.y);
    c.moveTo(center.x, center.y - 2);
    c.lineTo(center.x, center.y + 2);
  });

  paths.push(line);

  const frame = createPath((context) => {
    context.rect(xmargin, ymargin, width - xmargin * 2, height - ymargin * 2);
  });
  paths.push(frame);

  let lines = pathsToPolylines(paths, { units });

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

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
  dimensions: "A4",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

let xmargin = 2;
let ymargin = 3;

const sketch = (props) => {
  const { width, height, units } = props;

  var w = width - xmargin * 2;
  var h = height - ymargin * 2;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

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

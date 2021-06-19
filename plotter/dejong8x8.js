const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance, offsetLines, distSq, gridCoord } = require("../utils");
const { lerp, mapRange } = require("canvas-sketch-util/math");

// const defaultSeed = "47988";
// const defaultSeed = "773170";
const defaultSeed = "206766";
// const defaultSeed = "405010";
// const defaultSeed = "146865";
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

var count = 6000;

const settings = {
  suffix: random.getSeed(),
  dimensions: [20.32, 20.32],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

let xmargin = 6;
let ymargin = 6;

const sketch = (props) => {
  const { width, height, units } = props;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  //3.1083058390090565 2.7521332963335845 1.3650539968263027 2.7951015705616857

  // var a = 2.6942928979372347;
  // var b = 1.864238515614251;
  // var c = 0.6298985031225722;
  // var d = 2.753009367127579;

  //   var a = 0.66;
  //   var b = -1.46;
  //   var c = 0.16;
  //   var d = -1.77;

  //   var a = 1.81;
  //   var b = 3.1;
  //   var c = -2.15;
  //   var d = 1.51;

  //   var a = 1.4,
  //     b = -2.3,
  //     c = 2.4,
  //     d = -2.1;

  // var a = -0.709,
  //   b = 1.638,
  //   c = 0.452,
  //   d = 1.74;

  var a = random.range(-Math.PI, Math.PI);
  var b = random.range(-Math.PI, Math.PI);
  var c = random.range(-Math.PI, Math.PI);
  var d = random.range(-Math.PI, Math.PI);

  //   var a = 0.4665855576913067;
  //   var b = -3.00121668622498;
  //   var c = 0.16;
  //   var d = -2.382238578658914;

  console.log(a, b, c, d);

  var grid = [];
  x = 0;
  y = 0;

  var min = [0, 0];
  var max = [0, 0];
  for (let i = 0; i < count; i++) {
    x = Math.sin(a * y) - Math.cos(b * x);
    y = Math.sin(c * x) - Math.cos(d * y);
    // x = d * Math.sin(a * y) - Math.cos(b * x);
    // y = c * Math.sin(a * x) - Math.cos(b * y);

    grid[i] = [x, y];

    min = [Math.min(x, min[0]), Math.min(y, min[1])];
    max = [Math.max(x, max[0]), Math.max(y, max[1])];
  }

  for (var i = 0; i < grid.length; i++) {
    let [x, y] = grid[i];

    // x = random.range(0, 999);
    // y = random.range(0, 999);

    let xx = mapRange(x, min[0], max[0], xmargin, width - xmargin);
    let yy = mapRange(y, min[1], max[1], ymargin, height - ymargin);

    const p = createPath((context) => {
      context.moveTo(xx, yy);
      context.lineTo(xx + 0.001, yy + 0.001);
    });
    paths.push(p);
  }

  let lines = pathsToPolylines(paths, { units });

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.05,
      optimize: true,
      // background: "black",
      // foreground: "white",
    });
};

canvasSketch(sketch, settings);

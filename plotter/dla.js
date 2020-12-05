const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { lerp } = require("canvas-sketch-util/math");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { offsetLines, clamp, distSq } = require("../utils");
const random = require("canvas-sketch-util/random");

// You can force a specific seed by replacing this with a string value
const defaultSeed = null;

// Set a random seed so we can reproduce this print later
random.setSeed(defaultSeed || random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log("Random Seed:", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: "A4",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "px",
};

// let xmargin = 2;
// let ymargin = 2;

const random2d = (mag) => {
  let x = random.range(-mag, mag);
  let y = random.range(-mag, mag);
  return [x, y];
};

const sketch = (props) => {
  const { width, height, units } = props;

  let tree = [];
  var walkers = [];
  var r = 20;

  let center = {
    x: width / 2,
    y: height / 2,
  };

  tree[0] = new Walker(center.x, center.y, true, 1);

  function randomPos() {
    let side = random.rangeFloor(0, 4);
    switch (side) {
      case 0:
        return [0, random.range(0, height)];
      case 1:
        return [width, random.range(0, height)];
      case 2:
        return [random.range(0, width), 0];
      case 3:
        return [random.range(0, width), height];
    }
  }

  function randomNearCenter() {
    return [
      center.x + random.range(-100, 100),
      center.y + random.range(-100, 100),
    ];
  }

  for (var i = 0; i < 50; i++) {
    const [x, y] = randomNearCenter();
    let walker = new Walker(x, y, false);
    walkers.push(walker);
  }

  var n = 100;
  while (n > 0) {
    for (var i = 0; i < walkers.length; i++) {
      walkers[i].walk(width, height);
      if (walkers[i].check(tree, r)) {
        tree.push(walkers[i]);
        walkers.splice(1, i);
      }
    }
    n--;
  }

  // console.log(tree.length);

  const paths = [];
  // for (var i = 0; i < walkers.length; i++) {
  //   // walkers[i].walk(width, height);
  //   let [x, y] = walkers[i].pos;

  //   const p = createPath((context) => {
  //     context.arc(x, y, r, 0, Math.PI * 2);
  //   });
  //   paths.push(p);
  // }

  for (var i = 0; i < tree.length; i++) {
    let [x, y] = tree[i].pos;

    const p = createPath((context) => {
      context.arc(x, y, r, 0, Math.PI * 2);
    });
    paths.push(p);
  }

  // Plotter
  let lines = pathsToPolylines(paths, { units });

  // lines = offsetLines(lines, [xmargin, ymargin]);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 5,
      optimize: true,
    });
};

canvasSketch(sketch, settings);

function Walker(x, y, stuck = false, dragx, dragy) {
  this.pos = [x, y];
  console.log("init", x, y);
  this.stuck = stuck;
  this.speed = 0.5;

  this.dragx = 0;
  this.dragy = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  this.walk = function (xmax, ymax) {
    if (!this.stuck) {
      var [x, y] = this.pos;
      var [vx, vy] = random2d(this.speed);
      vx += this.dragx;
      vy += this.dragy;
      this.pos = [clamp(x + vx, 0, xmax), clamp(y + vy, 0, ymax)];
    }
  };

  this.check = function (tree, r) {
    for (var i = 0; i < tree.length; i++) {
      let d = this.distance(tree[i].pos);
      this.stuck = d < r * r * 4;

      return this.stuck;
    }
  };

  this.distance = function (point) {
    return distSq(this.pos, point);
  };
}

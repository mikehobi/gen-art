const canvasSketch = require("canvas-sketch");

const { lerp, mapRange } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const {
  setSeed,
  getRandomSeed,
  noise2D,
  range,
  getSeed,
} = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
  // dimensions: [1080, 1920],
  animate: true,
  duration: 12,
};

function test_prime(n) {
  if (n === 1) {
    return false;
  } else if (n === 2) {
    return true;
  } else {
    for (var x = 2; x < n; x++) {
      if (n % x === 0) {
        return false;
      }
    }
    return true;
  }
}

const xmargin = 200;
const ymargin = 500;

// You can force a specific seed by replacing this with a string value
const defaultSeed = null;
// const defaultSeed = "";

// Set a random seed so we can reproduce this print later
setSeed(defaultSeed || getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log("Random Seed:", getSeed());

const sketch = () => {
  return ({ context, width, height, playhead }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    let start = [width / 2, height];

    var grid = [];
    var count = 400;
    let xoff = 0;
    let yoff = 0;
    for (let i = 0; i < count; i++) {
      let points = [];
      var last = start;
      points.push(last);
      for (let j = 0; j < height; j++) {
        let noise = noise2D(xoff, yoff, 0.01, 4);
        xoff++;
        let [x, y] = last;
        y -= 1;
        x += noise;
        points.push([x, y]);
        last = [x, y];
      }
      grid.push(points);
      xoff = 0;
      yoff++;
    }

    context.strokeStyle = "rgba(255,255,255,1)";

    for (var i = 0; i < grid.length; i++) {
      let points = grid[i];
      let last = grid[i][0];
      for (var j = 0; j < points.length; j++) {
        let [lx, ly] = last;
        let [x, y] = points[j];
        context.beginPath();
        context.moveTo(lx, ly);
        context.lineTo(x, y);
        context.stroke();
        context.closePath();
        last = [x, y];
      }
    }
  };
};

canvasSketch(sketch, settings);

const canvasSketch = require("canvas-sketch");

const { lerp, mapRange } = require("canvas-sketch-util/math");
const {
  setSeed,
  getRandomSeed,
  noise2D,
  range,
  getSeed,
} = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
  //   dimensions: [1080, 1920],
  animate: true,
  duration: 12,
};

const SEED = {
  HORSE: 2,
  SQUIGS: 5,
  FLOAT: 9,
  GOOD: 1113,
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
// const defaultSeed = null;
const defaultSeed = "783672";

// Set a random seed so we can reproduce this print later
setSeed(defaultSeed || getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log("Random Seed:", getSeed());

const sketch = () => {
  return ({ context, width, height, playhead }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    let center = {
      x: width / 2,
      y: height / 2,
    };

    var aa = range(-Math.PI, Math.PI);
    var bb = range(-Math.PI, Math.PI);
    var cc = range(-Math.PI, Math.PI);
    var dd = range(-Math.PI, Math.PI);

    setSeed(12899999);

    var a = range(-Math.PI, Math.PI); //+ Math.sin(playhead * 1.2);
    var b = range(-Math.PI, Math.PI); //- Math.sin(playhead * 1.1);
    var c = range(-Math.PI, Math.PI); //- Math.sin(playhead * playhead * 1.79);
    var d = range(-Math.PI, Math.PI); //- Math.sin(playhead * 0.4);

    aa = 3.184 + playhead * 10.7;
    bb = -2.4 + playhead * 10.1;
    cc = 1.14 + playhead * 10.4;
    dd = -2.04 + playhead * 13;

    // console.log(a, b, c, d);

    var grid = [];
    var colors = [];
    var count = 10000;
    x = 0;
    y = 0;

    var min = [0, 0];
    var max = [0, 0];
    for (let i = 0; i < count; i++) {
      x = Math.sin(a * y) - Math.cos(b * x);
      y = Math.sin(c * x) - Math.cos(d * y);

      grid[i] = [x, y];

      colorX = Math.sin(dd * y) - Math.cos(bb * x);
      colorY = Math.sin(cc * y) - Math.cos(dd * x);

      colors[i] = color(colorX, colorY);

      min = [Math.min(x, min[0]), Math.min(y, min[1])];
      max = [Math.max(x, max[0]), Math.max(y, max[1])];
    }

    function color(x, y) {
      let x2 = mapRange(x, min[0], max[0], 0, 255);
      let y2 = mapRange(y, min[1], max[1], 255, 0);
      return `rgba(${x2},${y2},255,1)`;
    }

    for (var i = 0; i < grid.length; i++) {
      let [x, y] = grid[i];
      var last = [x, y];
      if (grid[i - 1]) {
        last = grid[i - 1];
      }
      let [lx, ly] = last;

      let x2 = mapRange(x, min[0], max[0], xmargin, width - xmargin);
      let y2 = mapRange(y, min[1], max[1], ymargin, height - ymargin);

      context.beginPath();
      context.fillStyle = colors[i];
      //   context.fillStyle = `rgba(${255 - y * y * y * 20}, ${
      //     255 - playhead * 200
      //   }, ${255 - x * x * x * 20}, 1)`;

      context.arc(x2, y2, 0.5, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
    }
  };
};

canvasSketch(sketch, settings);

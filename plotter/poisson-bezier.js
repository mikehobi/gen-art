const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: "postcard",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

function distance(a, b) {
  let [aX, aY] = a;
  let [bX, bY] = b;
  return Math.sqrt(Math.pow(aX - bX, 2) + Math.pow(aY - bY, 2));
}

const sketch = (props) => {
  const { width, height, units } = props;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  var r = 0.2;
  var k = 30;
  var active = [];
  var grid = [];
  var ordered = [];
  var w = r / Math.sqrt(2);

  var cols = Math.floor(width / w);
  var rows = Math.floor(height / w);
  for (let i = 0; i < rows * cols; i++) {
    grid[i] = undefined;
  }

  var x = random.range(0, width);
  var y = random.range(0, height);
  var i = Math.floor(x / w);
  var j = Math.floor(y / w);
  var pos = [x, y];
  grid[i + j * cols] = pos;
  active.push(pos);

  while (active.length > 0) {
    var randIndex = random.rangeFloor(0, active.length);
    var pos = active[randIndex];
    var found = false;
    for (var n = 0; n < k; n++) {
      let [x, y] = pos;
      var a = random.range(0, Math.PI * 2);
      var m = random.range(r, r * 2) * 2;

      var sampleX = x + Math.cos(a) * m;
      var sampleY = y + Math.sin(a) * m;
      var sample = [sampleX, sampleY];

      var col = Math.floor(sampleX / w);
      var row = Math.floor(sampleY / w);

      if (
        col >= 0 &&
        row >= 0 &&
        col < cols &&
        row < rows &&
        !grid[col + row * cols]
      ) {
        var ok = true;
        for (var i = -1; i <= 1; i++) {
          for (var j = -1; j <= 1; j++) {
            var index = col + i + (row + j) * cols;
            let neighbor = grid[index];

            if (neighbor) {
              var d = distance(sample, neighbor);
              if (d < r) {
                ok = false;
              }
            }
          }
        }

        if (ok) {
          found = true;
          grid[col + row * cols] = sample;
          active.push(sample);
          ordered.push(sample);
        }

        if (!found) {
          active.splice(randIndex, 1);
        }
      }
    }
  }

  let last = [undefined, undefined];
  for (var i = 0; i < ordered.length; i++) {
    if (ordered[i]) {
      let [lastx, lasty] = last;
      const p = createPath((context) => {
        // new
        x = ordered[i][0];
        y = ordered[i][1];

        // from last...
        if (lastx && lasty) {
          context.moveTo(lastx, lasty);
        } else {
          context.moveTo(x, y);
        }

        context.bezierCurveTo(lastx || x, lasty || y, x + 0.1, y - 0.1, x, y);

        last = [x, y];
      });
      paths.push(p);
    }
  }

  let lines = pathsToPolylines(paths, { units });

  // const margin = 1;
  // const box = [margin, margin, width - margin, height - margin];
  // lines = clipPolylinesToBox(lines, box);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.03,
      optimize: true,
    });
};

canvasSketch(sketch, settings);

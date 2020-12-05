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

  var r = 1;
  var k = 30;
  var active = [];
  var grid = [];
  var q = r / Math.sqrt(2);

  var cols = Math.floor(w / q);
  var rows = Math.floor(h / q);
  for (let i = 0; i < rows * cols; i++) {
    grid[i] = undefined;
  }

  var x = random.range(0, w);
  var y = random.range(0, h);
  // var x = center.x;
  // var y = center.y;
  var i = Math.floor(x / q);
  var j = Math.floor(y / q);
  var pos = [x, y];
  grid[i + j * cols] = pos;
  active.push(pos);

  var attempts = 100;
  while (attempts > 0) {
    if (attempts !== 20) {
      console.log("another");
      var x = random.range(0, w);
      var y = random.range(0, h);
      var i = Math.floor(x / q);
      var j = Math.floor(y / q);
      var pos = [x, y];
      grid[i + j * cols] = pos;
      active.push(pos);
    }

    while (active.length > 0) {
      var randIndex = random.rangeFloor(0, active.length);
      var pos = active[randIndex];
      var found = false;
      for (var n = 0; n < k; n++) {
        let [x, y] = pos;
        var a = random.range(0, Math.PI * 2);

        var m = random.range(r, r * 2);

        var sampleX = x + Math.cos(a) * m * 2;
        var sampleY = y + Math.sin(a) * m * 2;
        var sample = [sampleX, sampleY];

        var col = Math.floor(sampleX / q);
        var row = Math.floor(sampleY / q);

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
            // break;
          }

          if (!found) {
            active.splice(randIndex, 1);
          }
        }
      }
    }

    attempts--;
  }

  for (var i = 0; i < grid.length; i++) {
    if (grid[i]) {
      let [x, y] = grid[i];
      const p = createPath((context) => {
        context.moveTo(x, y);
        context.lineTo(x + 0.001, y + 0.001);

        var col = Math.floor(x / q);
        var row = Math.floor(y / q);

        // i + j * cols

        for (var k = -1; k <= 1; k++) {
          for (var j = -1; j <= 1; j++) {
            var index = col + k + (row + j) * cols;
            let neighbor = grid[index];

            if (neighbor) {
              let dist = distance(grid[i], neighbor);
              if (dist <= r * 2) {
                context.lineTo(neighbor[0], neighbor[1]);
              }
            }
          }
        }

        // if (i % 2 == 0) {
        // let prev = 1;
        // let foundPrev = false;
        // while (!foundPrev && prev < 10) {
        //   let prevIndex = i + prev;
        //   if (grid[prevIndex] == undefined) {
        //     prev++;
        //   } else {
        //     let [lastx, lasty] = grid[prevIndex];
        //     let d = distance(grid[i], grid[prevIndex]);
        //     if (d > r * 2) {
        //       prev++;
        //     } else {
        //       foundPrev = true;
        //       context.lineTo(lastx, lasty);
        //     }
        //   }
        // }
      });
      paths.push(p);
    }
  }

  let lines = pathsToPolylines(paths, { units });

  lines = offsetLines(lines, [xmargin, ymargin]);

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

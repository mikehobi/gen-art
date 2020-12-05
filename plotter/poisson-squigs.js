const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance } = require("../utils");

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

const sketch = (props) => {
  const { width, height, units } = props;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  var r = 0.1;
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

  // var x = random.range(0, width);
  // var y = random.range(0, height);
  var x = center.x;
  var y = center.y;
  var i = Math.floor(x / w);
  var j = Math.floor(y / w);
  var pos = [x, y];
  grid[i + j * cols] = pos;
  active.push(pos);

  var attempts = 200;

  random.setSeed(621702);

  while (attempts > 0) {
    while (active.length > 0) {
      var randIndex = random.rangeFloor(0, active.length);
      var pos = active[randIndex];
      var found = false;
      var last = 0;
      for (var n = 0; n < k; n++) {
        let [x, y] = pos;

        // limit angle range....
        var a = last + random.range(0, Math.PI * 2);
        last = a;
        // var a = random.range(0, Math.PI * 2);

        var m = random.range(r, r * 1.01) * 1;

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

            active.splice(randIndex, 1);

            active.push(sample);
            ordered.push(sample);

            const p = createPath((context) => {
              context.moveTo(x, y);
              context.lineTo(sampleX, sampleY);
            });
            paths.push(p);
            break;
          }

          if (!found) {
            active.splice(randIndex, 1);
          }
        }
      }
    }

    var x = random.range(0, width);
    var y = random.range(0, height);
    var i = Math.floor(x / w);
    var j = Math.floor(y / w);
    var pos = [x, y];
    grid[i + j * cols] = pos;
    active.push(pos);

    attempts--;
  }

  // const p = createPath((context) => {
  // context.lineTo(x, y);
  // last = [x, y];
  // });
  // paths.push(p);

  // let last = [undefined, undefined];
  // for (var i = 0; i < ordered.length; i++) {
  //   if (ordered[i]) {
  //     let [x, y] = last;
  //     const p = createPath((context) => {
  //       if (x && y) {
  //         context.moveTo(x, y);
  //       } else {
  //         context.moveTo(ordered[i][0], ordered[i][1]);
  //       }

  //       x = ordered[i][0];
  //       y = ordered[i][1];

  //       context.lineTo(x, y);
  //       last = [x, y];
  //     });
  //     paths.push(p);
  //   }
  // }

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

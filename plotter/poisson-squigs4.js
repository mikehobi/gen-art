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

var r = 0.5;
var k = 30;
var active = [];
var grid = [];
var ordered = [];
var q = r / Math.sqrt(2);
var density = 20;
var bezier = true;

let xmargin = 2;
let ymargin = 3;

const squig = (startX, startY, endX, endY, bezi, count) => {
  let diffX = endX - startX;
  let diffY = endY - startY;

  let qX1 = startX + (startX - bezi[0]);
  let qY1 = startY + (startY - bezi[1]);

  let _2qX0 = startX + (endX - startX) * 0.75;
  let _2qY0 = startY + (endY - startY) * 0.75;

  let mag = 0.5;
  var mod = count % 2 == 0 ? mag * -1 : mag;

  let _2qX1 = _2qX0 + (diffY / 2) * mod;
  let _2qY1 = _2qY0 - (diffX / 2) * mod;

  return [
    createPath((ctx) => {
      if (bezier) {
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(qX1, qY1, _2qX1, _2qY1, endX, endY);
      } else {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      }

      // ctx.moveTo(_2qX0, _2qY0);
      // ctx.lineTo(_2qX1, _2qY1);

      //   ctx.moveTo(startX, startY);
      //   ctx.lineTo(qX1, qY1);

      //   ctx.moveTo(endX, endY);
      //   ctx.lineTo(_2qX1, _2qY1);

      //   let size = 0.05;
      //   ctx.moveTo(qX1 - size / 2, qY1 - size / 2);
      //   ctx.rect(qX1 - size / 2, qY1 - size / 2, size, size);

      //   ctx.moveTo(_2qX1 - size / 2, _2qY1 - size / 2);
      //   ctx.rect(_2qX1 - size / 2, _2qY1 - size / 2, size, size);
    }),
    [_2qX1, _2qY1],
  ];
};

const sketch = (props) => {
  const { width, height, units } = props;

  var w = width - xmargin * 2;
  var h = height - ymargin * 2;

  const paths = [];

  let center = {
    x: w / 2,
    y: h / 2,
  };

  var cols = Math.floor(w / q);
  var rows = Math.floor(h / q);
  for (let i = 0; i < rows * cols; i++) {
    grid[i] = undefined;
  }

  // var x = random.range(0, w);
  // var y = random.range(0, h);
  var x = center.x;
  var y = center.y;
  var i = Math.floor(x / q);
  var j = Math.floor(y / q);
  var pos = [x, y];
  grid[i + j * cols] = pos;
  active.push(pos);

  // Lower density
  var attempts = Math.floor(density / r);

  var lastBezier = [x, y];
  var count = 0;
  var lastAngle = 0;

  while (attempts > 0) {
    while (active.length > 0) {
      var randIndex = random.rangeFloor(0, active.length);
      var pos = active[randIndex];
      var found = false;

      for (var n = 0; n < k; n++) {
        let [x, y] = pos;

        // let fds = 2;
        var a = random.range(0, Math.PI * 2);
        var m = random.range(r, r * 1);

        // lastAngle = a;

        var sampleX = x + Math.cos(a) * m;
        var sampleY = y + Math.sin(a) * m;
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

            active.splice(randIndex, 1);

            active.push(sample);
            ordered.push(sample);

            const [p, bz] = squig(x, y, sampleX, sampleY, lastBezier, count);
            lastBezier = bz;
            count++;

            paths.push(p);
            break;
          }

          if (!found) {
            active.splice(randIndex, 1);
          }
        }
      }
    }

    // Start anew
    var x = random.range(0, w);
    var y = random.range(0, h);
    var i = Math.floor(x / q);
    var j = Math.floor(y / q);
    var pos = [x, y];
    lastBezier = [x, y];
    grid[i + j * cols] = pos;

    active.push(pos);

    attempts--;
  }

  let lines = pathsToPolylines(paths, { units });

  lines = offsetLines(lines, [xmargin, ymargin]);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.05,
      // optimize: true,
      optimize: {
        sort: false,
        removeDuplicates: false,
        removeCollinear: false,
        merge: true,
      },
    });
};

canvasSketch(sketch, settings);

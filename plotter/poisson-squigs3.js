const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance } = require("../utils");

const defaultSeed = "720";
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

var r = 0.75;
var k = 30;
var active = [];
var grid = [];
var ordered = [];
var w = r / Math.sqrt(2);
var density = 15;
var bezier = true;

const squig = (startX, startY, endX, endY, bezi, count) => {
  let diffX = endX - startX;
  let diffY = endY - startY;

  let qX1 = startX + (startX - bezi[0]);
  let qY1 = startY + (startY - bezi[1]);

  let _2qX0 = startX + (endX - startX) * 0.75;
  let _2qY0 = startY + (endY - startY) * 0.75;

  let mag = 0.5;
  var mod = count % 2 == 0 ? mag : mag * -1;

  // if (qX1 - startX < 0) {
  //   mod *= -1;
  // } else if (qX1 - startY < 0) {
  //   mod *= -1;
  // }

  // let modX = qX1 - startX < 0 ? -mag : mag;
  // let modY = qY1 - startY < 0 ? -mag : mag;

  let _2qX1 = _2qX0 + (diffY / 2) * mod; //+ random.range(0, 0.1);
  let _2qY1 = _2qY0 - (diffX / 2) * mod; //+ random.range(0, 0.1);

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

      ctx.moveTo(startX, startY);
      ctx.lineTo(qX1, qY1);

      ctx.moveTo(endX, endY);
      ctx.lineTo(_2qX1, _2qY1);

      let size = 0.05;
      ctx.moveTo(qX1 - size / 2, qY1 - size / 2);
      ctx.rect(qX1 - size / 2, qY1 - size / 2, size, size);

      ctx.moveTo(_2qX1 - size / 2, _2qY1 - size / 2);
      ctx.rect(_2qX1 - size / 2, _2qY1 - size / 2, size, size);
    }),
    [_2qX1, _2qY1],
  ];
};

const sketch = (props) => {
  const { width, height, units } = props;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  let xmargin = 1;
  let ymargin = 1;

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

  // Lower density
  var attempts = Math.floor(density / r);

  var lastBezier = [x, y];
  var count = 0;

  while (attempts > 0) {
    while (active.length > 0) {
      var randIndex = random.rangeFloor(0, active.length);
      var pos = active[randIndex];
      var found = false;

      for (var n = 0; n < k; n++) {
        let [x, y] = pos;

        var a = random.range(0, Math.PI * 2);
        var m = random.range(r, r * 1);

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

            const [p, bz] = squig(x, y, sampleX, sampleY, lastBezier, count);
            lastBezier = bz;
            count++;

            // const p = createPath((context) => {
            //   console.log(x, y, sampleX, sampleY);
            //   context.moveTo(x, y);
            //   context.lineTo(sampleX, sampleY);
            // });

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
    var x = random.range(0, width);
    var y = random.range(0, height);
    var i = Math.floor(x / w);
    var j = Math.floor(y / w);
    var pos = [x, y];
    lastBezier = [x, y];
    grid[i + j * cols] = pos;

    active.push(pos);

    attempts--;
  }

  let lines = pathsToPolylines(paths, { units });

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

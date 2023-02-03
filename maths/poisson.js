const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance, offsetLines } = require("../utils");
const { inverseLerp, lerp } = require("canvas-sketch-util/math");

const settings = {
  suffix: random.getSeed(),
  // dimensions: [1080, 1080],
  dimensions: [20.32, 20.32],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in",
  animate: false,
  duration: 15,
};

function unit(value) {
  return value;
}

let xmargin = unit(5);
let ymargin = unit(5);

const sketch = () => {
  return ({ context, width, height }) => {
    // const defaultSeed = "580959";
    const defaultSeed = null;

    random.setSeed(defaultSeed || random.getRandomSeed());
    console.log("Random Seed:", random.getSeed());

    const playhead = random.range(0, 15);

    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    var w = width - xmargin * 2;
    var h = height - ymargin * 2;

    const paths = [];

    let center = {
      x: width / 2,
      y: height / 2,
    };

    // var r = unit(random.range(0.08, 0.1));
    var k = random.rangeFloor(1, 100);
    var r = 0.1;
    // var k = 19;
    console.log("Random K:", k);
    var active = [];
    var grid = [];
    var q = r / Math.sqrt(2);

    var cols = Math.floor(w / q);
    var rows = Math.floor(h / q);
    for (let i = 0; i < rows * cols; i++) {
      grid[i] = undefined;
    }

    // var x = center.x;
    // var y = center.y;
    // var i = Math.floor(x / q);
    // var j = Math.floor(y / q);

    var x = random.range(0, w);
    var y = random.range(0, h);
    var i = Math.floor(x / q);
    var j = Math.floor(y / q);
    var pos = [x, y];
    grid[i + j * cols] = pos;
    active.push(pos);

    var numberOfAttepts = 1;
    var attempts = numberOfAttepts;
    while (attempts > 0) {
      if (attempts !== numberOfAttepts) {
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

          r = r;
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

        let u = inverseLerp(0, width - xmargin * 2, x);
        let v = inverseLerp(0, height - ymargin * 2, y);

        let noise = random.noise3D(u, v, playhead * 0.25, 100, 1);

        let uu = u * (Math.PI * 4) + Math.PI * 0 + playhead * 2;
        let vv = v * Math.PI;

        u = Math.sin(uu) * Math.sin(vv);
        v = Math.cos(vv);
        let z = Math.cos(uu) * Math.sin(vv);

        let rad = unit(2 + z * 0.5);
        let alpha = 1 + z * 0.5;

        rad += noise;

        var scale = 0.5;

        u *= scale;
        v *= scale;

        u += scale;
        v += scale;

        x = lerp(xmargin, width - xmargin, u);
        y = lerp(ymargin, height - ymargin, v);

        context.beginPath();
        context.fillStyle = `rgba(255,255,255,${alpha})`;
        context.arc(x, y, 0.0125 * rad, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
      }
    }
    // context.lineWidth = 5;
    // context.strokeStyle = "white";
    // context.stroke();
  };

  //   let lines = pathsToPolylines(paths, { units });

  //   lines = offsetLines(lines, [xmargin, ymargin]);

  //   return (props) =>
  //     renderPaths(lines, {
  //       ...props,
  //       lineJoin: "round",
  //       lineCap: "round",
  //       lineWidth: 0.1,
  //       optimize: true,
  //       background: "black",
  //       foreground: "white",
  //     });
};

canvasSketch(sketch, settings);

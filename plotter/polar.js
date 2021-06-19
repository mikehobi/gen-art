const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { lerp, mapRange } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { inch } = require("../utils");

const settings = {
  dimensions: "letter",
  units: "cm",
  pixelsPerInch: 300,
};

const defaultSeed = "73539";
// const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

// Adjust margins to drawHeight and drawWidth
const drawHeight = 5;
const drawWidth = 5;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);
// const ymargin = 2;
// const xmargin = 2;

const sketch = (props) => {
  const { width, height, units } = props;

  //   function checkIntersect(x, y, points, row, col, z = 1, offset = [0, 0]) {
  //     //check last rows

  //     for (let i = 0; i <= rowCount; i++) {
  //       if (points[row - i]) {
  //         var last = points[row - i][col];
  //         var [u, v] = noisy(offy(last.pos, offset));
  //         var lx = lerp(xmargin, width - xmargin, u);
  //         var ly = lerp(ymargin, height - ymargin, v);

  //         if (ly <= y) {
  //           return [x, ly];
  //         }
  //       }
  //     }

  //     return [x, y];
  //   }

  let paths = [];

  function noisy(pos) {
    let [u, v] = pos;
    // let noise = random.noise3D(u, v, z, frequency, intensity);
    // noise *= Math.sin(v * Math.PI);
    // v += noise * multi;
    return [u, v];
  }

  let center = {
    x: width / 2,
    y: height / 2,
  };

  function polarNoise(t, f = 1, a = 0.5) {
    let x = Math.cos(t);
    let y = Math.sin(t);
    return random.noise2D(x, y, f, a);
  }

  function centered(coord) {
    let [x, y] = coord;
    x += center.x;
    y += center.y;
    return [x, y];
  }

  function addLine(a, b) {
    const p = createPath((context) => {
      context.moveTo(...centered(a));
      context.lineTo(...centered(b));
    });
    paths.push(p);
  }

  let count = 50;
  for (let i = 0; i < count; i++) {
    let y = mapRange(i, 0, count, -5, 5);
    let origin = [0, y];

    let [ox, oy] = origin;
    var last = [null, null];

    for (let a = 0; a <= Math.PI * 2; a += Math.PI / 24) {
      let noise = polarNoise(a);

      let r = 3 + noise;
      let x = ox + r * Math.cos(a);
      let y = oy + r * Math.sin(a);

      // Get last, or set last for first point.
      let [lx, ly] = last;
      if (!lx || !ly) {
        [lx, ly] = [x, y];
      }

      addLine([lx, ly], [x, y]);
      last = [x, y];
    }
  }

  lines = pathsToPolylines(paths, { units });

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.01,
      optimize: {
        sort: false,
        removeDuplicates: false,
        removeCollinear: false,
        merge: true,
      },
    });
};

canvasSketch(sketch, settings);

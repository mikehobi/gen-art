const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { lerp, mapRange } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { inch, clamp, inside } = require("../utils");
const math = require("canvas-sketch-util/math");

// const defaultSeed = "73539";
const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  dimensions: "letter",
  units: "cm",
  pixelsPerInch: 300,

  name: "(polar-cylinder)",
  suffix: random.getSeed(),
};

// Adjust margins to drawHeight and drawWidth
const drawHeight = 5;
const drawWidth = 5;

// const ymargin = inch((11 - drawHeight) / 2);
// const xmargin = inch((8.5 - drawWidth) / 2);
const ymargin = 2;
const xmargin = 2;

const sketch = (props) => {
  const { width, height, units } = props;

  let paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  function polarNoise(t, z = 1, f = 1, a = 1.2) {
    let x = Math.cos(t);
    let y = Math.sin(t);
    return random.noise3D(x * 0.5, y * 0.4, z * z * 10 * 0.5, f, a);
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

  let count = 90;
  let noisec = 0.5 / count;
  let segments = 200;
  let lastPoints = [];
  for (let i = 0; i < count; i++) {
    let y = mapRange(i, 0, count, 0, 0);

    let origin = [0, y];

    let [ox, oy] = origin;
    let last = [null, null];
    let nextPoints = [];

    // let radius = 5; //* random.range(1, 1.1);
    for (let a = 0; a <= segments + 1; a++) {
      let theta = mapRange(a, 0, segments, 0, Math.PI * 2);
      let noise = polarNoise(theta, i * noisec, 1, 0.1);

      let radius = i * (9 / count);
      let r = radius + noise;
      let x = ox + r * Math.cos(theta);
      let y = oy + r * Math.sin(theta);

      // Get last, or set last for first point.
      let [lx, ly] = last;
      if (!lx || !ly) {
        [lx, ly] = [x, y];
      }

      if (lastPoints[i - 1]) {
        let intersect;
        let numberToCheck = 50;
        let max = clamp(i - numberToCheck, 0, 999);
        for (let j = i; j > max; j--) {
          intersect = inside([x, y], lastPoints[j - 1]);
          if (intersect) {
            break;
          }
        }

        if (!intersect) {
          addLine([lx, ly], [x, y]);
        }
      } else {
        addLine([lx, ly], [x, y]);

        // addLine([lx, ly], [x, y]);
      }
      last = [x, y];
      nextPoints.push([x, y]);
    }

    lastPoints[i] = nextPoints;
  }

  lines = pathsToPolylines(paths, { units });

  // Clip to bounds, using a margin in working units
  //   const margin = 7; // in working 'units' based on settings
  //   const box = [margin, margin, width - margin, height - margin];
  //   lines = clipPolylinesToBox(lines, box);

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

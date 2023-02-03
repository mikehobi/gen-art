const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { lerp, mapRange } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { inch, clamp } = require("../utils");

const settings = {
  // suffix: random.getSeed(),
  dimensions: "tabloid",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",

  prefix: "(from-center)",
  suffix: random.getSeed(),
};

const defaultSeed = "330168";
// const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

// Adjust margins to drawHeight and drawWidth
const drawHeight = 5;
const drawWidth = 5;

const ymargin = inch((11 - drawHeight) / 2);
const xmargin = inch((8.5 - drawWidth) / 2);

const sketch = (props) => {
  const { width, height, units } = props;

  console.log(random.getSeed());

  let paths = [];

  function noisy(pos) {
    let [u, v] = pos;
    return [u, v];
  }

  let center = {
    x: width / 4,
    y: height / 4,
  };

  function polarNoise(t, z = 1, f = 1, a = 0.5) {
    let x = Math.cos(t);
    let y = Math.sin(t);
    return random.noise3D(x, y, z, f, a);
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

  let count = 300;
  for (let i = 0; i < count; i++) {
    let center = centered([0, 0]);

    let theta = mapRange(i, 0, count, 0, Math.PI * 2);

    // let noisec = 0.5 / count;
    let noise = polarNoise(theta, 1.0, 1, 0.5);

    let r = 10 + noise;

    let s = 4;
    let x = center[0] + r * Math.cos(theta); //+ noise * s;
    let y = center[1] + r * Math.sin(theta) + noise * s;

    let p = 0.2;
    if (i <= 15 || i >= 280) {
      p = 0;
    }

    let offCenter = [
      center[0] + p * Math.cos(theta),
      center[1] + p * Math.sin(theta),
    ];

    // if (i <= 15 || i >= 280) {
    if (i <= 122 || i >= 280) {
      // addLine(offCenter, [x, y]);
    } else {
      addLine(offCenter, [x, y]);
    }
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

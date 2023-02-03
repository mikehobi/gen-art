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

// const defaultSeed = "57374";
const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: "tabloid",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",

  name: "(polar-disc)",
  suffix: random.getSeed(),
};

// Adjust margins to drawHeight and drawWidth
const drawHeight = 5;
const drawWidth = 5;

// const ymargin = inch((11 - drawHeight) / 2);
// const xmargin = inch((8.5 - drawWidth) / 2);
// const ymargin = 2;
// const xmargin = 2;

function inside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  var x = point[0],
    y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

const sketch = (props) => {
  const { width, height, units } = props;

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

  function dipInInk() {
    const p = createPath((context) => {
      context.moveTo(6, 10);
      context.lineTo(6.3, 10.3);
    });
    // const p = createPath((context) => {
    //   const segs = 5;
    //   const ox = 6;
    //   const oy = 10;
    //   let last = [null, null];
    //   for (let a = 0; a <= segs; a++) {
    //     let theta = mapRange(a, 0, segs, 0, Math.PI * 2);
    //     let radius = 0.15;
    //     let r = radius;
    //     let x = ox + r * Math.cos(theta);
    //     let y = oy + r * Math.sin(theta);
    //     let [lx, ly] = last;
    //     if (!lx || !ly) {
    //       [lx, ly] = [x, y];
    //     }

    //     context.moveTo(lx, ly);
    //     context.lineTo(x, y);
    //     last = [x, y];
    //   }
    // });
    paths.push(p);
  }

  let count = 3;
  let noisec = 0.6 / count;
  let segments = 801;
  let lastPoints = [];

  for (let i = 0; i < count; i++) {
    // dipInInk();

    const rando = 0;
    let y = mapRange(i, 0, count, 0, 0);
    let origin = [0, y];

    let [ox, oy] = origin;
    let last = [null, null];
    let nextPoints = [];

    const randy = random.range(0, Math.PI);

    for (let a = 0 + rando; a <= segments + rando; a++) {
      let theta = mapRange(a, 0, segments, 0, Math.PI * 2);
      let noise = polarNoise(theta, i * noisec, 2.5, 0.01 + 0.01 * i);

      let radius = 0.1 + i * noisec * 20;

      let r = radius + noise;
      let x = ox + r * Math.cos(theta);
      let y = oy + r * Math.sin(theta);

      // Get last, or set last for first point.
      let [lx, ly] = last;
      if (!lx || !ly) {
        [lx, ly] = [x, y];
      }

      addLine([lx, ly], [x, y]);
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
      lineWidth: 0.45,
      optimize: {
        sort: false,
        removeDuplicates: false,
        removeCollinear: false,
        merge: false,
      },
    });
};

canvasSketch(sketch, settings);

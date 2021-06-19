const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance, inch } = require("../utils");

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

  name: "(travelers-from-center)",
  suffix: random.getSeed(),
};

const drawHeight = 6;
const drawWidth = 10;

const ymargin = inch((17 - drawHeight) / 2);
const xmargin = inch((11 - drawWidth) / 2);

// Example:
// [[0,0], [2,2]]
const cast = (line, bound) => {
  const x1 = bound[0][0];
  const y1 = bound[0][1];
  const x2 = bound[1][0];
  const y2 = bound[1][1];

  const x3 = line[0][0];
  const y3 = line[0][1];
  const x4 = line[1][0];
  const y4 = line[1][1];

  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (den == 0) {
    return line;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
  if (t > 0 && t < 1 && u > 0) {
    let newLine = [
      [x3, y3],
      [x1 + t * (x2 - x1), y1 + t * (y2 - y1)],
    ];
    return newLine;
  } else {
    return line;
  }
};

const sketch = (props) => {
  const { width, height, units } = props;

  const vectors = [];
  const paths = [];
  function addLine(a, b) {
    const p = createPath((context) => {
      context.moveTo(a[0], a[1]);
      context.lineTo(b[0], b[1]);
    });
    paths.push(p);
    vectors.push([a, b]);
  }

  function test(l, vectors) {
    let record = Infinity;
    let closest = l;
    vectors.forEach((vector) => {
      const result = cast(l, vector);
      const d = distance(result[0], result[1]);
      if (d < record) {
        record = d;
        closest = result;
      }
    });
    return closest;
  }

  // Frame setup
  let tl = [xmargin, ymargin];
  let tr = [width - xmargin, ymargin];
  let br = [width - xmargin, height - ymargin];
  let bl = [xmargin, height - ymargin];
  addLine(tl, tr);
  addLine(tr, br);
  addLine(br, bl);
  addLine(bl, tl);
  // vectors.push([tl, tr]);
  // vectors.push([tr, br]);
  // vectors.push([br, bl]);
  // vectors.push([bl, tl]);

  const randomOnBounds = () => {
    let chance = random.chance(0.5);
    let x, y;
    if (chance) {
      x = random.chance(0.5) ? xmargin : width - xmargin;
      y = random.range(ymargin, height - ymargin);
    } else {
      x = random.range(xmargin, width - xmargin);
      y = random.chance(0.5) ? ymargin : height - ymargin;
    }
    return [x, y];
  };

  // GO GO GO
  var count = 5000;
  var last = randomOnBounds();
  var lastAngle = random.range(0, 2 * Math.PI);
  for (let i = 0; i < count; i++) {
    let mag = 100;
    // let angle = random.range(0, 2 * Math.PI);
    // let angle = lastAngle - Math.PI - random.range(-Math.PI, Math.PI);
    let angle =
      lastAngle - Math.PI - random.range(-Math.PI * 0.01, Math.PI * 0.01);

    let start = last;
    let end = [
      start[0] + mag * Math.cos(angle),
      start[1] + mag * Math.sin(angle),
    ];

    let result = test([start, end], vectors);

    if (result[1] === end) {
      end = [
        start[0] - mag * Math.cos(angle),
        start[1] - mag * Math.sin(angle),
      ];
      result = test([start, end], vectors);
    }

    let d = distance(result[0], result[1]);
    if (d < 0.5) {
      last = randomOnBounds();
      lastAngle = random.range(0, 2 * Math.PI);
    } else {
      addLine(result[0], result[1]);
      last = result[1];
      lastAngle = angle;
    }
  }

  let lines = pathsToPolylines(paths, { units });

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

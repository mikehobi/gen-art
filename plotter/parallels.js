const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance, inch, inside } = require("../utils");

const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: "letter",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",

  name: "(parallels)",
  suffix: `${random.getSeed()}-${Date.now()}`,
};

const docHeight = 11;
const docWidth = 8.5;

const drawHeight = 10;
const drawWidth = 7.5;

const ymargin = inch((docHeight - drawHeight) / 2);
const xmargin = inch((docWidth - drawWidth) / 2);

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

const sketch = (props) => {
  const { width, height, units } = props;

  const vectors = [];
  const paths = [];

  function addParallelLine(a, b, angle, noise) {
    // let w = 1 + random.noise1D(i * 0.0001) * 1.5;
    let w = 0.25 + noise * 0.25;
    let x = (w * Math.sin(angle)) / 2;
    let y = (w * Math.cos(Math.PI + angle)) / 2;

    let x1 = [a[0] + x, a[1] - y];
    let y1 = [b[0] + x, b[1] - y];
    let x2 = [a[0] - x, a[1] + y];
    let y2 = [b[0] - x, b[1] + y];

    let result = test([y1, x1], vectors);

    let f1 = false;
    f1 = result[0] !== x1 || result[1] !== y1;

    x1 = result[0];
    y1 = result[1];

    let result2 = test([y2, x2], vectors);
    let f2 = false;
    f1 = result2[0] !== x2 || result2[1] !== y2;

    x2 = result2[0];
    y2 = result2[1];

    const p = createPath((context) => {
      if (f1) {
        context.moveTo(...x1);
        context.lineTo(...y1);
      }
      if (!f2) {
        context.moveTo(...x2);
        context.lineTo(...y2);
      }
    });
    paths.push(p);

    vectors.push([x1, y1]);
    vectors.push([x2, y2]);
    vectors.push([x1, x2]);
    vectors.push([y1, y2]);
    // vectors.push([x1, y2]);
    // vectors.push([y1, x2]);
  }

  // GO GO GO
  // var last = [width / 2, height / 2];
  var last = [
    random.range(xmargin, width - xmargin),
    random.range(ymargin, height - ymargin),
  ];
  var count = 3000;

  var offset = 0;

  for (let i = 0; i < count; i++) {
    let m = 0.1;
    let noise = random.noise1D(i * 0.00475 + offset * 999);
    let angle = noise * Math.PI * 2;
    let x = m * Math.cos(angle);
    let y = m * Math.sin(angle);
    let next = [last[0] + x, last[1] - y];
    addParallelLine(last, next, angle, noise);

    if (
      last[0] < xmargin ||
      last[1] < ymargin ||
      last[0] > width - xmargin ||
      last[1] > height - ymargin
    ) {
      last = [
        random.range(xmargin, width - xmargin),
        random.range(ymargin, height - ymargin),
      ];
      offset++;
    } else {
      last = next;
    }
  }
  const frame = createPath((context) => {
    context.rect(xmargin, ymargin, width - xmargin * 2, height - ymargin * 2);
  });
  paths.push(frame);

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

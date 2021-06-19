const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const random = require("canvas-sketch-util/random");
const { distance, offsetLines, distSq, gridCoord, inch } = require("../utils");
const { lerp, mapRange } = require("canvas-sketch-util/math");

// const defaultSeed = "47988";
const defaultSeed = "773170";
random.setSeed(defaultSeed || random.getRandomSeed());

console.log("Random Seed:", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  // dimensions: "letter",
  dimensions: [25.4, 20.32],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

// const drawHeight = 4.25;
// const drawWidth = 4.25;

// const ymargin = inch((11 - drawHeight) / 2);
// const xmargin = inch((8.5 - drawWidth) / 2);

xmargin = 1;
ymargin = 1;

const sketch = (props) => {
  const { width, height, units } = props;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  // FUNCTIONS
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

  // GO GO GO
  var count = 5001;

  var endRadius = inch(6);

  // Everything will be offset from center (0,0) == center
  let last = [0, 0];

  // const inc = 40;
  // const inc = 60;
  // const inc = 80;
  // const inc = 100;
  // const inc = 120;

  const inc = 120;

  for (let i = 0; i < count; i++) {
    let r = (i / count) * endRadius;
    let x = r * -Math.cos(i * ((inc * Math.PI) / (count - 1)));
    let y = r * -Math.sin(i * ((inc * Math.PI) / (count - 1)));

    let [lx, ly] = last;
    addLine(last, [x, y]);
    last = [x, y];
  }

  // const frame = createPath((context) => {
  //   context.rect(xmargin, ymargin, width - xmargin * 2, height - ymargin * 2);
  // });
  // paths.push(frame);

  let lines = pathsToPolylines(paths, { units });

  // const margin = 5; // in working 'units' based on settings
  // const box = [xmargin, ymargin, width - xmargin, height - ymargin];
  // lines = clipPolylinesToBox(lines, box);

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

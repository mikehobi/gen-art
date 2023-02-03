const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { noise1D } = require("canvas-sketch-util/random");
const { inch } = require("../../utils");

const settings = {
  dimensions: "tabloid",
  units: "cm",
  pixelsPerInch: 300,
};

let margin = random.range(1, 2);
const ymargin = inch(margin);
const xmargin = inch(margin);

const rowCount = random.rangeFloor(3, 10);

const defaultSeed = "705764";
// const defaultSeed = null;
random.setSeed(defaultSeed || random.getRandomSeed());

const sketch = (props) => {
  const { width, height, units } = props;

  let paths = [];

  const offset = -0.002;

  Array.from(new Array(rowCount)).forEach((_, rowIndex) => {
    let rowSeed = random.rangeFloor(0, 9999);
    // let randomFreq = random.range(0.01, 0.06);
    let randomFreq = 0.005;
    // let randomFreq = 0.005 + noise1D(rowIndex + 9999, 0.0001, 0.0001);
    let randomAmp = 0.0025;
    let last = random.range(0, 0.001);
    let i = 0;

    const p = createPath((context) => {
      var x = lerp(xmargin, width - xmargin, last);
      var y = lerp(ymargin, height - ymargin, 0 + rowIndex / rowCount);
      var toY = lerp(
        ymargin,
        height - ymargin,
        0 + (rowIndex + 1) / rowCount + offset
      );

      context.moveTo(x, y);
      context.lineTo(x, toY);
    });
    paths.push(p);

    while (last <= 1) {
      let next =
        0.002 +
        (randomAmp + random.noise1D(i + rowSeed, randomFreq, randomAmp));
      if (last + next >= 1) {
        last = 1;
        return;
      }
      const p = createPath((context) => {
        var x = lerp(xmargin, width - xmargin, last + next);

        var y = lerp(ymargin, height - ymargin, 0 + rowIndex / rowCount);
        var toY = lerp(
          ymargin,
          height - ymargin,
          0 + (rowIndex + 1) / rowCount + offset
        );

        context.moveTo(x, y);
        context.lineTo(
          x + noise1D(i + rowSeed, random.range(0, 50), random.range(0.1, 0.2)),
          toY
        );
      });
      paths.push(p);
      last = last + next;
      i++;
    }
  });

  let lines = pathsToPolylines(paths, { units });

  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];
  lines = clipPolylinesToBox(lines, box);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.02,
      optimize: true,
    });
};

canvasSketch(sketch, settings);

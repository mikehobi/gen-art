const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const Random = require("canvas-sketch-util/random");
const { distance } = require("../utils");

// You can force a specific seed by replacing this with a string value
const defaultSeed = "as";

// Set a random seed so we can reproduce this print later
Random.setSeed(defaultSeed || Random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log("Random Seed:", Random.getSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: "postcard",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

const squig = (startX, startY, endX, endY, bezi) => {
  let diffX = endX - startX;
  let diffY = endY - startY;

  let qX1 = startX + (startX - bezi[0]);
  let qY1 = startY + (startY - bezi[1]);

  let _2qX0 = startX + (endX - startX) * 0.75;
  let _2qY0 = startY + (endY - startY) * 0.75;

  let _2qX1 = _2qX0 + diffY / 2;
  let _2qY1 = _2qY0 - diffX / 2;

  return [
    createPath((ctx) => {
      ctx.moveTo(startX, startY);

      ctx.bezierCurveTo(qX1, qY1, _2qX1, _2qY1, endX, endY);

      ctx.moveTo(startX, startY);
      ctx.lineTo(qX1, qY1);

      ctx.moveTo(endX, endY);
      ctx.lineTo(_2qX1, _2qY1);

      ctx.moveTo(qX1 - 0.05, qY1 - 0.05);
      ctx.rect(qX1 - 0.05, qY1 - 0.05, 0.1, 0.1);

      ctx.moveTo(_2qX1 + 0.1, _2qY1);
      ctx.arc(_2qX1, _2qY1, 0.1, 0, 2 * Math.PI);
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

  last = [center.x, center.y];
  lastBezier = [center.x, center.y];

  let cmds = [
    [1, 1],
    [-1, 1],
    [-1, -2],
    [2, -2],
    [-1, -3],
    [2, 0],
    [1, 3],
    [0, 5],
    [-3, 3],
  ];

  cmds.forEach((pos, i) => {
    let [lastX, lastY] = last;
    let x = pos[0] + lastX;
    let y = pos[1] + lastY;
    let [p, lastBZ] = squig(lastX, lastY, x, y, lastBezier);
    paths.push(p);
    last = [x, y];
    lastBezier = lastBZ;
  });

  // paths.push(squig(center.x, center.y, center.x + 1, center.y + 1, 0));
  // paths.push(squig(center.x + 1, center.y + 1, center.x - 2, center.y + 1, 0));

  // const count = 5;
  // let last = [center.x, center.y];
  // for (let i = 0; i < count; i++) {
  //   let [lastX, lastY] = last;
  //   const x = lastX + 0.2 + 0.3;
  //   const y = lastY + 0.2 + 0.3;
  //   const p = squig(lastX + 0.2, lastY + 0.2, x, y, i);
  //   paths.push(p);
  //   last = [x, y];
  // }

  let lines = pathsToPolylines(paths, { units });

  // const margin = 1;
  // const box = [margin, margin, width - margin, height - margin];
  // lines = clipPolylinesToBox(lines, box);

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

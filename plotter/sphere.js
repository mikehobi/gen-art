const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const Random = require("canvas-sketch-util/random");

// You can force a specific seed by replacing this with a string value
const defaultSeed = "";

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

const ellipses = (x, y, width, height) => {
  var width_over_2 = width / 2;
  var width_two_thirds = (width * 2) / 3;
  var height_over_2 = height / 2;

  return createPath((ctx) => {
    ctx.moveTo(x, y - height_over_2);
    ctx.bezierCurveTo(
      x + width_two_thirds,
      y - height_over_2,
      x + width_two_thirds,
      y + height_over_2,
      x,
      y + height_over_2
    );
    ctx.bezierCurveTo(
      x - width_two_thirds,
      y + height_over_2,
      x - width_two_thirds,
      y - height_over_2,
      x,
      y - height_over_2
    );
    ctx.closePath();
  });
};

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  // Draw random arcs
  const count = 20;
  for (let i = 0; i < count; i++) {
    var x = center.x;
    var y = center.y + i * 0.02 + Math.cos((i / (count - 1)) * Math.PI) * 3;

    var w = 1 + Math.sin((i / (count - 1)) * Math.PI) * (Math.PI * 2);
    var h = 0.4 + Math.sin((i / (count - 1)) * Math.PI) * Math.PI;

    const p = ellipses(x, y, w, h);

    paths.push(p);
  }

  const ls = 100;
  for (let i = 0; i < ls; i++) {
    const p = createPath((ctx) => {
      let fY = 5.04;
      let tY = 10.6;

      ctx.moveTo(x, fY);

      let a = Random.noise2D(center.x - i, center.y - i, 1.0, 3);
      let b = Random.noise2D(center.x + i, center.y + i, 1.0, 3);

      ctx.bezierCurveTo(center.x, fY, center.x - a, center.y + b, center.x, tY);
    });
    paths.push(p);
  }

  // Convert the paths into polylines so we can apply line-clipping
  // When converting, pass the 'units' to get a nice default curve resolution
  let lines = pathsToPolylines(paths, { units });

  // Clip to bounds, using a margin in working units
  const margin = 1; // in working 'units' based on settings
  const box = [margin, margin, width - margin, height - margin];
  lines = clipPolylinesToBox(lines, box);

  // The 'penplot' util includes a utility to render
  // and export both PNG and SVG files
  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      // in working units; you might have a thicker pen
      lineWidth: 0.03,
      // Optimize SVG paths for pen plotter use
      optimize: true,
    });
};

canvasSketch(sketch, settings);

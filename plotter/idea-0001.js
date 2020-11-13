const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');

// You can force a specific seed by replacing this with a string value
const defaultSeed = "as";

// Set a random seed so we can reproduce this print later
Random.setSeed(defaultSeed || Random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log('Random Seed:', Random.getSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'postcard',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
};

const sketch = (props) => {
  const { width, height, units } = props;

  const paths = [];

  let center = {
    x: width / 2,
    y: height / 2,
  };

  const count = 8000;
  let last = [center.x, center.y]
  for (let i = 0; i < count; i++) {

    const p = createPath(context => {
      let [x, y] = last
      context.moveTo(x, y)

      x += i;
      y += i;

      context.lineTo(x, y);
      last = [x, y]
    });

    paths.push(p)

  }

  let lines = pathsToPolylines(paths, { units });

  const margin = 1;
  const box = [ margin, margin, width - margin, height - margin ];
  lines = clipPolylinesToBox(lines, box);

  return props => renderPaths(lines, {
    ...props,
    lineJoin: 'round',
    lineCap: 'round',
    lineWidth: 0.02,
    optimize: true
  });
};

canvasSketch(sketch, settings);

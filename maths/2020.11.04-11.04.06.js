const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');

// You can force a specific seed by replacing this with a string value
const defaultSeed = null;

// Set a random seed so we can reproduce this print later
Random.setSeed(defaultSeed || Random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log('Random Seed:', Random.getSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
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
  const count = 800;
  let last = [center.x, center.y]
  for (let i = 0; i < count; i++) {
    // setup arc properties randomly
    // const angle = Random.gaussian(0, Math.PI / 2);
    // const arcLength = Math.abs(Random.gaussian(0, Math.PI / 2));
    // const r = ((i + 1) / count) * Math.min(width, height) / 1;

    // draw the arc
    // const p = createPath();
    // p.arc(width / 2, height / 2, r, angle, angle + arcLength);
    // paths.push(p);

    const p = createPath(context => {
      let [x, y] = last
      context.moveTo(x, y)

      // x += i * Math.sin(i * 3.14 * 2) * 1
      // y += i * Math.cos(i * 3.14 * 2) * 1
      let u = i * 0.2
      let m = 0.021;
      let f = 1;
      // let f = 1;
      x += u * Math.sin(u * f) * m
      y += u * Math.cos(u * f) * m

      let p = Random.noise2D(x, y, 1.0, 0.1)
      let p2 = Random.noise2D(x, y + i, 1.0, 0.1)

      y += p;
      x += p2;

      context.lineTo(x, y);
      last = [x, y]
      // context.moveTo(center.x + i, center.y - i);
      // context.lineTo(center.x + i, center.y + i)
      // context.rotate(1);
      
      // context.moveTo(center.x, center.y);
      // context.lineTo(-p * 3, p * 5)
      // context.lineTo(i, i * 0.1);
      // context.arc(52, 50, 25, 0, Math.PI * 2);
    });

    paths.push(p)


    // let p = noise2D(center.x + i, center.y + i, 100.0, 1.0)
    // let deg = p * 3600000000
    // context.strokeStyle = "white";
    // context.rotate(deg);
    // context.translate(0, i);

    // let p2 = noise2D(center.x + i * i, center.y + i * i, i * 10000, 10.0)
    // context.translate(p2, 0)

    // context.lineTo(0, 0);
    // context.stroke();
    // context.rotate(-deg);


  }

  // Convert the paths into polylines so we can apply line-clipping
  // When converting, pass the 'units' to get a nice default curve resolution
  let lines = pathsToPolylines(paths, { units });

  // Clip to bounds, using a margin in working units
  const margin = 1; // in working 'units' based on settings
  const box = [ margin, margin, width - margin, height - margin ];
  lines = clipPolylinesToBox(lines, box);

  // The 'penplot' util includes a utility to render
  // and export both PNG and SVG files
  return props => renderPaths(lines, {
    ...props,
    lineJoin: 'round',
    lineCap: 'round',
    // in working units; you might have a thicker pen
    lineWidth: 0.03,
    // Optimize SVG paths for pen plotter use
    optimize: true
  });
};

canvasSketch(sketch, settings);

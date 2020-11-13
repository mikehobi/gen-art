const canvasSketch = require("canvas-sketch");
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
//   dimensions: [1024, 1024],
//   animate: true,
//   duration: 15,
//   fps: 60,
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300
};

const sketch = (props) => {
  const { width, height, units } = props;

  const createGrid = () => {
    const rows = [];
    const rowCount = 90
    const colCount = 50
    for (let y = 0; y < rowCount; y++) {
      let arr = []
      for (let x = 0; x < colCount; x++) {
        const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
        const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);
        arr.push({
          pos: [u, v],
        })
      }
      rows.push(arr)
    }
    return rows
  };

  // random.setSeed(4998);
  // random.setSeed(3);
  const points = createGrid()

  const ymargin = 18;
  const xmargin = 8;
  var ctx;

  // return ({ context, width, height }) => {
    // ctx = context;

    // ctx.fillStyle = bg;
    // ctx.fillRect(0, 0, width, height);

    let paths = []

    let last = [0, 0]

    function noisy(pos) {
      let [u,v] = pos
      let noise = random.noise2D(u + 1 * 1.5, v, 3, .55);
      v += noise * 0.07
      return [u, v]
    }

    points.forEach((arr, index) => {
      // Start at beginning
      var [u, v] = noisy(arr[0].pos)
      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v);
      last = [x, y]

      arr.forEach((i) => {
        const p = createPath(context => {
          var [u, v] = noisy(i.pos)
          var [x, y] = last
          context.moveTo(x, y);

          // let noise = random.noise2D(u + 1 * 1.5, v + 1 * 1.3, 2.0);
          // v += noise * 0.07

          var x = lerp(xmargin, width - xmargin, u);
          var y = lerp(ymargin, height - ymargin, v);
          context.lineTo(x, y);
          last = [x, y]
        })
      
        paths.push(p)
      })
      
    })

    // Convert the paths into polylines so we can apply line-clipping
    // When converting, pass the 'units' to get a nice default curve resolution
    console.log(paths)
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
      lineWidth: 0.05,
      // Optimize SVG paths for pen plotter use
      optimize: true
    });
  };

canvasSketch(sketch, settings);

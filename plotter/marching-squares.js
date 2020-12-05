const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const { griddy } = require("../utils");

const settings = {
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 0;
const xmargin = 0;
const res = 0.15;

// random.setSeed(1);

const sketch = (props) => {
  const { width, height, units } = props;

  const rowCount = 1 + Math.ceil(height / res);
  const colCount = 1 + Math.ceil(width / res);

  const grid = griddy(rowCount, colCount);
  console.log(grid);

  for (let i = 0; i < colCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      // grid[i][j] = random.range(-1, 1);
      grid[i][j] = random.noise2D(i, j, 0.05, 1);
    }
  }

  let paths = [];

  for (let i = 0; i < colCount; i++) {
    for (let j = 0; j < rowCount; j++) {
      const p = createPath((context) => {
        let x = i * res;
        let y = j * res;

        // console.log(grid[i][j]);
        // context.arc(x, y, 0.05, 0, Math.PI * 2);

        var a = [x + res * 0.5, y];
        var b = [x + res, y + res * 0.5];
        var c = [x + res * 0.5, y + res];
        var d = [x, y + res * 0.5];

        let state = getState(
          Math.ceil(grid[i][j] * 4) % 2,
          Math.ceil(grid[i + 1][j] * 4) % 2,
          Math.ceil(grid[i + 1][j + 1] * 4) % 2,
          Math.ceil(grid[i][j + 1] * 4) % 2
        );

        // let state = getState(
        //   Math.ceil(grid[i][j]),
        //   Math.ceil(grid[i + 1][j]),
        //   Math.ceil(grid[i + 1][j + 1]),
        //   Math.ceil(grid[i][j + 1])
        // );

        switch (state) {
          case 1:
            drawLine(context, c, d);
            break;
          case 2:
            drawLine(context, b, c);
            break;
          case 3:
            drawLine(context, b, d);
            break;
          case 4:
            drawLine(context, a, b);
            break;
          case 5:
            drawLine(context, a, d);
            drawLine(context, b, c);
            break;
          case 6:
            drawLine(context, a, c);
            break;
          case 7:
            drawLine(context, a, d);
            break;
          case 8:
            drawLine(context, a, d);
            break;
          case 9:
            drawLine(context, a, c);
            break;
          case 10:
            drawLine(context, a, b);
            drawLine(context, c, d);
            break;
          case 11:
            drawLine(context, a, b);
            break;
          case 12:
            drawLine(context, b, d);
            break;
          case 13:
            drawLine(context, b, c);
            break;
          case 14:
            drawLine(context, c, d);
            break;
        }
      });
      paths.push(p);
    }
  }

  // grid.forEach((arr, index) => {
  // Start at beginning
  // var [u, v] = arr[0].pos;
  //   var x = lerp(xmargin, width - xmargin, u);
  //   var y = lerp(ymargin, height - ymargin, v);

  //   arr.forEach((i) => {
  //     const p = createPath((context) => {
  //       var [u, v] = i.pos;
  //       var val = noise(i.pos);

  //       var x = lerp(xmargin, width - xmargin, u);
  //       var y = lerp(ymargin, height - ymargin, v);

  //       context.arc(x, y, 0.05, 0, Math.PI * 2);

  //       let state = getState(
  //         grid[i][j],
  //         grid[i + 1][j],
  //         grid[i + 1][j + 1],
  //         grid[i][j + 1]
  //       );

  //       switch (state) {
  //         case 0:
  //           line(context, a, b);
  //         case 1:
  //         // line(context, a, b);
  //         case 2:
  //         // line(context, a, b);
  //         case 3:
  //         // line(context, a, b);
  //         case 4:
  //         // line(context, a, b);
  //         case 5:
  //         // line(context, a, b);
  //         case 6:
  //         // line(context, a, b);
  //         case 7:
  //         // line(context, a, b);
  //         case 8:
  //         // line(context, a, b);
  //         case 9:
  //         // line(context, a, b);
  //         case 10:
  //         // line(context, a, b);
  //         case 11:
  //         // line(context, a, b);
  //         case 12:
  //         // line(context, a, b);
  //         case 13:
  //         // line(context, a, b);
  //         case 14:
  //         // line(context, a, b);
  //         case 15:
  //         // line(context, a, b);
  //       }

  //       // context.moveTo(a[0], a[1]);
  //       // context.lineTo(b[0], b[1]);
  //     });

  //     paths.push(p);
  //   });
  // });

  let lines = pathsToPolylines(paths, { units });

  const box = [xmargin, ymargin, width - xmargin, height - ymargin];
  lines = clipPolylinesToBox(lines, box);

  return (props) =>
    renderPaths(lines, {
      ...props,
      lineJoin: "round",
      lineCap: "round",
      lineWidth: 0.05,
      optimize: true,
    });
};

function drawLine(context, a, b) {
  context.moveTo(a[0], a[1]);
  context.lineTo(b[0], b[1]);
}

function getState(a, b, c, d) {
  return a * 8 + b * 4 + c * 2 + d * 1;
}

canvasSketch(sketch, settings);

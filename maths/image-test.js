const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  createPath,
  pathsToPolylines,
} = require("canvas-sketch-util/penplot");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: "A4",
  units: "cm",
  pixelsPerInch: 300,
};

const ymargin = 4;
const xmargin = 4;

const rowCount = 90;
const colCount = 50;
const createGrid = (rowCount, colCount) => {
  const rows = [];
  for (let y = 0; y < rowCount; y++) {
    let arr = [];
    for (let x = 0; x < colCount; x++) {
      const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
      const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);
      arr.push({
        pos: [u, v],
      });
    }
    rows.push(arr);
  }
  return rows;
};

const sketch = () => {
  return ({ context, width, height, units }) => {
    //grid
    const points = createGrid(rowCount, colCount);
    let paths = [];

    // img crap
    let img = new Image();
    img.src = "./plotter/images/test.png";
    document.body.append(img);

    context.drawImage(img, 0, 0);
    var imgData = context.getImageData(0, 0, 100, 100);
    let [r, g, b, a] = pixelData(imgData.data, 100, 100, 100, 100);

    var brightness = (r + g + b) / 3 / 255;
    console.log("bright", brightness);

    // let rgba = `rgba(${r}, ${g}, ${b}, ${a})`;

    // context.fillStyle = "white";
    // context.fill();

    points.forEach((arr, index) => {
      // Start at beginning
      var [u, v] = arr[0].pos;
      var x = lerp(xmargin, width - xmargin, u);
      var y = lerp(ymargin, height - ymargin, v);
      last = [x, y];

      arr.forEach((i) => {
        const p = createPath((context) => {
          var [u, v] = i.pos;

          // Use last coord if needed.
          // var [x, y] = last;

          var x = lerp(xmargin, width - xmargin, u);
          var y = lerp(ymargin, height - ymargin, v);
          context.moveTo(x, y);

          let [toU, toV] = i.pos;

          var toX = lerp(xmargin, width - xmargin, toU);
          var toY = lerp(ymargin, height - ymargin, toV);
          context.lineTo(toX, toY);
          last = [x, y];
        });

        paths.push(p);
      });
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
        lineWidth: 0.05,
        optimize: true,
      });
  };
};

canvasSketch(sketch, settings);

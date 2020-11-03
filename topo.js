const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [1024, 1024],
  animate: true,
  duration: 15,
  fps: 60,
  // dimensions: "A3",
  // units: "cm",
  // pixelsPerInch: 300
};

const sketch = () => {
  // const palette = random.shuffle(random.pick(palettes)).slice(0, 2);
  const palette = ["white"];

  const bg = "black";

  const createGrid = () => {
    const rows = [];
    const rowCount = 100
    const colCount = 500
    for (let y = 0; y < rowCount; y++) {
      let arr = []
      for (let x = 0; x < colCount; x++) {
        const u = colCount <= 1 ? 0.5 : x / (colCount - 1);
        const v = rowCount <= 1 ? 0.5 : y / (rowCount - 1);
        arr.push({
          rad: 1,
          pos: [u, v],
          color: random.pick(palette)
        })
      }
      rows.push(arr)
    }
    return rows
  };

  random.setSeed(4998);
  const points = createGrid()

  const ymargin = 100;
  const xmargin = 100;
  var ctx;
  var gWidth;
  var gHeight;

  return ({ context, width, height, playhead }) => {
    gWidth = width;
    gHeight = height;

    ctx = context;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    points.forEach((arr, index) => {
      const [u, v] = arr[0].pos
      const x = lerp(xmargin, width - xmargin, u);
      const y = lerp(ymargin, height - ymargin, v);

      ctx.beginPath();
      arr.forEach((i) => {
        let [u, v] = i.pos
        let noise = random.noise2D(u + playhead * 1.5, v + playhead * 1.3, 2.0);
        v += noise * 0.07
        const x = lerp(xmargin, width - xmargin, u);
        const y = lerp(ymargin, height - ymargin, v);
        ctx.lineTo(x, y);
        // ctx.fillStyle = `hsl(${c}, 50%, 50%)`;
      })
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(255,255,255,${0.5 + v * 0.15})`;
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    })

    // points.forEach(({ rad, pos, color }) => {
    //   const [u, v] = pos;

    //   let noise = random.noise2D(u, v, 0.8);
    //   drawWhisp(x, y, noise, color);
    //   // drawCurl(x, y, noise, color);
    // });
  };
};

canvasSketch(sketch, settings);

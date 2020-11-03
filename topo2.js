const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [1080, 1920],
  animate: true,
  duration: 15,
  fps: 60,
};

const sketch = () => {
  // const palette = random.shuffle(random.pick(palettes)).slice(0, 2);
  const palette = ["white"];

  const bg = "black";

  const createGrid = (x) => {
    const rows = [];
    const rowCount = 60
    const colCount = 200
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

  random.setSeed(418);
  const points = createGrid(60)

  const ymargin = 400;
  const xmargin = 0;
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
        let noise = random.noise2D(u - playhead, v + playhead * 5, 2.0)
        v -= (noise * noise * noise) * .1;
        const x = lerp(xmargin, width - xmargin, u);
        const y = lerp(ymargin, height - ymargin, v);
        ctx.lineTo(x, y);
      })
      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(255,255,255,${0.5 + v * 0.15})`;
      ctx.fillStyle = "rgba(0,0,0,1)"
      // ctx.fillStyle = `hsl(${v * 255}, 100%, 40%)`;
      ctx.stroke();
      ctx.lineTo(width - xmargin, y + 1000);
      ctx.lineTo(x, y + 500);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    })

  };
};

canvasSketch(sketch, settings);

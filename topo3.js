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
    const colCount = 30
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

  const ymargin = 200;
  const xmargin = 200;
  var ctx;
  var gWidth;
  var gHeight;

  return ({ context, width, height, playhead }) => {
    // playhead = 99
    gWidth = width;
    gHeight = height;

    ctx = context;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    points.forEach((arr, index) => {
      const [u, v] = arr[0].pos
      const x = lerp(xmargin, width - xmargin, u);
      const y = lerp(ymargin, height - ymargin, v);

      arr.forEach((i, index) => {

        if (index === 0) {
          return
        }
        ctx.beginPath();

        let [fromU, fromV] = arr[index - 1].pos

        var fromX = lerp(xmargin, width - xmargin, fromU);
        var fromY = lerp(ymargin, height - ymargin, fromV);


        var fromNoise = random.noise2D(fromU - playhead, fromV + playhead * 5, 1.2);

        fromX += (fromNoise) * 50;
        fromY += (fromNoise) * 50;

        let [u, v] = i.pos

        let noise = random.noise2D(u - playhead, v + playhead * 2, 2.0)
        v -= (noise * noise) * .01;
        u -= (noise * noise) * .01;

        const x = lerp(xmargin, width - xmargin, u);
        const y = lerp(ymargin, height - ymargin, v);

        ctx.moveTo(fromX, fromY);

        let bezX1 = x - (noise * 3)
        let bezY1 = y - (noise * 3)
        let bezX2 = x + (noise * 3)
        let bezY2 = y + (noise * 3)
        ctx.bezierCurveTo(bezX1, bezY1, bezX2, bezY2, x, y);

        // ctx.lineTo(x, y);
        ctx.lineWidth = 2 + 2 * (fromNoise);
        // ctx.strokeStyle = `rgba(255,255,255,${0.5 + v * 0.15})`;
        ctx.fillStyle = "rgba(0,0,0,1)"
        ctx.strokeStyle = `hsl(${ (playhead * 400) + (v * 100) + noise  }, 100%, 50%)`
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      })

    })

  };
};

canvasSketch(sketch, settings);

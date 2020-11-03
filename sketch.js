const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [2048, 2048]
  // dimensions: "A3",
  // units: "cm",
  // pixelsPerInch: 300
};

const sketch = () => {
  // const palette = random.shuffle(random.pick(palettes)).slice(0, 2);
  const palette = ["red"];

  const bg = "#000";

  const createGrid = () => {
    const points = [];
    const xcount = 100;
    const ycount = xcount * 1.5;
    for (let x = 0; x < xcount; x++) {
      for (let y = 0; y < ycount; y++) {
        const u = xcount <= 1 ? 0.5 : x / (xcount - 1);
        const v = ycount <= 1 ? 0.5 : y / (ycount - 1);
        points.push({
          rad: 24,
          pos: [u, v],
          color: "red"
        });
      }
    }
    return points;
  };

  random.setSeed(99804);
  const points = createGrid().filter(() => random.value() < 0.125);

  const ymargin = 200;
  const xmargin = 200;
  var ctx;
  var gWidth;
  var gHeight;

  drawWhisp = (x, y, noise, color) => {
    let width = 30 + noise * 8;
    let height = 40 + noise * 4;
    ctx.save();
    ctx.beginPath();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((90 * noise * Math.PI) / 180);
    ctx.rect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  drawCurl = (x, y, noise, color) => {};

  return ({ context, width, height }) => {
    gWidth = width;
    gHeight = height;

    ctx = context;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    points.forEach(({ rad, pos, color }) => {
      const [u, v] = pos;

      console.log(u, v)

      const x = lerp(xmargin, width - xmargin, u);
      const y = lerp(ymargin, height - ymargin, v);

      let noise = random.noise2D(u, v, 0.8);
      drawWhisp(x, y, noise, color);
      // drawCurl(x, y, noise, color);
    });
  };
};

canvasSketch(sketch, settings);

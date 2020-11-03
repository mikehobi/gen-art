const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [1080, 1920],
  animate: true,
  duration: 15,
  fps: 60,
  // dimensions: [2048, 2048]
  // dimensions: "A3",
  // units: "cm",
  // pixelsPerInch: 300,

  // animate: true,
  // duration: 15,
};

const sketch = () => {
  // const palette = random.shuffle(random.pick(palettes)).slice(0, 2);
  const palette = [
    "#2F4199",
    // "#172541",
    "#22799F",
    "#C480B3",
    "#E7A922",
    "#E87C32"
  ];

  const bg = "#172541";

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
          color: random.pick(palette)
        });
      }
    }
    return points;
  };

  random.setSeed(99999999); // freq???
  // random.setSeed(55424);
  // random.setSeed(2140000000000000059);
  // random.setSeed(88888879);
  const points = createGrid().filter(() => random.value() < 0.125);
  // const points = createGrid();

  const ymargin = 20;
  const xmargin = 20;
  var ctx;
  var gWidth;
  var gHeight;

  drawWhisp = (x, y, noise, color) => {
    let width = 20 + noise * 8;
    let height = 4 + noise * 4;
    // let height = 4;
    ctx.save();
    ctx.beginPath();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((90 * noise * Math.PI) / 180);
    ctx.rect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  drawCurl = (x, y, noise, color) => {
    ctx.save();

    ctx.beginPath();

    x = x + 2 * noise;
    y = y + 2 * noise;

    ctx.translate(x, y);
    ctx.rotate((90 * noise * Math.PI) / 180);
    x = 0;
    y = 0;
    ctx.moveTo(x, y);

    let movement = 20;

    // random.setSeed(x * 1);
    let seed = x*y
    random.setSeed(seed)
    let bezX1 = x + movement * (1 - random.rangeFloor(0, 2)) * (1 + noise);
    seed += 1;
    random.setSeed(seed)
    let bezY1 = y + movement * (1 - random.rangeFloor(0, 2)) * (1 + noise);
    seed += 1;
    random.setSeed(seed)
    let bezX2 = bezX1 + movement * (1 - random.rangeFloor(0, 2)) * (1 + noise);
    seed += 1;
    random.setSeed(seed)
    let bezY2 = bezY1 + movement * (1 - random.rangeFloor(0, 2)) * (1 + noise);
    seed += 1;
    random.setSeed(seed)
    let endX = bezX2 + movement * (1 - random.rangeFloor(0, 2)) * (1 + noise);
    seed += 1;
    random.setSeed(seed)
    let endY = y + movement * (1 - random.rangeFloor(0, 2)) * (1 + noise);

    ctx.bezierCurveTo(bezX1, bezY1, bezX2, bezY2, endX, endY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };

  // drawSquare = (x, y, noise, color) => {
  //   let width = 100 + noise * 10;
  //   let height = 3 + noise * 5;
  //   // let height = 4;
  //   ctx.save();
  //   ctx.beginPath();
  //   ctx.translate(x + width / 2, y + height / 2);
  //   ctx.rotate((360 * noise * Math.PI) / 180);
  //   ctx.rect(0, 0, width, height);

  //   ctx.fillStyle = color;
  //   ctx.fill();
  //   ctx.restore();
  // };

  // drawSquare = (x, y, noise, color) => {
  //   let width = 10 * noise;
  //   ctx.save();
  //   ctx.beginPath();
  //   ctx.translate(x + width / 2, y + width / 2);
  //   ctx.rotate((360 * noise * Math.PI) / 180);
  //   ctx.rect(random.gaussian(), random.gaussian(), width, width);

  //   ctx.fillStyle = color;
  //   ctx.fill();
  //   ctx.restore();
  // };

  return ({ context, width, height, playhead }) => {
    gWidth = width;
    gHeight = height;

    ctx = context;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    points.forEach(({ rad, pos, color }) => {
      const [u, v] = pos;

      const x = lerp(xmargin, width - xmargin, u);
      const y = lerp(ymargin, height - ymargin, v);

      let noise = random.noise2D(u, v + playhead * 9, 0.1);
      // drawWhisp(x, y, noise, color);
      drawCurl(x, y, noise, color);
    });
  };
};

canvasSketch(sketch, settings);

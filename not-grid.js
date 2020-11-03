const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  // const palette = random.shuffle(random.pick(palettes)).slice(0, 2);
  const palette = [
    "#000",
    "#111",
    "#222",
    // "#2F4199"
    // "#172541"
    // "#22799F"
    // "#C480B3"
    "#E7A922",
    "#E87C32"
  ];

  const gridSize = 1000;

  const createGrid = () => {
    const points = [];
    const count = 2000;
    for (let x = 0; x < count; x++) {
      //   for (let y = 0; y < count; y++) {
      let x1 = random.rangeFloor(0, gridSize);
      let y1 = random.rangeFloor(1, gridSize);

      let x2 = random.rangeFloor(0, gridSize);
      let y2 = random.rangeFloor(0, gridSize);

      // let y1 = random.range(0, 1);

      // const u = count <= 1 ? 0.5 : x / (count - 1);
      // const v = count <= 1 ? 0.5 : y / (count - 1);
      // const radius = 5.0 + Math.abs(random.noise2D(u, v, 0.1)) * 10.0;
      points.push({
        point1: [x1, y1],
        point2: [x2, y2],
        color: random.pick(palette)
      });
      //   }
    }
    return points;
  };

  // random.setSeed(443);
  const points = createGrid().filter(() => random.value() < 0.75);

  const margin = 200;

  function diff(num1, num2) {
    if (num1 > num2) {
      return num1 - num2;
    } else {
      return num2 - num1;
    }
  }

  function mean(num1, num2) {
    return (num1 + num2) / 2;
  }

  drawCircle = (context, x, y, radius, color) => {
    if (radius < 0) {
      return;
    }
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.fill();
  };

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    let sortedPoints = points.sort(
      (a, b) => mean(a.point1[1], a.point2[1]) - mean(b.point1[1], b.point2[1])
    );

    points.forEach(({ point1, point2, color }) => {
      let [x1, y1] = point1;
      let [x2, y2] = point2;

      x1 = lerp(margin, width - margin, x1 / (gridSize - 1));
      y1 = lerp(margin, height - margin, y1 / (gridSize - 1));

      x2 = lerp(margin, width - margin, x2 / (gridSize - 1));
      y2 = lerp(margin, height - margin, y2 / (gridSize - 1));

      endY = lerp(margin, height - margin, 1);

      context.fillStyle = color;
      context.strokeStyle = "white";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x2, endY);
      context.lineTo(x1, endY);
      context.lineTo(x1, y1);
      //   context.stroke();
      context.fill();
      context.closePath();

      // drawCircle(context, x, y, rad, color);
      //   context.save();
      //   context.fillStyle = color;
      //   context.font = `${rad * width * 0.01}px "Helvetica"`;
      //   context.translate(x, y);
      //   context.rotate(rad * 0.33);
      //   context.fillText("!", 0, 0);
      //   context.restore();
    });
  };
};

canvasSketch(sketch, settings);

const canvasSketch = require("canvas-sketch");

const { lerp } = require("canvas-sketch-util/math");
const { setSeed, noise2D } = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
};

const x = 100;
const y = 100;
const z = 700;

const SEED = {
  HORSE: 2,
  SQUIGS: 5,
  FLOAT: 9,
  GOOD: 1113,
};

function test_prime(n) {
  if (n === 1) {
    return false;
  } else if (n === 2) {
    return true;
  } else {
    for (var x = 2; x < n; x++) {
      if (n % x === 0) {
        return false;
      }
    }
    return true;
  }
}

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    let center = {
      x: width / 2,
      y: height / 2,
    };

    // setSeed(SEED.HORSE);

    // setSeed(1113);

    context.translate(center.x, center.y);
    // context.translate(50, 50)
    for (let i = 0; i < z; i++) {
      context.strokeStyle = "black";
      //   context.rotate(
      //     i * (3.14 / 0.01)
      //     // (noise2D(center.x + i, center.y + i, 0.3 * 1.0, 10000.0) * 360) / 180
      //   );
      context.rotate(1 * 0.1);
      context.translate(0, i * 0.1);

      context.lineTo(0, 0);
      context.stroke();
    }
  };
};

canvasSketch(sketch, settings);

const canvasSketch = require("canvas-sketch");

const { lerp } = require("canvas-sketch-util/math");
const { setSeed, noise2D } = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
};

const x = 100;
const y = 100;
const z = 100;

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
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    // for (let u = 0; u < x; u++) {
    //   for (let v = 0; v < y; v++) {
    //     const pos = {
    //       x: lerp(0, width, u / x),
    //       y: lerp(0, height, v / y),
    //     }
    //     context.fillStyle = 'white';
    //     context.fillRect(pos.x, pos.y, 4, 4);
    //   }
    // }

    // let current = 0

    // function getRotation(asdf) {
    //   switch (asdf) {
    //     case 0:
    //     case 1:
    //     case 2:
    //     case 3:
    //   }
    // }

    let center = {
      x: width / 2,
      y: height / 2,
    };

    // setSeed(SEED.HORSE);

    setSeed(1113);

    context.translate(center.x, center.y);
    // context.translate(50, 50)
    for (let i = 0; i < z; i++) {
      //   if (test_prime(i)) {
      //     continue;
      //   }

      context.strokeStyle = "white";
      //   context.rotate(
      //     (noise2D(center.x + i, center.y + i, 10000, 0.5) * 360) / 180
      //   );
      context.rotate(i * 0.01);
      //   context.translate(0, i * 0.1);
      context.translate(0, 100 * (i / 10));
      context.lineTo(0, 0);
      context.stroke();
    }
  };
};

canvasSketch(sketch, settings);

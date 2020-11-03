const canvasSketch = require("canvas-sketch");

const { lerp } = require("canvas-sketch-util/math");
const { noise2D } = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
};

const x = 100;
const y = 100;
const z = 1000;

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
    context.fillStyle = "blue";
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
    context.strokeStyle = "white";
    context.translate(center.x, center.y);
    // context.translate(50, 50)
    for (let i = 0; i < z; i++) {
      context.strokeStyle = "white";
      // context.translate(center.x + (i * 5), center.y + (i * 5))
      if (test_prime(i)) {
        //context.rotate(90 * Math.PI / 180 + (noise2D(center.x + i, center.y + i) * 0.35))
        context.rotate((noise2D(center.x + i, center.y + i, 0.1) * 360) / 180);
      }
      context.translate(0, i * 0.005);
      context.lineTo(0, 0);
      // var inc = 10
      // var x = center.x + (i * inc)
      // var y = center.y + (i * inc)
      // var mod = i % 2 == 0 ? -1 : 1
      // if (test_prime(i)) {
      //   x = center.x + (inc * i)
      // }
      // else {
      //   y = center.y + (inc * i)
      // }
      // context.lineTo(x,y)
      context.stroke();
    }
  };
};

canvasSketch(sketch, settings);

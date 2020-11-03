const canvasSketch = require("canvas-sketch");

const { lerp } = require("canvas-sketch-util/math");
const { setSeed, noise2D } = require("canvas-sketch-util/random");

const settings = {
  // dimensions: [2048, 2048],
  dimensions: [1024, 1024],
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
    // setSeed(11130) //2048x2048
    // setSeed(111); // 1024
    
    setSeed(1999999)
    // setSeed(8)

    context.translate(center.x + 100, center.y - 100);
    for (let i = 0; i < z; i++) {
      let p = noise2D(center.x + i, center.y + i, 100.0, 1.0)
      let deg = p * 3600000000
      context.strokeStyle = "white";
      context.rotate(deg);
      context.translate(0, i);

      let p2 = noise2D(center.x + i * i, center.y + i * i, i * 10000, 10.0)
      context.translate(p2, 0)

      context.lineTo(0, 0);
      context.stroke();
      context.rotate(-deg);
    }



  };
  
};

canvasSketch(sketch, settings);

const canvasSketch = require('canvas-sketch');

const { lerp } = require('canvas-sketch-util/math');
const { setSeed, noise2D } = require('canvas-sketch-util/random');

const settings = {
  animate: true,
  duration: 3,
  dimensions: [ 2048, 2048 ]
};

const x = 100
const y = 100
const z = 500

function test_prime(n)
{

  if (n===1)
  {
    return false;
  }
  else if(n === 2)
  {
    return true;
  }else
  {
    for(var x = 2; x < n; x++)
    {
      if(n % x === 0)
      {
        return false;
      }
    }
    return true;  
  }
}


const sketch = () => {
  return ({ context, width, height, playhead }) => {
    context.fillStyle = 'black';
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
    }
    setSeed(2)
    context.translate(center.x, center.y)
    // context.translate(50, 50)
    for (let i = 0; i < z; i++) {
      context.strokeStyle = 'white';
      context.rotate(noise2D(center.x + i, center.y + i, 0.03 * playhead * 20.0, 10.0) * 360 / 180)
      context.translate(0, i * 0.5)
      context.lineTo(0, 0)
      context.stroke()
    }

  };
};

canvasSketch(sketch, settings);

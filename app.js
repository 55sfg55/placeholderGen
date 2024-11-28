const express = require('express');
const { createCanvas } = require('canvas');
const color = require('color');

const app = express();
const port = 3300;

function parseColor(colorString) {
  try {
    if (/^[a-fA-F0-9]{6}$/.test(colorString)) {
      colorString = `#${colorString}`;
    }
    return colorString ? color(colorString).hex() : color("white").hex();
  } catch (e) {
    return null;
  }
}

function drawLine(ctx, startX, startY, endX, endY, color = '#000', lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

app.get('/image/:dimensions?/:color?', (req, res) => {

  console.log('\n\n\n')
  console.time('response')

  console.time('params')
  const { dimensions, color } = req.params;
  console.timeEnd('params')

  console.time('Parse Dimensions');
  const [width, height] = dimensions.split('x').map(Number);
  console.timeEnd('Parse Dimensions');

  console.time('err400')
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return res.status(400).send('Invalid dimensions. Please provide valid width and height in the format WIDTHxHEIGHT (e.g. /image/300x200).');
  }
  console.timeEnd('err400')

  console.time('Parse Color');
  const parsedColor = parseColor(color);
  console.timeEnd('Parse Color');

  console.time('err400no2')
  if (!parsedColor) {
    return res.status(400).send('Invalid color. Please provide a valid color name (e.g. red), HEX (e.g. ff0000), or RGB (e.g. rgb(255, 0, 0)).');
  }
  console.timeEnd('err400no2')

  console.time('Canvas Creation');
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  console.timeEnd('Canvas Creation');

  console.time('Fill Background');
  ctx.fillStyle = parsedColor;
  ctx.fillRect(0, 0, width, height);
  console.timeEnd('Fill Background');

  const text = `${width}x${height}`;

  console.time('Draw Text');
  ctx.fillStyle = '#000';
  ctx.font = `${text.length * 0.6 * Math.min(height, width) / 33}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  console.timeEnd('Draw Text');

  // Benchmarking line 
  console.time('lineWidth')
  const lineWidth = (width / 5) * (0.5 + height / width) * 0.5 / 50;
  console.timeEnd('lineWidth')

  console.time('Draw Lines');
  drawLine(ctx, width * 0.01, height - height * 0.01, width - width * 0.01, height - height * 0.01, '#000', lineWidth);
  drawLine(ctx, width * 0.01, height * 0.01, width - width * 0.01, height * 0.01, '#000', lineWidth);
  drawLine(ctx, width * 0.01, height - height * 0.01, width * 0.01, height * 0.01, '#000', lineWidth);
  drawLine(ctx, width - width * 0.01, height * 0.01, width - width * 0.01, height - height * 0.01, '#000', lineWidth);
  drawLine(ctx, width * 0.01, height - height * 0.01, width - width * 0.01, height * 0.01, '#000', lineWidth);
  drawLine(ctx, width * 0.01, height * 0.01, width - width * 0.01, height - height * 0.01, '#000', lineWidth);
  console.timeEnd('Draw Lines');

//   console.time('Buffer Creation'); 
//   canvas.toBuffer((err, buffer) => {
//     if (err) {
//       res.status(500).send('Error generating image.');
//       return;
//     }
//     console.timeEnd('Buffer Creation'); 

    // res.setHeader('Content-Type', 'image/png');
    // res.send(buffer);

    // console.time('Stream Image');
    // res.setHeader('Content-Type', 'image/png');
    // canvas.createPNGStream().pipe(res);
    // console.timeEnd('Stream Image');

    // console.time('Stream Image');
    // res.setHeader('Content-Type', 'image/png');
    // const pngStream = canvas.createPNGStream();
    // pipeline(pngStream, res, (err) => {
    //     console.timeEnd('Stream Image');
    //     console.timeEnd('response')
    // if (err) {
    //     console.error('Stream error:', err);
    //     res.status(500).send('Error streaming the image');
    // }
    // });
    
    console.time('Buffer Creation');
    canvas.toBuffer((err, buffer) => {
        if (err) {
        res.status(500).send('Error generating image.');
        return;
        }
        console.timeEnd('Buffer Creation');

        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
        console.timeEnd('response');
    }, 'image/png', {compressionLevel: 4});

    // res.send("test")
});



app.get('/', (req, res) => {
  res.send('Welcome to the placeholder generator!');
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});

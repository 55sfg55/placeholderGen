const express = require('express');
const { createCanvas } = require('canvas');
const color = require('color');
const sharp = require('sharp'); 

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

function drawLine(ctx, startX, startY, endX, endY, color, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawEmptyRectangle(ctx, x, y, width, height, color, lineWidth = 1) {
  ctx.strokeStyle = color; 
  ctx.lineWidth = lineWidth;  
  ctx.strokeRect(x, y, width, height);  
}

function lightenColor(colorString, procent) {
  procent /= 100
  try {
    let parsedColor = color(colorString);
    console.log(parsedColor)

    if (parseColor.isBlack()) {
      return '#404040'
    }

    return parsedColor ? parsedColor.lighten(procent).hex() : color("black").lighten(procent).hex();
  } catch (e) {

    console.error('Invalid color string:', colorString);
    return '#404040'
  }
}

function getBrightness(colorString) {
  try {
    const parsedColor = color(colorString);
    const rgb = parsedColor.rgb().array(); 

    const brightness = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];

    return brightness; 
  } catch (e) {
    console.error('Error calculating brightness:', e);
    return 0; 
  }
}

app.get('/image/:dimensions?/:color?', (req, res) => {
  // params to add: brighten the lines (% e.g. 20), text color, invert color (automatc true if below 20% brightness), change the background color handling, disable text/lines, own text

  console.log('\n\n\n');
  console.time('response');

  console.time('params');
  const { dimensions, color } = req.params;
  console.timeEnd('params');

  console.time('Parse Dimensions');
  const [width, height] = dimensions.split('x').map(Number);
  console.timeEnd('Parse Dimensions');

  console.time('err400');
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return res.status(400).send('Invalid dimensions. Please provide valid width and height in the format WIDTHxHEIGHT (e.g. /image/300x200).');
  }
  console.timeEnd('err400');

  console.time('Parse Color');
  const parsedColor = parseColor(color);
  console.timeEnd('Parse Color');

  console.time('err400no2');
  if (!parsedColor) {
    return res.status(400).send('Invalid color. Please provide a valid color name (e.g. red), HEX (e.g. ff0000), or RGB (e.g. rgb(255, 0, 0)).');
  }
  console.timeEnd('err400no2');

  console.time('Canvas Creation');
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  console.timeEnd('Canvas Creation');

  console.time('Fill Background');
  ctx.fillStyle = parsedColor;
  ctx.fillRect(0, 0, width, height);
  console.timeEnd('Fill Background');

  const text = `${width}x${height}`;

  const lineWidth = (width / 5) * (0.5 + height / width) * 0.5 / 50;
  const brighterColor = lightenColor('#000', 25);
  console.timeEnd('line Width and color');

  console.time('Draw Lines');
  // drawLine(ctx, width * 0.01, height - height * 0.01, width - width * 0.01, height - height * 0.01, '#000', lineWidth);
  // drawLine(ctx, width * 0.01, height * 0.01, width - width * 0.01, height * 0.01, '#000', lineWidth);
  // drawLine(ctx, width * 0.01, height - height * 0.01, width * 0.01, height * 0.01, '#000', lineWidth);
  // drawLine(ctx, width - width * 0.01, height * 0.01, width - width * 0.01, height - height * 0.01, '#000', lineWidth);
  drawLine(ctx, width * 0.01, height - height * 0.01, width - width * 0.01, height * 0.01, brighterColor, lineWidth);
  drawLine(ctx, width * 0.01, height * 0.01, width - width * 0.01, height - height * 0.01, brighterColor, lineWidth);
  drawEmptyRectangle(ctx, width * 0.01, height * 0.01, width * 0.98, height * 0.98, brighterColor, lineWidth);
  console.timeEnd('Draw Lines');

  console.time('Draw Text');
  
  console.time('line Width and color');

  // If background color's brightness is 20% or below use white text color
  if (getBrightness(parsedColor) <= 256 * 0.2) {
    ctx.fillStyle = '#ffffff'
  }
  else {
    ctx.fillStyle = '#000';
  }
  ctx.font = `${text.length * 0.6 * Math.min(height, width) / 33}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height * 0.487);
  console.timeEnd('Draw Text');

  console.time('Buffer Creation (canvas)');

  const rawBuffer = canvas.toBuffer('raw');
  console.timeEnd('Buffer Creation (canvas)');

  let compressionLevel;
  if ( width <= 800 && height <= 800 ) {
    compressionLevel = 1
  }
  else if ( width <= 8000 && height <= 8000 ) {
    compressionLevel = 2
  }
  else {
    compressionLevel = 4
  }

  console.time("Buffer Creation (sharp)")

  sharp(rawBuffer, {
    raw: {
      width: width,
      height: height,
      channels: 4, 
    }
  })
    .png({ compressionLevel: compressionLevel })
    .toBuffer()
    .then((outputBuffer) => {
      console.timeEnd("Buffer Creation (sharp)")
      console.timeEnd('response');

      res.setHeader('Content-Type', 'image/png');
      res.send(outputBuffer);
    })
    .catch((err) => {
      console.error('Error generating image:', err);
      res.status(500).send('Error generating image.');
    });
});

app.get('/', (req, res) => {
  res.send('Welcome to the placeholder generator!');
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});

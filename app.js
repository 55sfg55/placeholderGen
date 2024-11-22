const express = require('express');
const { createCanvas } = require('canvas');
const color = require('color');

const app = express();
const port = 3300;

function parseColor(colorString) {
  try {
    // http://127.0.0.1:3300/image/300x500/ffff00
    if (/^[a-fA-F0-9]{6}$/.test(colorString)) {
      colorString = `#${colorString}`;
    }
    if (colorString === undefined) {
        return color("white").hex();
    }
    
    return color(colorString).hex();
  } catch (e) {
    return null; 
  }
}

// function drawLine(ctx, startX, startY, endX, endY, color = '#000', lineWidth = 1) {
//     ctx.beginPath(); 
//     ctx.moveTo(startX, startY); 
//     ctx.lineTo(endX, endY); 
//     ctx.strokeStyle = color; 
//     ctx.lineWidth = lineWidth; 
//     ctx.stroke(); 
//   }

app.get('/image/:dimensions?/:color?', (req, res) => {
  const { dimensions, color } = req.params;

  const [width, height] = dimensions.split('x').map(Number);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return res.status(400).send('Invalid dimensions. Please provide valid width and height in the format WIDTHxHEIGHT (e.g. /image/300x200).');
  }

  const parsedColor = parseColor(color);
  if (!parsedColor) {
    return res.status(400).send('Invalid color. Please provide a valid color name (e.g. red), HEX (e.g. ff0000), or RGB (e.g. rgb(255, 0, 0)).');
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = parsedColor;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#000';
  ctx.font = `${width/5*(0.5+height/width)*0.5}px Arial`
  const text = `${width}x${height}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

//   const lineWidth = width/5*(0.5+height/width)*0.5/50

//   drawLine(ctx, width * 0.01, height-height*0.01, width*0.1, height-height*0.1, '#000', lineWidth)
//   drawLine(ctx, width * 0.01, height-height*0.01, width*0.1, height-height*0.01, '#000', lineWidth)
//   drawLine(ctx, width * 0.01, height-height*0.01, width*0.01, height-height*0.1, '#000', lineWidth)

//   drawLine(ctx, width * 0.01, height*0.01, width*0.1, height*0.1, '#000', lineWidth)
//   drawLine(ctx, width * 0.01, height*0.01, width*0.1, height*0.01, '#000', lineWidth)
//   drawLine(ctx, width * 0.01, height*0.01, width*0.01, height*0.1, '#000', lineWidth)

//   drawLine(ctx, width-width * 0.01, height-height*0.01, width-width*0.1, height-height*0.1, '#000', lineWidth)
//   drawLine(ctx, width-width * 0.01, height-height*0.01, width-width*0.1, height-height*0.01, '#000', lineWidth)
//   drawLine(ctx, width-width * 0.01, height-height*0.01, width-width*0.01, height-height*0.1, '#000', lineWidth)
  
//   drawLine(ctx, width-width * 0.01, height*0.01, width-width*0.1, height*0.1, '#000', lineWidth)
//   drawLine(ctx, width-width * 0.01, height*0.01, width-width*0.1, height*0.01, '#000', lineWidth)
//   drawLine(ctx, width-width * 0.01, height*0.01, width-width*0.01, height*0.1, '#000', lineWidth)

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer());
});

app.get('/', (req, res) => {
  res.send('Welcome to the placeholder generator!');
});

app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});

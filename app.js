const express = require('express')
const { createCanvas } = require('canvas')

const app = express()
const port = 3300

app.get('/image/:dimensions?/:color?', (req, res) => {
    const { dimensions } = req.params;

    console.log(dimensions)

    const [ width, height ] = dimensions.split('x').map(Number);

    if ( isNaN(width) || isNaN(height) || width <= 0 || height <= 0 ) {
        return res.status(400).send('Invalid dimensions. Please provide valid width and height in the format WIDTHxHEIGHT (e.g. /image/300x200).');
    }
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#d3d3d3';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${width}x${height}`, width / 2, height / 2);

    res.setHeader('Content-Type', 'image/png');
    res.send( canvas.toBuffer() );
})

app.get('/', (req, res) => {
    res.send('Welcome to placegolden generator!')
})

app.listen(port, () => {
    console.log(`Server is crashing at http://127.0.0.1:${port}`)
})
import fs from 'fs';

const svg = fs.readFileSync('c:/Users/adibw/libra/publisher-icon.svg', 'utf8');
console.log('SVG Length:', svg.length);
console.log('SVG snippet start:', svg.substring(0, 400));
console.log('SVG snippet end:', svg.substring(svg.length - 400));

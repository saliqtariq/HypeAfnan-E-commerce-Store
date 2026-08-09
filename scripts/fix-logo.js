const sharp = require('sharp');

const size = 962;
const mask = Buffer.from(
  '<svg width="962" height="962"><circle cx="481" cy="481" r="481" fill="white"/></svg>'
);

sharp('public/images/hypeafnancircularlogopic.png')
  .extract({ left: 37, top: 209, width: size, height: size })
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toFile('public/images/hypeafnancircularlogopic_fixed.png')
  .then(info => {
    console.log('Done:', info);
  })
  .catch(err => {
    console.error('Error:', err);
  });

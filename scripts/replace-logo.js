const sharp = require('sharp');
const fs = require('fs');

sharp('public/images/hypeafnancircularlogopic_fixed.png')
  .toFile('public/images/hypeafnancircularlogopic.png')
  .then(info => {
    // clean up temp file
    fs.unlinkSync('public/images/hypeafnancircularlogopic_fixed.png');
    fs.unlinkSync('public/images/hypeafnancircularlogopic_trimmed.png');
    fs.unlinkSync('public/images/hypeafnancircularlogopic_clean.png');
    console.log('Logo replaced successfully:', info);
  })
  .catch(err => console.error(err));

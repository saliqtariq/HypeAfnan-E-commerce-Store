const https = require('https');
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({ hostname: u.hostname, path: u.pathname + u.search, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'identity' }, timeout: 15000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
fetchHtml('https://aristide.x.yupoo.com/albums/250432049?uid=1').then(html => {
  console.log('HTML length: ' + html.length);
  const m1 = html.match(/data-src="(https?:\/\/photo\.yupoo\.com[^"]+\.jpeg)"/g);
  console.log('data-src matches: ' + (m1 ? m1.length : 0));
  if (m1) console.log('sample: ' + m1[0]);
  // look for any yupoo image URL pattern
  const m3 = html.match(/photo\.yupoo\.com\/aristide\/[a-z0-9]+\/[a-z]+\.jpeg/g);
  console.log('Any yupoo URLs: ' + (m3 ? m3.length : 0));
  if (m3) console.log('sample: ' + m3[0]);
  // Check for JSON embedded images
  const photoMatch = html.match(/"path"\s*:\s*"([^"]+photo\.yupoo[^"]+)"/g);
  console.log('JSON path matches: ' + (photoMatch ? photoMatch.length : 0));
  if (photoMatch) console.log('sample: ' + photoMatch[0]);
  // save first 3000 chars
  const fs = require('fs');
  fs.writeFileSync('scratch_0img_album.html', html.slice(0, 10000));
  console.log('Saved first 10000 chars');
}).catch(function(e) { console.error(e.message); });

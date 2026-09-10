import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const highlightUrl = "https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MTQ5MTE3MDY1NTQzMDI5?story_media_id=3982007014217260507&stkn=M2FtaGdmMzdmajBi";
const downloadDir = path.join(process.cwd(), 'public', 'images', 'payments');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  const downloadedUrls = new Set();
  let imgIndex = 0;

  page.on('response', async (res) => {
    try {
      const url = res.url();
      const status = res.status();
      const ct = res.headers()['content-type'] || '';
      
      if (
        status === 200 &&
        (url.includes('cdninstagram.com') || url.includes('fbcdn.net')) &&
        (ct.startsWith('image/') || url.includes('.jpg') || url.includes('.webp')) &&
        !url.includes('150x150') && !url.includes('profile') && !url.includes('static')
      ) {
        if (!downloadedUrls.has(url)) {
          downloadedUrls.add(url);
          const buf = await res.buffer();
          if (buf.length > 15000) {
            imgIndex++;
            const filename = `payment_${String(imgIndex).padStart(2, '0')}.jpg`;
            fs.writeFileSync(path.join(downloadDir, filename), buf);
            console.log(`[Captured #${imgIndex}] Saved: ${filename} (${(buf.length/1024).toFixed(1)} KB)`);
          }
        }
      }
    } catch(err) {}
  });

  console.log('Navigating to highlight URL...');
  try {
    await page.goto(highlightUrl, { waitUntil: 'load', timeout: 45000 });
  } catch (e) {
    console.log('Page navigation note:', e.message);
  }
  
  await new Promise(r => setTimeout(r, 6000));

  console.log('Stepping through stories...');
  for (let i = 0; i < 70; i++) {
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`Finished! Total images saved: ${imgIndex}`);
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
}

run().catch(console.error);

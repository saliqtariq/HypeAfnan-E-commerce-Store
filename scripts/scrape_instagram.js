const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const highlightUrl = "https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MTQ5MTE3MDY1NTQzMDI5?story_media_id=3982007014217260507&stkn=M2FtaGdmMzdmajBi";
const downloadDir = path.join(__dirname, 'public', 'images', 'payments_highlight');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  
  // Try to bypass basic detection
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log(`Navigating to ${highlightUrl}`);
  await page.goto(highlightUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait a bit for the first story to load or login prompt
  await new Promise(r => setTimeout(r, 5000));

  console.log('Checking for login prompt or story image...');
  
  const imageUrls = new Set();
  let attempts = 0;
  const maxStories = 60; // Saftey limit

  while (attempts < maxStories) {
    try {
      // Find the story image. Instagram uses various classes, usually it's an img inside a specific section
      const imgUrl = await page.evaluate(() => {
        // Look for typical story image selectors or just large images
        const imgs = Array.from(document.querySelectorAll('img'));
        // Filter for likely story images (often have specific query params or are large)
        const storyImg = imgs.find(img => img.src.includes('scontent') && (img.width > 200 || img.height > 200));
        return storyImg ? storyImg.src : null;
      });

      if (imgUrl) {
        if (!imageUrls.has(imgUrl)) {
          console.log(`Found new image: ${imgUrl.substring(0, 50)}...`);
          imageUrls.add(imgUrl);
          
          // Download it
          const filename = `payment_${imageUrls.size}.jpg`;
          const filepath = path.join(downloadDir, filename);
          try {
             await downloadImage(imgUrl, filepath);
             console.log(`Downloaded: ${filename}`);
          } catch(e) {
             console.error(`Failed to download ${imgUrl}`, e);
          }
        }
      } else {
          console.log('No story image found on current slide.');
      }

      // Try to click the "next" button (usually right side of screen in stories)
      // We can simulate a right arrow key press to go to next story
      await page.keyboard.press('ArrowRight');
      await new Promise(r => setTimeout(r, 2000)); // Wait for transition and load
      
      attempts++;

    } catch (error) {
      console.error('Error during extraction loop:', error.message);
      break;
    }
  }

  console.log(`Finished extracting. Total unique images found: ${imageUrls.size}`);
  await browser.close();
}

run().catch(console.error);

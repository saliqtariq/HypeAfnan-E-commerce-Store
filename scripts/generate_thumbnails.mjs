import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const videosDir = path.join(process.cwd(), 'public/dispatched');
const files = [
  'app/data/products.json',
  'app/data/products_index.json',
  'app/data/products_local.json',
];

const mp4Files = fs.readdirSync(videosDir)
  .filter(f => f.toLowerCase().endsWith('.mp4'));

console.log(`Found ${mp4Files.length} video files`);

// 1. Generate JPG for each video
mp4Files.forEach((file) => {
  const videoPath = path.join(videosDir, file);
  const jpgName = file.replace('.mp4', '.jpg');
  const jpgPath = path.join(videosDir, jpgName);

  if (!fs.existsSync(jpgPath)) {
    console.log(`Generating thumbnail for ${file}...`);
    try {
      // Extract a frame from the middle of the video. 
      // We seek to 00:00:01 (1 second in) or similar. Since these are short whatsapp videos, 1s is usually safe.
      execSync(`"${ffmpegPath}" -ss 00:00:01.00 -i "${videoPath}" -vframes 1 -q:v 2 "${jpgPath}" -y`, { stdio: 'ignore' });
    } catch (e) {
      console.error(`Error generating thumbnail for ${file}`);
    }
  }
});

console.log('Thumbnails generated.');

// 2. Update JSON files
for (const relFile of files) {
  const filePath = path.join(process.cwd(), relFile);
  if (!fs.existsSync(filePath)) continue;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  let updatedCount = 0;
  data.products = data.products.map(p => {
    if (!p.id || !p.id.startsWith('dispatched_video_')) return p;

    // Change coverImage and imageUrl to point to the .jpg
    // But ensure the .mp4 remains in images array for the detail page gallery
    
    let currentCover = p.coverImage || '';
    if (currentCover.endsWith('.mp4')) {
      const newCover = currentCover.replace('.mp4', '.jpg');
      
      updatedCount++;
      return {
        ...p,
        coverImage: newCover,
        imageUrl: newCover,
        images: [...(p.images || [])]
      };
    }
    return p;
  });

  if (updatedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${updatedCount} products in ${relFile}`);
  }
}

console.log('\nAll done!');

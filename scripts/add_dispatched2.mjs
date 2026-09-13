import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIDEOS_DIR = path.join(__dirname, '../public/Dispatched Part 2');
const PRODUCTS_INDEX_FILE = path.join(__dirname, '../app/data/products_index.json');
const PRODUCTS_FILE = path.join(__dirname, '../app/data/products.json');
const PRODUCT_TAGS_FILE = path.join(__dirname, '../app/data/product_tags.json');
const CATEGORIES_FILE = path.join(__dirname, '../app/data/categories.json');

async function main() {
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.error("Directory not found:", VIDEOS_DIR);
    return;
  }

  const mp4Files = fs.readdirSync(VIDEOS_DIR).filter(f => f.toLowerCase().endsWith('.mp4'));
  console.log(`Found ${mp4Files.length} video files in Dispatched Part 2.`);

  // 1. Generate JPG for each video
  mp4Files.forEach((file) => {
    const videoPath = path.join(VIDEOS_DIR, file);
    const jpgName = file.replace(/\.mp4$/i, '.jpg');
    const jpgPath = path.join(VIDEOS_DIR, jpgName);

    if (!fs.existsSync(jpgPath)) {
      console.log(`Generating thumbnail for ${file}...`);
      try {
        execSync(`"${ffmpegPath}" -ss 00:00:01.00 -i "${videoPath}" -vframes 1 -q:v 2 "${jpgPath}" -y`, { stdio: 'ignore' });
      } catch (e) {
        console.error(`Error generating thumbnail for ${file}`);
      }
    }
  });

  console.log('Thumbnails generation complete.');

  // 2. Add to data files
  const indexData = JSON.parse(fs.readFileSync(PRODUCTS_INDEX_FILE, 'utf-8'));
  const fullData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  const productTagsMap = JSON.parse(fs.readFileSync(PRODUCT_TAGS_FILE, 'utf-8'));
  const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));

  let addedCount = 0;
  for (let i = 0; i < mp4Files.length; i++) {
    const file = mp4Files[i];
    const timestamp = Date.now() + i;
    const goodsId = `dispatched_video_part2_${timestamp}_${i}`;
    
    // Skip if already added (unlikely with this timestamp logic, but just in case we re-run and want to be idempotent based on filename)
    // Actually we don't have filename in DB, so let's just add all. 
    // Wait, let's check if the file is already linked somehow. 
    const videoPathWeb = `/Dispatched Part 2/${encodeURIComponent(file)}`;
    const jpgPathWeb = `/Dispatched Part 2/${encodeURIComponent(file.replace(/\.mp4$/i, '.jpg'))}`;

    if (fullData.products.some(p => p.images && p.images.includes(videoPathWeb))) {
      console.log(`Skipping already added: ${file}`);
      continue;
    }

    const title = `HypeAfnan Dispatch Part 2 #${i + 1}`;

    const indexProduct = {
      id: goodsId,
      goodsId: goodsId,
      title: title,
      searchCode: `DISP_P2_${String(i + 1).padStart(3, '0')}`,
      coverImage: jpgPathWeb,
      tagId: 999903,
      tagName: "Dispatched",
      groupName: "Shipment Records",
      _source: "local"
    };

    const fullProduct = {
      ...indexProduct,
      name: title,
      imageUrl: jpgPathWeb,
      images: [videoPathWeb],
      shopId: "dispatched",
      link: "",
      timestamp: timestamp,
      category: "Dispatched",
      createdAt: new Date().toISOString()
    };

    indexData.products.unshift(indexProduct);
    fullData.products.unshift(fullProduct);
    productTagsMap[goodsId] = [999903];
    addedCount++;
  }

  if (addedCount > 0) {
    fs.writeFileSync(PRODUCTS_INDEX_FILE, JSON.stringify(indexData, null, 2));
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(fullData, null, 2));
    fs.writeFileSync(PRODUCT_TAGS_FILE, JSON.stringify(productTagsMap, null, 2));
    console.log(`Added ${addedCount} dispatched products to JSON files.`);

    // Update item counts in categories
    const tagCounts = {};
    for (const tags of Object.values(productTagsMap)) {
      for (const tagId of tags) {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
      }
    }
    for (const group of categories) {
      if (group.tags) {
        for (const tag of group.tags) {
          const count = tagCounts[tag.tagId] || 0;
          tag.itemCount = count;
        }
      }
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
    console.log("Updated category counts.");
  } else {
    console.log('No new dispatched products added (all already exist).');
  }
}

main().catch(console.error);

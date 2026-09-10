import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAYMENTS_DIR = path.join(__dirname, '../public/Payments');
const PRODUCTS_INDEX_FILE = path.join(__dirname, '../app/data/products_index.json');
const PRODUCTS_FILE = path.join(__dirname, '../app/data/products.json');
const PRODUCT_TAGS_FILE = path.join(__dirname, '../app/data/product_tags.json');
const CATEGORIES_FILE = path.join(__dirname, '../app/data/categories.json');

async function main() {
  const files = fs.readdirSync(PAYMENTS_DIR).filter(f =>
    f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')
  );
  console.log(`Found ${files.length} payment images.`);

  const indexData = JSON.parse(fs.readFileSync(PRODUCTS_INDEX_FILE, 'utf-8'));
  const fullData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  const productTagsMap = JSON.parse(fs.readFileSync(PRODUCT_TAGS_FILE, 'utf-8'));
  const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));

  let addedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const goodsId = `payment_${i + 1}`;
    const coverImage = `/Payments/${encodeURIComponent(file)}`;

    // Skip if already added
    if (indexData.products.some(p => p.goodsId === goodsId)) {
      console.log(`Skipping already added: ${file}`);
      continue;
    }

    const title = `Payment #${i + 1}`;

    const indexProduct = {
      id: goodsId,
      goodsId: goodsId,
      title: title,
      searchCode: `PAY${String(i + 1).padStart(3, '0')}`,
      coverImage: coverImage,
      tagId: 999902,
      tagName: "Payments",
      groupName: "Transaction Records",
      _source: "local"
    };

    const fullProduct = {
      ...indexProduct,
      images: [coverImage],
      shopId: "payments",
      link: "",
      timestamp: Date.now() + i,
    };

    indexData.products.unshift(indexProduct);
    fullData.products.unshift(fullProduct);
    productTagsMap[goodsId] = [999902];
    addedCount++;
  }

  if (addedCount > 0) {
    fs.writeFileSync(PRODUCTS_INDEX_FILE, JSON.stringify(indexData, null, 2));
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(fullData, null, 2));
    fs.writeFileSync(PRODUCT_TAGS_FILE, JSON.stringify(productTagsMap, null, 2));
    console.log(`Added ${addedCount} payment products to products_index.json and products.json.`);

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
    console.log('No new payment products added (all already exist).');
  }
}

main().catch(console.error);

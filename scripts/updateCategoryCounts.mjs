import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCT_TAGS_FILE = path.join(__dirname, '../app/data/product_tags.json');
const CATEGORIES_FILE = path.join(__dirname, '../app/data/categories.json');

(async () => {
  console.log("=== Updating Category Counts ===");
  
  if (!fs.existsSync(PRODUCT_TAGS_FILE) || !fs.existsSync(CATEGORIES_FILE)) {
    console.error("Missing necessary data files.");
    process.exit(1);
  }

  const productTagsMap = JSON.parse(fs.readFileSync(PRODUCT_TAGS_FILE, 'utf-8'));
  const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));

  // Tally tag counts from product mappings
  const tagCounts = {};
  for (const tags of Object.values(productTagsMap)) {
    for (const tagId of tags) {
      tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
    }
  }

  // Update categories.json
  let totalUpdated = 0;
  for (const group of categories) {
    if (group.tags) {
      for (const tag of group.tags) {
        const count = tagCounts[tag.tagId] || 0;
        if (tag.itemCount !== count) {
          tag.itemCount = count;
          totalUpdated++;
        }
      }
    }
  }

  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  console.log(`Updated counts for ${totalUpdated} categories.`);
  console.log("=== DONE ===");
})();

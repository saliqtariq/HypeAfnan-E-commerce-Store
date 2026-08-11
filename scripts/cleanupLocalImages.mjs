import fs from "fs";
import path from "path";

const productsLocalPath = path.join(process.cwd(), "app/data/products_local.json");
const imagesDir = path.join(process.cwd(), "public/images/products");

try {
  console.log("Loading products_local.json...");
  const data = JSON.parse(fs.readFileSync(productsLocalPath, "utf-8"));
  const productsArray = Array.isArray(data) ? data : data.products;

  if (!productsArray) throw new Error("No products found.");

  const validFiles = new Set();
  let validCount = 0;

  // Extract all file paths in use
  productsArray.forEach((product) => {
    if (product?.images) {
      product.images.forEach((img) => {
        if (img && img.startsWith("/images/products/")) {
          validFiles.add(path.basename(img));
          validCount++;
        }
      });
    }
  });

  console.log(`Found ${validFiles.size} unique valid image references in JSON.`);

  // Check physical files
  const physicalFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith(".webp"));
  console.log(`Found ${physicalFiles.length} physical .webp files in ${imagesDir}.`);

  let deletedCount = 0;

  physicalFiles.forEach((file) => {
    if (!validFiles.has(file)) {
      fs.unlinkSync(path.join(imagesDir, file));
      deletedCount++;
    }
  });

  console.log(`\n✅ Local Cleanup Complete!`);
  console.log(`Deleted ${deletedCount} unused/duplicate files.`);
  console.log(`Remaining files: ${physicalFiles.length - deletedCount}`);
} catch (error) {
  console.error("Cleanup failed:", error);
}

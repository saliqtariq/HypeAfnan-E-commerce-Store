import fs from 'fs';
import path from 'path';

const filesToUpdate = [
    'app/data/products.json',
    'app/data/products_local.json',
    'app/data/products_index.json'
];

const OLD_URL = 'https://f005.backblazeb2.com/file/HypeAfnan-images';
const NEW_URL = 'https://hypeafnan-cdn.afnanimran61.workers.dev';

let updatedCount = 0;

for (const relativePath of filesToUpdate) {
    const fullPath = path.join(process.cwd(), relativePath);
    
    if (fs.existsSync(fullPath)) {
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Globally replace the old B2 URL with the new Cloudflare CDN URL
            if (content.includes(OLD_URL)) {
                content = content.replaceAll(OLD_URL, NEW_URL);
                
                // Also look for local paths and replace them with the CDN url just to be safe
                content = content.replaceAll('"/images/products/', `"${NEW_URL}/images/products/`);
                
                fs.writeFileSync(fullPath, content);
                console.log(`✅ Updated ${relativePath}`);
                updatedCount++;
            } else if (content.includes('"/images/products/')) {
                // If they only have local paths, update those
                content = content.replaceAll('"/images/products/', `"${NEW_URL}/images/products/`);
                fs.writeFileSync(fullPath, content);
                console.log(`✅ Updated local paths in ${relativePath}`);
                updatedCount++;
            } else {
                console.log(`- No changes needed for ${relativePath}`);
            }
            
        } catch (error) {
            console.error(`❌ Failed to update ${relativePath}:`, error);
        }
    } else {
        console.log(`- File not found: ${relativePath}`);
    }
}

console.log(`\n🎉 CDN update complete! Modified ${updatedCount} files.`);

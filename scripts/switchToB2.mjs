import fs from 'fs';
import path from 'path';

const productsLocalPath = path.join(process.cwd(), 'app/data/products_local.json');
const productsOutPath = path.join(process.cwd(), 'app/data/products.json');

const B2_BASE_URL = 'https://f005.backblazeb2.com/file/HypeAfnan-images';

function convertToB2Url(localUrl) {
    if (!localUrl) return localUrl;
    if (localUrl.startsWith('/images/products/')) {
        return `${B2_BASE_URL}${localUrl}`;
    }
    return localUrl;
}

try {
    const data = fs.readFileSync(productsLocalPath, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Some versions of our scripts wrapped the array in a "products" object key
    const productsArray = Array.isArray(parsedData) ? parsedData : parsedData.products;

    if (!Array.isArray(productsArray)) {
        throw new Error("Could not find a valid products array in the JSON file.");
    }

    const b2Products = productsArray.map(product => {
        const newProduct = { ...product };
        
        if (newProduct.coverImage) {
            newProduct.coverImage = convertToB2Url(newProduct.coverImage);
        }
        
        if (newProduct.images && Array.isArray(newProduct.images)) {
            newProduct.images = newProduct.images.map(img => convertToB2Url(img));
        }

        if (newProduct.video) {
            newProduct.video = convertToB2Url(newProduct.video);
        }
        
        return newProduct;
    });

    // Save it in the same structure as it was read
    const outputData = Array.isArray(parsedData) ? b2Products : { products: b2Products };

    fs.writeFileSync(productsOutPath, JSON.stringify(outputData, null, 2));
    console.log(`✅ Successfully updated ${b2Products.length} products to use Backblaze URLs.`);
    console.log(`Saved to: ${productsOutPath}`);
    
    console.log('\nSample product URLs:');
    console.log(b2Products[0].coverImage);
} catch (error) {
    console.error('Error:', error);
}

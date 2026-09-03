const http = require('http');

function fetchPage(page) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000/api/products?tagId=85659168&limit=150&page=${page}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTest() {
  console.log('Testing T-shirt category API...');
  
  // Test Page 1
  const page1 = await fetchPage(1);
  console.log(`Page 1: Returned ${page1.products.length} products. Total count reported: ${page1.total}. HasMore: ${page1.hasMore}`);
  
  // Test Page 2
  const page2 = await fetchPage(2);
  console.log(`Page 2: Returned ${page2.products.length} products. Total count reported: ${page2.total}. HasMore: ${page2.hasMore}`);
  
  if (page1.products.length > 0 && page2.products.length > 0 && page1.products[0].id === page2.products[0].id) {
    console.log('ERROR: Page 2 returned the same exact products as Page 1. Pagination is broken.');
  } else {
    console.log('SUCCESS: Page 2 returned different products. Pagination is working.');
  }
  
  // Test Last Page
  const lastPageNum = Math.ceil(page1.total / 150);
  console.log(`\nFetching Last Page (${lastPageNum})...`);
  const lastPage = await fetchPage(lastPageNum);
  console.log(`Last Page: Returned ${lastPage.products.length} products. Total count reported: ${lastPage.total}. HasMore: ${lastPage.hasMore}`);
  
  // Test Out of Bounds Page
  console.log(`\nFetching Out of Bounds Page (${lastPageNum + 1})...`);
  const outOfBounds = await fetchPage(lastPageNum + 1);
  console.log(`Out of Bounds: Returned ${outOfBounds.products?.length} products. HasMore: ${outOfBounds.hasMore}`);
}

runTest().catch(console.error);

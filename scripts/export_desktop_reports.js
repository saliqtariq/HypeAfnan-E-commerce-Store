const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const categoriesPath = path.join(__dirname, '../app/data/categories.json');
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

const list = [];
categories.forEach(group => {
  if (group.tags) {
    group.tags.forEach(tag => {
      list.push({
        name: tag.tagName,
        count: tag.itemCount || 0,
        group: group.groupName || 'Uncategorized'
      });
    });
  }
});

// 1. Generate Plain Text File
let txtContent = `=====================================================\n`;
txtContent += `         HYPEAFNAN - CATEGORY PRODUCT REPORT         \n`;
txtContent += `=====================================================\n`;
txtContent += `Total Categories: ${list.length}\n`;
txtContent += `Generated: ${new Date().toLocaleString()}\n\n`;

list.forEach((item, index) => {
  txtContent += `${(index + 1).toString().padStart(3, ' ')}. ${item.name.padEnd(35, ' ')} : ${item.count.toLocaleString()} products (Group: ${item.group})\n`;
});

fs.writeFileSync('C:/Users/Dell/Desktop/Category_Report.txt', txtContent, 'utf8');
console.log('Created Category_Report.txt on Desktop');

// 2. Generate Clean & Modern HTML
let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HypeAfnan - Category Product Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 30px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 35px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
      font-size: 24px;
      color: #0f172a;
    }
    .badge {
      background: #e0f2fe;
      color: #0369a1;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    tr:hover {
      background: #f1f5f9;
    }
    td.num {
      text-align: right;
      font-weight: 600;
      color: #0f172a;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>HypeAfnan Store - Category Products Report</h1>
        <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Complete product count breakdown by category</p>
      </div>
      <div class="badge">${list.length} Categories</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Category Name</th>
          <th>Group</th>
          <th style="text-align: right;">Product Count</th>
        </tr>
      </thead>
      <tbody>
`;

list.forEach((item, index) => {
  htmlContent += `        <tr>
          <td style="color: #94a3b8;">${index + 1}</td>
          <td><strong>${item.name}</strong></td>
          <td style="color: #64748b;">${item.group}</td>
          <td class="num">${item.count.toLocaleString()}</td>
        </tr>\n`;
});

htmlContent += `      </tbody>
    </table>
  </div>
</body>
</html>`;

fs.writeFileSync('C:/Users/Dell/Desktop/Category_Report.html', htmlContent, 'utf8');
console.log('Created Category_Report.html on Desktop');

// 3. Print directly to PDF via Edge Headless
try {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const htmlFile = 'C:\\Users\\Dell\\Desktop\\Category_Report.html';
  const pdfFile = 'C:\\Users\\Dell\\Desktop\\Category_Report.pdf';
  execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfFile}" "${htmlFile}"`);
  console.log('Created Category_Report.pdf on Desktop');
} catch (err) {
  console.error('Edge PDF conversion note:', err.message);
}

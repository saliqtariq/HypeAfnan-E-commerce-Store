const fs = require('fs');
const path = require('path');

const translations = {
  ar: { share: "مشاركة", consultingPrice: "سعر الاستشارة", justNow: "الآن", details: "التفاصيل", searchCode: "كود البحث" },
  de: { share: "Teilen", consultingPrice: "Beratungspreis", justNow: "Gerade eben", details: "Details", searchCode: "Suchcode" },
  en: { share: "Share", consultingPrice: "Consulting price", justNow: "Just now", details: "Details", searchCode: "Search Code" },
  es: { share: "Compartir", consultingPrice: "Precio de consulta", justNow: "Hace un momento", details: "Detalles", searchCode: "Código de búsqueda" },
  fr: { share: "Partager", consultingPrice: "Prix de consultation", justNow: "À l'instant", details: "Détails", searchCode: "Code de recherche" },
  it: { share: "Condividi", consultingPrice: "Prezzo di consulenza", justNow: "Proprio ora", details: "Dettagli", searchCode: "Codice di ricerca" },
  ja: { share: "共有", consultingPrice: "相談価格", justNow: "たった今", details: "詳細", searchCode: "検索コード" },
  pt: { share: "Compartilhar", consultingPrice: "Preço de consulta", justNow: "Agora mesmo", details: "Detalhes", searchCode: "Código de pesquisa" },
  ru: { share: "Поделиться", consultingPrice: "Цена консультации", justNow: "Только что", details: "Подробности", searchCode: "Код поиска" },
  zh: { share: "分享", consultingPrice: "咨询价格", justNow: "刚刚", details: "详情", searchCode: "搜索代码" }
};

for (const [lang, trans] of Object.entries(translations)) {
  const filePath = path.join(__dirname, 'messages', `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.productDetail) data.productDetail = {};
    Object.assign(data.productDetail, trans);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
}

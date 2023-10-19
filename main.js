const http = require('http');
const fs = require('fs');
const xml = require('fast-xml-parser');

const server = http.createServer((req, res) => {
  try {
    const xmlData = fs.readFileSync('data.xml', 'utf8');

    if (!xmlData) {
      throw new Error('Файл з розширенням .xml не знайдено або він порожній.');
    }

    const options = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
    };

    const parser = new xml.XMLParser(options);
    const obj = parser.parse(xmlData, options);

    if (obj && obj.indicators && Array.isArray(obj.indicators.basindbank)) {
      const data = obj.indicators.basindbank;
      const sortedData = data
        .filter((item) => item.parent === 'BS3_BanksLiab')
        .map((item) => ({
          txten: item.txten,
          value: item.value,
        }));

      const newObj = {
        data: {
          indicators: sortedData,
        },
      };

      const builder = new xml.XMLBuilder();
      const xmlStr = builder.build(newObj);

      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.end(xmlStr);

    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Помилка: ' + error.message);
  }
});

server.listen(8000, () => {
  console.log('Сервер запущено на localhost:8000');
});
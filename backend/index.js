const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const ExcelJS = require('exceljs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// 跨域
app.use(cors());
app.use(bodyParser.json());

// 初始化数据库
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    process TEXT,
    quantity INTEGER,
    order_number TEXT,
    flow_card TEXT,
    date TEXT
  )`);
});

// 接收报工数据接口
app.post('/api/report', (req, res) => {
  const { name, process, quantity, orderNumber, flowCard, date } = req.body;
  if (!name || !process || !quantity || !orderNumber || !flowCard || !date) {
    return res.status(400).json({ message: '缺少参数' });
  }
  const stmt = db.prepare(`INSERT INTO reports (name, process, quantity, order_number, flow_card, date) VALUES (?, ?, ?, ?, ?, ?)`);
  stmt.run(name, process, quantity, orderNumber, flowCard, date, function(err) {
    if (err) {
      return res.status(500).json({ message: '数据库错误' });
    }
    res.json({ message: '保存成功', id: this.lastID });
  });
  stmt.finalize();
});

// 导出Excel接口，按月份导出，例如 month = '2025-08'
app.get('/api/export', (req, res) => {
  const month = req.query.month;
  if (!month) {
    return res.status(400).json({ message: '缺少月份参数 month' });
  }

  const startDate = month + '-01';
  const endDate = month + '-31';

  db.all(`SELECT * FROM reports WHERE date >= ? AND date <= ?`, [startDate, endDate], async (err, rows) => {
    if (err) {
      return res.status(500).json({ message: '数据库错误' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: '该月份无数据' });
    }

    // 生成Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('报工数据');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '姓名', key: 'name', width: 20 },
      { header: '工序', key: 'process', width: 20 },
      { header: '数量', key: 'quantity', width: 10 },
      { header: '排单号', key: 'order_number', width: 20 },
      { header: '流程卡号', key: 'flow_card', width: 20 },
      { header: '日期', key: 'date', width: 15 }
    ];

    rows.forEach(row => {
      worksheet.addRow(row);
    });

    // 先保存文件到服务器临时文件夹
    const filePath = path.join(__dirname, `${month}_report.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, `${month}_报工数据.xlsx`, (err) => {
      if (err) {
        console.error(err);
      }
      // 删除临时文件
      fs.unlinkSync(filePath);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
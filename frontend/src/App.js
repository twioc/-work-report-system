import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  return (
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <h2>欢迎使用报工系统</h2>
      <p>员工扫码以下二维码，进入报工录入页面：</p>
      <img src="/qr_code_entry.png" alt="报工入口二维码" style={{ width: 250, height: 250 }} />
      <p style={{marginTop:20}}>或者点击下面链接进入录入页面：</p>
      <Link to="/report">进入报工录入页面</Link>
    </div>
  );
}

function Report() {
  const [formData, setFormData] = useState({
    name: '',
    process: '',
    quantity: '',
    orderNumber: '',
    flowCard: '',
    date: ''
  });

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/report', formData);
      alert('提交成功！ID: ' + res.data.id);
      setFormData({
        name: '',
        process: '',
        quantity: '',
        orderNumber: '',
        flowCard: '',
        date: ''
      });
    } catch (error) {
      alert('提交失败：' + error.response?.data?.message || error.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>报工系统录入</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label>姓名:<br/>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label><br/>
        <label>工序:<br/>
          <input name="process" value={formData.process} onChange={handleChange} required />
        </label><br/>
        <label>数量:<br/>
          <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
        </label><br/>
        <label>排单号:<br/>
          <input name="orderNumber" value={formData.orderNumber} onChange={handleChange} required />
        </label><br/>
        <label>流程卡号:<br/>
          <input name="flowCard" value={formData.flowCard} onChange={handleChange} required />
        </label><br/>
        <label>日期:<br/>
          <input name="date" type="date" value={formData.date} onChange={handleChange} required />
        </label><br/><br/>
        <button type="submit">提交报工</button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}
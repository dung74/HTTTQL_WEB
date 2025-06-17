import React, { useState } from 'react';
import TeamForm from './TeamForm';

function AdminPanel({ token }) {
  const [productName, setProductName] = useState('');
  const [productClass, setProductClass] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [distributorName, setDistributorName] = useState('');
  const [userId, setUserId] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAddProduct = (e) => {
    e.preventDefault();
    console.log('Thêm sản phẩm:', { productName, productClass, stock, price });
    alert('Thêm sản phẩm thành công (giả lập)!');
  };

  const handleAddDistributor = (e) => {
    e.preventDefault();
    console.log('Thêm nhà phân phối:', { distributorName });
    alert('Thêm nhà phân phối thành công (giả lập)!');
  };

  const handleUpdateRole = (e) => {
    e.preventDefault();
    console.log('Cập nhật role:', { userId, newRole });
    alert('Cập nhật role thành công (giả lập)!');
  };

  const handleSetManager = (e) => {
    e.preventDefault();
    console.log('Set manager:', { userId });
    alert('Set manager thành công (giả lập)!');
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <h3>Thêm sản phẩm</h3>
      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Tên sản phẩm"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Loại sản phẩm"
          value={productClass}
          onChange={(e) => setProductClass(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Số lượng tồn kho"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Giá"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button type="submit">Thêm sản phẩm</button>
      </form>

      <h3>Thêm nhà phân phối</h3>
      <form onSubmit={handleAddDistributor}>
        <input
          type="text"
          placeholder="Tên nhà phân phối"
          value={distributorName}
          onChange={(e) => setDistributorName(e.target.value)}
          required
        />
        <button type="submit">Thêm nhà phân phối</button>
      </form>

      <h3>Chỉnh sửa role</h3>
      <form onSubmit={handleUpdateRole}>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} required>
          <option value="">Chọn role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Cập nhật role</button>
      </form>

      <h3>Set Manager</h3>
      <form onSubmit={handleSetManager}>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <button type="submit">Set Manager</button>
      </form>

      <TeamForm token={token} />
    </div>
  );
}

export default AdminPanel;
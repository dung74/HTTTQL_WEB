import React, { useState } from 'react';

function OrderForm({ token, role }) {
  const [productId, setProductId] = useState('');
  const [distributorId, setDistributorId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    city: '',
    channel: '',
    sub_channel: '',
    country: '',
    latitude: '',
    longitude: '',
  });

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const orderData = {
      product_id: productId,
      distributor_id: distributorId,
      user_id: 'USER_ID_FROM_TOKEN',
      quantity,
      customer_id: customerId || undefined,
      new_customer: customerId ? undefined : newCustomer,
    };
    console.log('Tạo đơn hàng:', orderData);
    alert('Tạo đơn hàng thành công (giả lập)!');
  };

  return (
    <div>
      <h3>Tạo đơn hàng</h3>
      <form onSubmit={handleCreateOrder}>
        <input
          type="text"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Distributor ID"
          value={distributorId}
          onChange={(e) => setDistributorId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Số lượng"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Customer ID (nếu đã có)"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />

        {!customerId && (
          <div>
            <h4>Thông tin khách hàng mới</h4>
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Thành phố"
              value={newCustomer.city}
              onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Kênh"
              value={newCustomer.channel}
              onChange={(e) => setNewCustomer({ ...newCustomer, channel: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Kênh phụ"
              value={newCustomer.sub_channel}
              onChange={(e) => setNewCustomer({ ...newCustomer, sub_channel: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Quốc gia"
              value={newCustomer.country}
              onChange={(e) => setNewCustomer({ ...newCustomer, country: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Vĩ độ"
              value={newCustomer.latitude}
              onChange={(e) => setNewCustomer({ ...newCustomer, latitude: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Kinh độ"
              value={newCustomer.longitude}
              onChange={(e) => setNewCustomer({ ...newCustomer, longitude: e.target.value })}
              required
            />
          </div>
        )}
        <button type="submit">Tạo đơn hàng</button>
      </form>
    </div>
  );
}

export default OrderForm;
import React, { useState } from 'react';

export default function OrderList({ orders, products, customers, onAdd, onDelete, API_URL }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Form State
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setCustomerId('');
    setItems([{ product_id: '', quantity: 1 }]);
    setFormError('');
    setModalOpen(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' ? parseInt(value, 10) || '' : value
    };
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerId) {
      setFormError('Please select a customer.');
      return;
    }

    // Validate items
    const filteredItems = items.filter(item => item.product_id && item.quantity > 0);
    if (filteredItems.length === 0) {
      setFormError('Please add at least one valid product with quantity > 0.');
      return;
    }

    // Check inventory locally before making the request for instant feedback
    for (const item of filteredItems) {
      const dbProduct = products.find(p => p.id === parseInt(item.product_id, 10));
      if (dbProduct && dbProduct.quantity < item.quantity) {
        setFormError(`Insufficient stock for product '${dbProduct.name}'. Available: ${dbProduct.quantity}, Requested: ${item.quantity}`);
        return;
      }
    }

    const payload = {
      customer_id: parseInt(customerId, 10),
      items: filteredItems.map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to place order.');

      onAdd(data);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this order? Inventory stock will be replenished.')) return;

    try {
      const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to delete order.');

      onDelete(id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Order Shipments</h1>
        <button className="btn btn-primary" onClick={openAddModal} id="btn-add-order">
          + Place New Order
        </button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table id="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Value</th>
                <th>Date / Time</th>
                <th>Items Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-secondary">
                    No orders placed yet. Select 'Place New Order' to request stock.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customerName = order.customer?.name || `Customer ID: ${order.customer_id}`;
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td style={{ fontWeight: 600 }}>{customerName}</td>
                      <td>${order.total_amount.toFixed(2)}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                      <td>{order.items?.length ?? 0} Item(s)</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openDetailsModal(order)}
                          >
                            Details
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(order.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place Order Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Place Customer Order</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select
                    className="form-control"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Order Items</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItemRow}>
                    + Add Product Row
                  </button>
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                  {items.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">Product</label>
                        <select
                          className="form-control"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          required
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                              {p.name} - ${p.price.toFixed(2)} ({p.quantity} left)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Qty</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ marginBottom: '1px' }}
                          onClick={() => handleRemoveItemRow(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {detailsModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setDetailsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Order #{selectedOrder.id} Details</h2>
              <button className="modal-close" onClick={() => setDetailsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Customer Profile</h3>
                  <p style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedOrder.customer?.name || 'Unknown'}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedOrder.customer?.email}</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Order Summary</h3>
                  <p style={{ fontWeight: 600, marginTop: '0.25rem', color: 'var(--accent-color)' }}>
                    Total Value: ${selectedOrder.total_amount.toFixed(2)}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Placed: {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ordered Products</h3>
              <div className="table-container" style={{ margin: 0 }}>
                <table style={{ fontSize: '0.825rem' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item) => {
                      const productInfo = products.find(p => p.id === item.product_id);
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{productInfo?.name || `Product ID: ${item.product_id}`}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price_at_order.toFixed(2)}</td>
                          <td>${(item.quantity * item.price_at_order).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

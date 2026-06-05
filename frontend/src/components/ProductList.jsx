import React, { useState } from 'react';

export default function ProductList({ products, onAdd, onUpdate, onDelete, API_URL }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    if (!name.trim() || !sku.trim() || !price || !quantity) {
      setFormError('All fields are required.');
      return;
    }

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Price must be a positive number.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum < 0) {
      setFormError('Quantity cannot be negative.');
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      price: priceNum,
      quantity: qtyNum
    };

    try {
      if (editingProduct) {
        // Update product
        const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to update product.');
        onUpdate(data);
      } else {
        // Add product
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to create product.');
        onAdd(data);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to delete product.');
      onDelete(id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Product Catalog</h1>
        <button className="btn btn-primary" onClick={openAddModal} id="btn-add-product">
          + Add Product
        </button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table id="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Quantity in Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-secondary">
                    No products available. Add some products to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td><code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{product.sku}</code></td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.quantity}</td>
                    <td>
                      {product.quantity === 0 ? (
                        <span className="badge badge-error">Out of Stock</span>
                      ) : product.quantity < 10 ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Wireless Mouse"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU / Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., MOUSE-WRLS-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="e.g., 29.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Quantity in Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g., 150"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

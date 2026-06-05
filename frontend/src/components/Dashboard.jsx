import React from 'react';

export default function Dashboard({ stats, loading, error, setActiveTab }) {
  if (loading) {
    return <div className="spinner"></div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Failed to load dashboard metrics: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Operational Dashboard</h1>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card" onClick={() => setActiveTab('products')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-title">Total Products</div>
            <div className="stat-value">{stats?.total_products ?? 0}</div>
          </div>
          <div className="stat-desc">Click to manage inventory catalog</div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('customers')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-title">Total Customers</div>
            <div className="stat-value">{stats?.total_customers ?? 0}</div>
          </div>
          <div className="stat-desc">Click to view customer details</div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-title">Total Orders</div>
            <div className="stat-value">{stats?.total_orders ?? 0}</div>
          </div>
          <div className="stat-desc">Click to view or place orders</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-title">Low Stock Alerts</div>
            <div className="stat-value" style={{ color: stats?.low_stock_products?.length > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
              {stats?.low_stock_products?.length ?? 0}
            </div>
          </div>
          <div className="stat-desc">Products with quantity &lt; 10</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="table-container" style={{ margin: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quick Actions</h2>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('products')}>Add/Edit Products</button>
            <button className="btn btn-primary" onClick={() => setActiveTab('customers')}>Manage Customers</button>
            <button className="btn btn-primary" onClick={() => setActiveTab('orders')}>Create Customer Order</button>
          </div>
        </div>

        <div className="low-stock-panel">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Low Stock Alert Monitor</h2>
          {stats?.low_stock_products?.length === 0 ? (
            <p className="text-secondary" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>All product inventory levels are healthy.</p>
          ) : (
            <ul className="low-stock-list">
              {stats?.low_stock_products?.map((prod) => (
                <li key={prod.id} className="low-stock-item">
                  <div>
                    <span style={{ fontWeight: 600 }}>{prod.name}</span>
                    <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'block' }}>SKU: {prod.sku}</span>
                  </div>
                  <span className="badge badge-error">{prod.quantity} Left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

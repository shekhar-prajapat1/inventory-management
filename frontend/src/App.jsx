import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import CustomerList from './components/CustomerList';
import OrderList from './components/OrderList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetches for speed
      const [statsRes, productsRes, customersRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`),
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/customers`),
        fetch(`${API_URL}/orders`)
      ]);

      if (!statsRes.ok || !productsRes.ok || !customersRes.ok || !ordersRes.ok) {
        throw new Error('One or more network requests failed.');
      }

      const [statsData, productsData, customersData, ordersData] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
        customersRes.json(),
        ordersRes.json()
      ]);

      setStats(statsData);
      setProducts(productsData);
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to connect to the backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Updates
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    // Refresh stats
    refreshStats();
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    // Refresh stats
    refreshStats();
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // Refresh stats
    refreshStats();
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    refreshStats();
  };

  const handleDeleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    // Orders will delete automatically in database, so let's refetch them
    fetchOrdersAndStats();
  };

  const handleAddOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Placing order changes product inventory stock levels, so refetch products & stats
    fetchProductsAndStats();
  };

  const handleDeleteOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    // Deleting order restocks products, so refetch products & stats
    fetchProductsAndStats();
  };

  const refreshStats = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`);
      if (res.ok) {
        const statsData = await res.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const fetchProductsAndStats = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/dashboard/stats`)
      ]);
      if (productsRes.ok && statsRes.ok) {
        const productsData = await productsRes.json();
        const statsData = await statsRes.json();
        setProducts(productsData);
        setStats(statsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrdersAndStats = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/dashboard/stats`)
      ]);
      if (ordersRes.ok && statsRes.ok) {
        const ordersData = await ordersRes.json();
        const statsData = await statsRes.json();
        setOrders(ordersData);
        setStats(statsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {error && (
          <div className="alert alert-error">
            <span>
              <strong>Connection Error:</strong> {error}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={fetchData}>
              Retry Connection
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            loading={loading}
            error={error}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'products' && (
          <ProductList
            products={products}
            onAdd={handleAddProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            API_URL={API_URL}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerList
            customers={customers}
            onAdd={handleAddCustomer}
            onDelete={handleDeleteCustomer}
            API_URL={API_URL}
          />
        )}

        {activeTab === 'orders' && (
          <OrderList
            orders={orders}
            products={products}
            customers={customers}
            onAdd={handleAddOrder}
            onDelete={handleDeleteOrder}
            API_URL={API_URL}
          />
        )}
      </main>
    </div>
  );
}

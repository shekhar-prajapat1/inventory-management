import React, { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false); // Close menu on selection
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="logo-container">
        <span>📦 Ethara Inventory</span>
      </div>
      
      {/* Hamburger Toggle Button */}
      <button 
        className={`hamburger ${menuOpen ? 'is-active' : ''}`} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <button
          id="nav-dashboard"
          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabClick('dashboard')}
        >
          Dashboard
        </button>
        <button
          id="nav-products"
          className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabClick('products')}
        >
          Products
        </button>
        <button
          id="nav-customers"
          className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => handleTabClick('customers')}
        >
          Customers
        </button>
        <button
          id="nav-orders"
          className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabClick('orders')}
        >
          Orders
        </button>
      </div>
    </nav>
  );
}

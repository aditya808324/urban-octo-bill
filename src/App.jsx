import { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package } from 'lucide-react';
import './index.css';

// Components (We will move these to separate files shortly)
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'billing', icon: ShoppingCart, label: 'Billing' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem'
    }}>
      <div className="logo" style={{ marginBottom: '3rem' }}>
        <h2 className="text-2xl" style={{
          background: 'linear-gradient(to right, #6366f1, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          NeoBill
        </h2>
        <p className="text-sm">Premium Shop Billing</p>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: activeTab === item.id ? 'var(--primary)' : 'transparent',
              color: activeTab === item.id ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              fontSize: '1rem'
            }}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

import { ProductProvider } from './context/ProductContext';
import { InvoiceProvider } from './context/InvoiceContext';
import ProductManager from './components/ProductManager';
import BillingInterface from './components/BillingInterface';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('billing');

  return (
    <ProductProvider>
      <InvoiceProvider>
        <div className="app-container">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <MainContent activeTab={activeTab} />
        </div>
      </InvoiceProvider>
    </ProductProvider>
  );
}

const MainContent = ({ activeTab }) => {
  return (
    <main style={{ marginLeft: '260px', padding: '2rem', minHeight: '100vh' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1 className="text-2xl" style={{ textTransform: 'capitalize' }}>{activeTab}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, Admin</span>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)' }}></div>
        </div>
      </header>

      {activeTab === 'products' ? (
        <ProductManager />
      ) : activeTab === 'billing' ? (
        <BillingInterface />
      ) : (
        <Dashboard />
      )}
    </main>
  );
};

export default App;


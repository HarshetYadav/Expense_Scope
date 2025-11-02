import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bars3Icon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext.jsx';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with sidebar closed
  const { user, balanceWarning } = useUser();

  useEffect(() => {
    // Handle responsive sidebar behavior
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarOpen(false);
      } else {
        setSidebarOpen(false); // Keep closed by default, user can open manually
      }
    };

    // Set initial state based on screen size
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main content */}
      <div className="erp-main-content">
        {/* Header */}
        <div className="erp-header">
          <div className="erp-header-content">
            <div className="flex items-center space-x-4">
              {/* Hamburger menu button - only show when sidebar is closed */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-neutral-500 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-300"
                  title="Open menu"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              )}
              <div className="erp-desktop-only">
                <h1 className="text-xl font-semibold text-neutral-900">
                  ExpenseScope
                </h1>
                <p className="text-sm text-neutral-600">
                  Professional Expense Management
                </p>
              </div>
            </div>
            
            {/* Balance warning */}
            {balanceWarning && (
              <div className="erp-alert erp-alert-warning flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Low Balance: ${user?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="lg:ml-64">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

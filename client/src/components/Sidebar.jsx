import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserIcon, 
  DocumentTextIcon, 
  PlusIcon, 
  CreditCardIcon,
  ChartBarIcon,
  XMarkIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon,
      description: 'Overview and analytics'
    },
    { 
      name: 'View Expenses', 
      href: '/view-expenses', 
      icon: DocumentTextIcon,
      description: 'Manage all expenses'
    },
    { 
      name: 'Add Expense', 
      href: '/add-expense', 
      icon: PlusIcon,
      description: 'Create new expense'
    },
    { 
      name: 'Payment History', 
      href: '/payment-history', 
      icon: CreditCardIcon,
      description: 'Subscription payments'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserIcon,
      description: 'Account settings'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="erp-sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`erp-sidebar ${isOpen ? 'erp-sidebar-open' : 'erp-sidebar-closed'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="erp-card-header">
            <div className="flex items-center justify-between">
              <div className="erp-logo">
                <div className="erp-logo-icon">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="erp-logo-text">ExpenseScope</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-primary-200 text-primary-700 transition-all duration-300 hover:scale-110"
                title="Close sidebar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-primary-700 mt-2">
              Professional Expense Management
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`erp-nav-link ${isActive(item.href) ? 'erp-nav-link-active' : ''}`}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-neutral-500 truncate">
                      {item.description}
                    </div>
                  </div>
                  {isActive(item.href) && (
                    <ArrowRightOnRectangleIcon className="h-4 w-4 ml-2 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="w-full erp-btn erp-btn-secondary flex items-center justify-center"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

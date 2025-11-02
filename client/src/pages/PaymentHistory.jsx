import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import API from '../api/api.js';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userRes = await API.get('/auth/profile');
      setUser(userRes.data);
      
      // Fetch payment history
      const paymentsRes = await API.get('/payments');
      setPayments(paymentsRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'subscription':
        return 'erp-badge-primary';
      case 'balance_topup':
        return 'erp-badge-success';
      default:
        return 'erp-badge erp-badge-primary';
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'subscription':
        return 'Subscription';
      case 'balance_topup':
        return 'Balance Top-up';
      default:
        return 'Payment';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Payment History</h1>
        <p className="text-neutral-600">View all your subscription payments and balance top-ups</p>
      </div>

      {/* Current Balance Card */}
      <div className="erp-stats-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Current Balance</h3>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(user?.balance || 0)}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Available funds</p>
          </div>
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl">
            <CurrencyDollarIcon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3 className="text-lg font-semibold text-neutral-900">Payment History</h3>
          <p className="text-sm text-primary-700">All your transactions</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="erp-loading-spinner"></div>
            <span className="ml-2 text-neutral-600">Loading payment history...</span>
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <span className={`erp-badge ${getPaymentTypeColor(payment.type)}`}>
                        {getPaymentTypeLabel(payment.type)}
                      </span>
                    </td>
                    <td className="font-medium">{payment.description}</td>
                    <td className="font-semibold text-primary-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="text-neutral-600">
                      {formatDate(payment.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <CreditCardIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No payment history</h3>
            <p className="text-neutral-600">
              You haven't made any payments yet. Your subscription payments and balance top-ups will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      {payments.length > 0 && (
        <div className="erp-grid erp-grid-3">
          <div className="erp-stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="erp-stats-label">Total Payments</p>
                <p className="erp-stats-value">
                  {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="erp-stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="erp-stats-label">Subscription Payments</p>
                <p className="erp-stats-value">
                  {payments.filter(p => p.type === 'subscription').length}
                </p>
              </div>
            </div>
          </div>

          <div className="erp-stats-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="erp-stats-label">Balance Top-ups</p>
                <p className="erp-stats-value">
                  {payments.filter(p => p.type === 'balance_topup').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

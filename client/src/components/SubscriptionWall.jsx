import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext.jsx';
import API from '../api/api.js';

const SubscriptionWall = () => {
  const { user, updateBalance, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');

  const subscriptionCost = 10; // $10 subscription cost

  const handleSubscriptionPayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await API.post('/auth/subscribe', { amount: subscriptionCost });
      setUser(response.data);
      setMessage('Subscription activated successfully!');
      
      // Redirect to dashboard after successful payment
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const newBalance = (user?.balance || 0) + parseFloat(balanceAmount);
      await updateBalance(newBalance);
      setMessage('Balance added successfully!');
      setShowAddBalance(false);
      setBalanceAmount('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add balance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasSufficientBalance = user?.balance >= subscriptionCost;

  return (
    <div className="finance-background flex items-center justify-center p-4">
      <div className="max-w-md w-full relative z-10">
        <div className="erp-card">
          <div className="erp-card-header">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-danger-500 to-danger-600 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 text-center">
              Subscription Required
            </h1>
            <p className="text-neutral-600 text-center mt-2">
              Your free trial has ended. Please subscribe to continue using ExpenseScope.
            </p>
          </div>

          <div className="erp-card-body">
            {/* Current Balance */}
            <div className="erp-stats-card mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Current Balance</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ${user?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Subscription Cost */}
            <div className="erp-stats-card mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Monthly Subscription</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ${subscriptionCost}.00
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`erp-alert ${
                message.includes('success') 
                  ? 'erp-alert-success' 
                  : 'erp-alert-danger'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.includes('success') ? (
                      <CheckCircleIcon className="h-5 w-5 text-success-400" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {hasSufficientBalance ? (
              <div className="space-y-3">
                <button
                  onClick={handleSubscriptionPayment}
                  disabled={loading}
                  className="w-full erp-btn erp-btn-primary flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="erp-loading-spinner mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Pay Subscription ($10)
                    </>
                  )}
                </button>
                <p className="text-sm text-neutral-600 text-center">
                  Payment will be deducted from your balance
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="erp-alert erp-alert-warning">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Insufficient Balance</p>
                    <p className="text-sm">
                      You need ${subscriptionCost} to subscribe. 
                      Current balance: ${user?.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAddBalance(true)}
                  className="w-full erp-btn erp-btn-gold"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Add Funds to Balance
                </button>
              </div>
            )}

            {/* Add Balance Form */}
            {showAddBalance && (
              <form onSubmit={handleAddBalance} className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <h3 className="text-lg font-medium text-neutral-900 mb-3">Add Funds</h3>
                <div className="mb-4">
                  <label className="erp-label">Amount to Add</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="erp-input pl-7"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading || !balanceAmount}
                    className="flex-1 erp-btn erp-btn-primary"
                  >
                    {loading ? 'Adding...' : 'Add Funds'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBalance(false)}
                    className="flex-1 erp-btn erp-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionWall;

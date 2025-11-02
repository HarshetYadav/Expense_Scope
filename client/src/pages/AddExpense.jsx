import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext.jsx';
import API from '../api/api.js';

const AddExpense = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if expense amount exceeds balance
  const isExpenseExceedingBalance = () => {
    if (!user || !formData.amount) return false;
    const expenseAmount = parseFloat(formData.amount);
    return expenseAmount > user.balance;
  };

  // Check if date is in the future
  const isDateInFuture = () => {
    if (!formData.date) return false;
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    return selectedDate > today;
  };

  // Check if amount is negative
  const isAmountNegative = () => {
    if (!formData.amount) return false;
    const expenseAmount = parseFloat(formData.amount);
    return expenseAmount <= 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const expenseAmount = parseFloat(formData.amount);
    
    // Check if amount is negative or zero
    if (expenseAmount <= 0) {
      setMessage('Error: Expense amount must be greater than zero. Negative expenses are not allowed.');
      setLoading(false);
      return;
    }

    // Check if date is in the future
    if (isDateInFuture()) {
      setMessage('Error: You cannot enter a future date. Please select today\'s date or a past date.');
      setLoading(false);
      return;
    }
    
    // Check if user has sufficient balance
    if (user && user.balance < expenseAmount) {
      setMessage(`Error: Expense exceeds available balance. You have $${user.balance.toFixed(2)} available, but trying to spend $${expenseAmount.toFixed(2)}. Please add funds to your account before adding this expense.`);
      setLoading(false);
      return;
    }

    // Check if user has no balance at all
    if (user && user.balance <= 0) {
      setMessage('Error: Insufficient balance! Please add funds to your account before adding expenses.');
      setLoading(false);
      return;
    }

    try {
      await API.post('/expenses', {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description
      });

      setMessage('Expense added successfully!');
      
      // Refresh user data to update balance
      await refreshUser();
      
      // Reset form
      setFormData({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });

      // Redirect to view expenses after a short delay
      setTimeout(() => {
        navigate('/view-expenses');
      }, 1500);

    } catch (error) {
      console.error('Error adding expense:', error);
      setMessage(error.response?.data?.message || 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/view-expenses')}
          className="mr-4 p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Add New Expense</h1>
          <p className="text-neutral-600">Track your spending by adding a new expense</p>
        </div>
      </div>

      {/* Balance Warning */}
      {user && user.balance <= 0 && (
        <div className="erp-alert erp-alert-warning mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-800">
                Insufficient Balance
              </h3>
              <div className="mt-2 text-sm text-warning-700">
                <p>Your current balance is ${user.balance.toFixed(2)}. Please add funds to your account before adding expenses.</p>
                <div className="mt-3">
                  <button
                    onClick={() => navigate('/profile')}
                    className="erp-btn erp-btn-warning text-sm"
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3 className="text-lg font-semibold text-neutral-900">Expense Details</h3>
          <p className="text-sm text-primary-700">Fill in the information below</p>
        </div>
        
        <div className="erp-card-body">
          {message && (
            <div className={`erp-alert ${
              message.includes('success') 
                ? 'erp-alert-success' 
                : 'erp-alert-danger'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.includes('success') ? (
                    <svg className="h-5 w-5 text-success-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="erp-form-group">
              <label htmlFor="title" className="erp-label">
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                Expense Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className="erp-input"
                placeholder="e.g., Grocery shopping, Gas, Coffee"
                required
              />
            </div>

            {/* Amount */}
            <div className="erp-form-group">
              <label htmlFor="amount" className="erp-label">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Amount *
                {isExpenseExceedingBalance() && (
                  <span className="ml-2 text-danger-600 text-sm font-medium">
                    (Exceeds balance: ${user?.balance?.toFixed(2) || '0.00'})
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-neutral-500 sm:text-sm">$</span>
                </div>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={`erp-input pl-7 ${
                    isExpenseExceedingBalance() || isAmountNegative() 
                      ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' 
                      : ''
                  }`}
                  placeholder="0.00"
                  min="0.01"
                  required
                />
                {(isExpenseExceedingBalance() || isAmountNegative()) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ExclamationTriangleIcon className="h-5 w-5 text-danger-500" />
                  </div>
                )}
              </div>
              {isAmountNegative() && (
                <p className="mt-1 text-sm text-danger-600">
                  ⚠️ Expense amount must be greater than zero. Negative expenses are not allowed.
                </p>
              )}
              {!isAmountNegative() && isExpenseExceedingBalance() && (
                <p className="mt-1 text-sm text-danger-600">
                  ⚠️ This expense exceeds your available balance
                </p>
              )}
            </div>

            {/* Category */}
            <div className="erp-form-group">
              <label htmlFor="category" className="erp-label">
                <TagIcon className="h-4 w-4 inline mr-1" />
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="erp-select"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="erp-form-group">
              <label htmlFor="date" className="erp-label">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Date *
                {isDateInFuture() && (
                  <span className="ml-2 text-danger-600 text-sm font-medium">
                    (Future date not allowed)
                  </span>
                )}
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`erp-input ${isDateInFuture() ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {isDateInFuture() && (
                <p className="mt-1 text-sm text-danger-600">
                  ⚠️ You cannot enter a future date. Please select today or a past date.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="erp-form-group">
              <label htmlFor="description" className="erp-label">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="erp-textarea"
                rows={3}
                placeholder="Add any additional details about this expense..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading || (user && user.balance <= 0) || isDateInFuture() || isAmountNegative()}
                className="flex-1 erp-btn erp-btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="erp-loading-spinner mr-2"></div>
                    Adding Expense...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Expense
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/view-expenses')}
                className="flex-1 erp-btn erp-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 erp-card">
        <div className="erp-card-header">
          <h3 className="text-lg font-semibold text-neutral-900">💡 Quick Tips</h3>
        </div>
        <div className="erp-card-body">
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>• Be specific with your expense titles for better tracking</li>
            <li>• Use categories consistently to get better insights</li>
            <li>• Add descriptions for expenses you might want to review later</li>
            <li>• You can always edit or delete expenses from the View Expenses page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;

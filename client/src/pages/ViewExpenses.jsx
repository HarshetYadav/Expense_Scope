import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext.jsx';
import API from '../api/api.js';

const ViewExpenses = () => {
  const { refreshUser } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: new Date().toISOString().split('T')[0]   // Default to today
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
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

  useEffect(() => {
    fetchExpenses();
  }, [dateRange]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await API.get(`/expenses?${params.toString()}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await API.delete(`/expenses/${id}`);
        setExpenses(expenses.filter(expense => expense._id !== id));
        // Refresh user data to update balance
        await refreshUser();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/expenses/${editingExpense._id}`, {
        title: editForm.title,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: editForm.date
      });
      
      setExpenses(expenses.map(expense => 
        expense._id === editingExpense._id ? response.data : expense
      ));
      
      // Refresh user data to update balance
      await refreshUser();
      
      setEditingExpense(null);
      setEditForm({ title: '', amount: '', category: '', date: '' });
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">View Expenses</h1>
          <p className="text-neutral-600">Manage and track all your expenses</p>
        </div>
        <Link
          to="/add-expense"
          className="mt-4 lg:mt-0 erp-btn erp-btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="erp-filters">
        <div className="erp-filter-group">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="erp-input pl-10"
            />
          </div>

          {/* Start Date */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-neutral-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="erp-input"
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-neutral-400" />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="erp-input"
              placeholder="End Date"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="erp-btn erp-btn-secondary flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="erp-card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="erp-loading-spinner"></div>
            <span className="ml-2 text-neutral-600">Loading expenses...</span>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="font-medium">{expense.title}</td>
                    <td>
                      <span className="erp-badge erp-badge-primary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="font-semibold text-danger-600">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="text-neutral-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="erp-actions">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="erp-action-btn erp-action-btn-primary"
                          title="Edit expense"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="erp-action-btn erp-action-btn-danger"
                          title="Delete expense"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No expenses found</h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || dateRange.startDate || dateRange.endDate
                ? 'Try adjusting your search or date filters'
                : 'Get started by adding your first expense'
              }
            </p>
            <Link to="/add-expense" className="erp-btn erp-btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Expense
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-content">
            <div className="erp-modal-header">
              <h3 className="text-lg font-semibold text-neutral-900">Edit Expense</h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="erp-modal-body">
              <div className="space-y-4">
                <div>
                  <label className="erp-label">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="erp-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="erp-label">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="erp-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="erp-label">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="erp-select"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="erp-label">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="erp-input"
                    required
                  />
                </div>
              </div>
              
              <div className="erp-modal-footer">
                <button type="submit" className="erp-btn erp-btn-primary">
                  Update Expense
                </button>
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="erp-btn erp-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExpenses;

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  CalendarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext.jsx';
import API from '../api/api.js';

const COLORS = ['#2d7a4f', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dateComparison, setDateComparison] = useState({ selected: { amount: 0, count: 0 }, previous: { amount: 0, count: 0 } });
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: new Date().toISOString().split('T')[0]   // Default to today
  });
  const [comparisonDate, setComparisonDate] = useState(new Date().toISOString().split('T')[0]); // Separate date for comparison
  const { user } = useUser();

  useEffect(() => {
    fetchData();
  }, [dateRange, comparisonDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // User data is already available from UserContext
      
      // Fetch expenses with date filter
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const expensesRes = await API.get(`/expenses?${params.toString()}`);
      setExpenses(expensesRes.data);
      
      // Fetch summary with date filter
      const summaryRes = await API.get(`/expenses/summary?${params.toString()}`);
      console.log('Summary data:', summaryRes.data); // Debug log
      setSummary(summaryRes.data.summary || []);
      setTotalSpent(summaryRes.data.totalSpent || 0);
      
      // Fetch monthly data
      const monthlyRes = await API.get('/expenses/monthly');
      setMonthlyData(monthlyRes.data);
      
      // Fetch weekly data (past 7 days)
      const weeklyRes = await API.get('/expenses/weekly');
      setWeeklyData(weeklyRes.data);
      
      // Fetch date-based comparison
      const comparisonRes = await API.get(`/expenses/date-comparison?selectedDate=${comparisonDate}`);
      setDateComparison(comparisonRes.data);
      
    } catch (err) {
      console.error('Error fetching data:', err);
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

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setDateRange({ 
      startDate: new Date().toISOString().split('T')[0], // Reset to today
      endDate: new Date().toISOString().split('T')[0]   // Reset to today
    });
    setComparisonDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatWeekDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="erp-loading-spinner"></div>
        <span className="ml-2 text-neutral-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600">Welcome back, {user?.name}! Here's your expense overview.</p>
        </div>
        
        {/* Date Filters */}
        <div className="mt-4 lg:mt-0">
          <div className="erp-filters">
            <div className="erp-filter-group">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-neutral-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="erp-input"
                  placeholder="Start Date"
                />
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-neutral-400" />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="erp-input"
                  placeholder="End Date"
                />
              </div>
              <button
                onClick={clearFilters}
                className="erp-btn erp-btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="erp-grid erp-grid-3">
        {/* Total Expenses */}
        <div className="erp-stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="erp-stats-label">Total Expenses</p>
              <p className="erp-stats-value">
                {formatCurrency(totalSpent)}
              </p>
              <p className="erp-stats-change text-neutral-500">
                {dateRange.startDate && dateRange.endDate ? 'Filtered period' : 'All time'}
              </p>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="erp-stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="erp-stats-label">Current Balance</p>
              <p className="erp-stats-value text-success-600">
                {formatCurrency(user?.balance || 0)}
              </p>
              <p className="erp-stats-change text-neutral-500">
                Available funds
              </p>
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="erp-stats-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="erp-stats-label">Total Transactions</p>
              <p className="erp-stats-value">
                {expenses.length}
              </p>
              <p className="erp-stats-change text-neutral-500">
                {dateRange.startDate && dateRange.endDate ? 'In period' : 'All time'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Spending Chart - Past 7 Days */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3 className="text-lg font-semibold text-neutral-900">Weekly Spending Overview</h3>
          <p className="text-sm text-primary-700">Past 7 days spending breakdown</p>
        </div>
        <div className="erp-card-body">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatWeekDate}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#4fd1c1' : '#e5e7eb'} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4fd1c1" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#2d7a4f" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-neutral-500">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No weekly data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Digital Wellbeing Style - Date-based Comparison */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Daily Spending Comparison</h3>
              <p className="text-sm text-primary-700">Compare selected date with previous day</p>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-neutral-400" />
              <input
                type="date"
                value={comparisonDate}
                onChange={(e) => setComparisonDate(e.target.value)}
                className="erp-input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
        <div className="erp-card-body">
          <div className="space-y-6">
            {/* Selected Date */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600"></div>
                  <span className="text-sm font-medium text-neutral-700">{formatDate(dateComparison.selected.date)}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-neutral-900">{formatCurrency(dateComparison.selected.amount)}</span>
                  <span className="text-xs text-neutral-500 ml-2">({dateComparison.selected.count} transactions)</span>
                </div>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-8 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(() => {
                      const maxAmount = Math.max(dateComparison.selected.amount, dateComparison.previous.amount, 1);
                      return Math.min((dateComparison.selected.amount / maxAmount) * 100, 100);
                    })()}%` 
                  }}
                >
                  {dateComparison.selected.amount > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {formatCurrency(dateComparison.selected.amount)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Previous Day */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-neutral-400 to-neutral-500"></div>
                  <span className="text-sm font-medium text-neutral-700">{formatDate(dateComparison.previous.date)}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-neutral-900">{formatCurrency(dateComparison.previous.amount)}</span>
                  <span className="text-xs text-neutral-500 ml-2">({dateComparison.previous.count} transactions)</span>
                </div>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-8 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-neutral-400 to-neutral-500 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(() => {
                      const maxAmount = Math.max(dateComparison.selected.amount, dateComparison.previous.amount, 1);
                      return Math.min((dateComparison.previous.amount / maxAmount) * 100, 100);
                    })()}%` 
                  }}
                >
                  {dateComparison.previous.amount > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {formatCurrency(dateComparison.previous.amount)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Comparison Info */}
            <div className="pt-4 border-t border-neutral-200">
              {dateComparison.selected.amount > dateComparison.previous.amount ? (
                <div className="flex items-center space-x-2 text-danger-600">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    You spent {formatCurrency(dateComparison.selected.amount - dateComparison.previous.amount)} more on {formatDate(dateComparison.selected.date)}
                  </span>
                </div>
              ) : dateComparison.selected.amount < dateComparison.previous.amount ? (
                <div className="flex items-center space-x-2 text-success-600">
                  <ArrowTrendingUpIcon className="h-5 w-5 rotate-180" />
                  <span className="text-sm font-medium">
                    You saved {formatCurrency(dateComparison.previous.amount - dateComparison.selected.amount)} compared to {formatDate(dateComparison.previous.date)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-neutral-600">
                  <span className="text-sm font-medium">
                    Same spending on both days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="erp-grid erp-grid-2">
        {/* Pie Chart - Expense Distribution */}
        <div className="erp-chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Expense Distribution</h3>
            <div className="flex items-center text-sm text-neutral-500">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Categories
            </div>
          </div>
          {console.log('Rendering chart with summary:', summary) || summary.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary}
                  dataKey="totalAmount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {summary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-neutral-500">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No expense data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Monthly Spending */}
        <div className="erp-chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Monthly Spending</h3>
            <div className="flex items-center text-sm text-neutral-500">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              Last 6 months
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#2d7a4f" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-neutral-500">
              <div className="text-center">
                <ArrowTrendingUpIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No monthly data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Expenses</h3>
          <p className="text-sm text-primary-700">Latest transactions</p>
        </div>
        <div className="erp-card-body">
          {expenses.slice(0, 5).length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense._id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{expense.title}</p>
                      <p className="text-sm text-neutral-600">
                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-danger-600">
                      -{formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No expenses found for the selected date range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

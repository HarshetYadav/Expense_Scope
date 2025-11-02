import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  LockClosedIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext.jsx';
import API from '../api/api.js';

const Profile = () => {
  const { user, loading, updateBalance, refreshUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    try {
      // Validate password fields if changing password
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage('New passwords don\'t match');
        setMessageType('error');
        return;
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        setMessage('New password must be at least 6 characters long');
        setMessageType('error');
        return;
      }

      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Only include password fields if they're provided
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await API.put('/auth/profile', updateData);
      setUser(response.data);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage(err.response?.data?.message || 'Error updating profile');
      setMessageType('error');
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    try {
      const newBalance = (user?.balance || 0) + parseFloat(balanceAmount);
      await updateBalance(newBalance);
      setMessage('Balance added successfully!');
      setMessageType('success');
      setShowAddBalance(false);
      setBalanceAmount('');
    } catch (err) {
      console.error('Error adding balance:', err);
      setMessage(err.response?.data?.message || 'Failed to add balance');
      setMessageType('error');
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="erp-loading-spinner"></div>
        <span className="ml-2 text-neutral-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Profile Settings</h1>
          <p className="text-neutral-600">Manage your account information and balance</p>
        </div>
        <button 
          onClick={() => setEditing(!editing)}
          className="mt-4 lg:mt-0 erp-btn erp-btn-primary"
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`erp-alert ${
          messageType === 'error' 
            ? 'erp-alert-danger' 
            : 'erp-alert-success'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {messageType === 'error' ? (
                <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-success-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="erp-grid erp-grid-2">
        {/* Personal Information */}
        <div className="erp-card">
          <div className="erp-card-header">
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-neutral-900">Personal Information</h3>
            </div>
          </div>
          
          <div className="erp-card-body">
            {editing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="erp-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="erp-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="erp-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="erp-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="erp-label">Current Password (to change password)</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="erp-input"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="erp-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="erp-input"
                      placeholder="Enter new password"
                      minLength="6"
                    />
                  </div>

                  <div>
                    <label className="erp-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="erp-input"
                      placeholder="Confirm new password"
                      minLength="6"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button type="submit" className="flex-1 erp-btn erp-btn-primary">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditing(false)}
                      className="flex-1 erp-btn erp-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="erp-label">Full Name</label>
                  <p className="text-neutral-900 font-medium">{user?.name || 'Not provided'}</p>
                </div>

                <div>
                  <label className="erp-label">Email Address</label>
                  <p className="text-neutral-900 font-medium">{user?.email || 'Not provided'}</p>
                </div>

                <div>
                  <label className="erp-label">Member Since</label>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-primary-600" />
                    <p className="text-neutral-900 font-medium">
                      {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                    </p>
                  </div>
                  {user?.createdAt && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-neutral-500">
                        {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                      <p className="text-xs text-neutral-400">
                        Joined at {formatDateTime(user.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="erp-card">
          <div className="erp-card-header">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-neutral-900">Account Information</h3>
            </div>
          </div>
          
          <div className="erp-card-body">
            <div className="space-y-4">
              <div>
                <label className="erp-label">Current Balance</label>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(user?.balance || 0)}
                  </p>
                  <button
                    onClick={() => setShowAddBalance(true)}
                    className="erp-btn erp-btn-secondary"
                  >
                    Add Funds
                  </button>
                </div>
              </div>

              <div>
                <label className="erp-label">Member Status</label>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="erp-badge erp-badge-primary">Active Member</span>
                  <span className="text-sm text-neutral-600">
                    {user?.createdAt ? `Joined ${formatDate(user.createdAt)}` : 'Unknown join date'}
                  </span>
                </div>
                {user?.createdAt && (
                  <p className="text-xs text-neutral-500">
                    Member for {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </p>
                )}
              </div>

              <div>
                <label className="erp-label">Subscription Status</label>
                <div className="flex items-center space-x-2">
                  {user?.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > new Date() ? (
                    <span className="erp-badge erp-badge-success">Active</span>
                  ) : (
                    <span className="erp-badge erp-badge-danger">Expired</span>
                  )}
                  <span className="text-sm text-neutral-600">
                    {user?.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > new Date()
                      ? `Expires ${formatDate(user.subscriptionEndsAt)}`
                      : 'Subscription required'
                    }
                  </span>
                </div>
              </div>

              {/* Balance Warning */}
              {user?.balance <= 0 && (
                <div className="erp-alert erp-alert-warning">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Low Balance Warning</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Balance Modal */}
      {showAddBalance && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-content">
            <div className="erp-modal-header">
              <h3 className="text-lg font-semibold text-neutral-900">Add Funds to Balance</h3>
              <button
                onClick={() => setShowAddBalance(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddBalance} className="erp-modal-body">
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
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="erp-modal-footer">
                <button
                  type="submit"
                  disabled={!balanceAmount}
                  className="erp-btn erp-btn-primary"
                >
                  Add Funds
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBalance(false)}
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

export default Profile;

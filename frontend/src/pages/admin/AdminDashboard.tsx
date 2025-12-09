import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard';
import { DashboardStats } from '../../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading dashboard...</div></div>;
  }

  if (error) {
    return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-4">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-4 mb-4">
          <div className="card text-center">
            <h3 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              {stats?.totalCustomers || 0}
            </h3>
            <p className="text-muted">Total Customers</p>
          </div>

          <div className="card text-center">
            <h3 style={{ fontSize: '2.5rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
              {stats?.totalCreditsIssued || 0}
            </h3>
            <p className="text-muted">Credits Issued</p>
          </div>

          <div className="card text-center">
            <h3 style={{ fontSize: '2.5rem', color: 'var(--danger-color)', marginBottom: '0.5rem' }}>
              {stats?.totalCreditsSpent || 0}
            </h3>
            <p className="text-muted">Credits Spent</p>
          </div>

          <div className="card text-center">
            <h3 style={{ fontSize: '2.5rem', color: 'var(--warning-color)', marginBottom: '0.5rem' }}>
              {stats?.totalOrders || 0}
            </h3>
            <p className="text-muted">Total Orders</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-4">
          <h2 className="card-header">Quick Actions</h2>
          <div className="grid grid-4">
            <Link to="/admin/products" className="btn btn-primary">
              Manage Products
            </Link>
            <Link to="/admin/customers" className="btn btn-primary">
              View Customers
            </Link>
            <Link to="/admin/orders" className="btn btn-primary">
              View Orders
            </Link>
            <Link to="/admin/transactions" className="btn btn-primary">
              Credit Transactions
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        {stats?.recentOrders && stats.recentOrders.length > 0 && (
          <div className="card">
            <h2 className="card-header">Recent Orders</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Credits</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id.slice(0, 8)}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{order.items.length} item(s)</td>
                      <td><strong>{order.totalCredits}</strong></td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <span className="badge badge-success">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

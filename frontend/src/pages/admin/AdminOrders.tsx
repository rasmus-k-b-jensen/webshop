import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orders';
import { Order } from '../../types';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const response = await orderApi.getAll(statusFilter);
      if (response.success && response.data) {
        setOrders(response.data);
        setTotal(response.total || response.data.length);
      }
    } catch (err: any) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'PROCESSING':
        return '#3b82f6';
      case 'SHIPPED':
        return '#8b5cf6';
      case 'DELIVERED':
        return '#10b981';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    orders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <div className="page"><div className="container loading">Loading orders...</div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-4">Order Management</h1>

        {error && <div className="alert alert-error mb-3">{error}</div>}

        {/* Status Filter Tabs */}
        <div className="card mb-3">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('')}
            >
              All Orders ({total})
            </button>
            <button
              className={`btn ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('PENDING')}
              style={statusFilter === 'PENDING' ? { backgroundColor: '#f59e0b', borderColor: '#f59e0b' } : {}}
            >
              Pending ({statusCounts.PENDING})
            </button>
            <button
              className={`btn ${statusFilter === 'PROCESSING' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('PROCESSING')}
              style={statusFilter === 'PROCESSING' ? { backgroundColor: '#3b82f6', borderColor: '#3b82f6' } : {}}
            >
              Processing ({statusCounts.PROCESSING})
            </button>
            <button
              className={`btn ${statusFilter === 'SHIPPED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('SHIPPED')}
              style={statusFilter === 'SHIPPED' ? { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' } : {}}
            >
              Shipped ({statusCounts.SHIPPED})
            </button>
            <button
              className={`btn ${statusFilter === 'DELIVERED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('DELIVERED')}
              style={statusFilter === 'DELIVERED' ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
            >
              Delivered ({statusCounts.DELIVERED})
            </button>
            <button
              className={`btn ${statusFilter === 'CANCELLED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('CANCELLED')}
              style={statusFilter === 'CANCELLED' ? { backgroundColor: '#ef4444', borderColor: '#ef4444' } : {}}
            >
              Cancelled ({statusCounts.CANCELLED})
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="card text-center">
            <p className="text-muted">
              {statusFilter ? `No ${statusFilter.toLowerCase()} orders.` : 'No orders yet.'}
            </p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Shipping To</th>
                    <th>Total Credits</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</td>
                      <td>
                        <strong>{order.customer?.name}</strong>
                        <br />
                        <small className="text-muted">{order.customer?.email}</small>
                      </td>
                      <td>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                            {item.quantity}× {item.product.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                            +{order.items.length - 2} more
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>
                          {order.shippingName}
                          {order.isGift && <span style={{ marginLeft: '0.25rem' }}>🎁</span>}
                          <br />
                          <small className="text-muted">
                            {order.shippingCity}, {order.shippingState}
                          </small>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.125rem', color: 'var(--primary-color)' }}>
                          {order.totalCredits}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{formatDate(order.createdAt)}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          View Details
                        </button>
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

export default AdminOrders;

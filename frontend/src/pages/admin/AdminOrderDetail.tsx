import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface Order {
  id: string;
  customerId: string;
  totalCredits: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  isGift: boolean;
  giftMessage?: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    priceInCreditsAtPurchase: number;
    product: {
      id: string;
      name: string;
      description: string;
      imageUrl?: string;
    };
  }>;
}

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data.success && response.data.data) {
        setOrder(response.data.data);
        setNewStatus(response.data.data.status);
        setTrackingNumber(response.data.data.trackingNumber || '');
      }
    } catch (err: any) {
      setError('Failed to load order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    setUpdating(true);
    setError('');

    try {
      const response = await api.put(`/orders/${order.id}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
      });

      if (response.data.success) {
        await loadOrder();
        alert('Order status updated successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading order details...</div></div>;
  }

  if (!order) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">Order not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-secondary mb-3" onClick={() => navigate('/admin/orders')}>
          ← Back to Orders
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Left Column - Order Details */}
          <div>
            <div className="card mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ marginBottom: '0.5rem' }}>Order #{order.id.slice(0, 8)}</h1>
                  <p className="text-muted">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {order.status}
                </div>
              </div>

              <div className="divider"></div>

              <h2 className="mb-3">Order Items</h2>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3>{item.product.name}</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {item.product.description}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity} × {item.priceInCreditsAtPurchase} credits
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="product-price">
                      {item.quantity * item.priceInCreditsAtPurchase} credits
                    </p>
                  </div>
                </div>
              ))}

              <div className="divider"></div>

              <div style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 'bold' }}>
                Total: <span className="product-price">{order.totalCredits} Credits</span>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="card mb-3">
              <h2 className="mb-3">📦 Shipping Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.75rem' }}>
                <strong>Recipient:</strong>
                <span>{order.shippingName}</span>

                <strong>Address:</strong>
                <div>
                  {order.shippingAddressLine1}
                  {order.shippingAddressLine2 && (
                    <>
                      <br />
                      {order.shippingAddressLine2}
                    </>
                  )}
                  <br />
                  {order.shippingCity}{order.shippingState && `, ${order.shippingState}`} {order.shippingPostalCode}
                  <br />
                  {order.shippingCountry}
                </div>

                {order.isGift && (
                  <>
                    <strong>🎁 Gift:</strong>
                    <span>Yes</span>
                    {order.giftMessage && (
                      <>
                        <strong>Message:</strong>
                        <span style={{ fontStyle: 'italic' }}>"{order.giftMessage}"</span>
                      </>
                    )}
                  </>
                )}

                {order.trackingNumber && (
                  <>
                    <strong>Tracking #:</strong>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {order.trackingNumber}
                    </span>
                  </>
                )}

                {order.shippedAt && (
                  <>
                    <strong>Shipped:</strong>
                    <span>{formatDate(order.shippedAt)}</span>
                  </>
                )}

                {order.deliveredAt && (
                  <>
                    <strong>Delivered:</strong>
                    <span>{formatDate(order.deliveredAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Customer & Actions */}
          <div>
            <div className="card mb-3">
              <h2 className="mb-3">Customer</h2>
              <p>
                <strong>Name:</strong>
                <br />
                {order.customer.name}
              </p>
              <p>
                <strong>Email:</strong>
                <br />
                <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/admin/customers/${order.customer.id}`)}
                style={{ width: '100%' }}
              >
                View Customer Profile
              </button>
            </div>

            <div className="card">
              <h2 className="mb-3">Update Order Status</h2>

              {error && <div className="alert alert-error mb-3">{error}</div>}

              <div className="form-group">
                <label>Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tracking Number (optional)</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="form-control"
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === order.status}
                style={{ width: '100%' }}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>

              <div className="divider"></div>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <p>
                  <strong>Last Updated:</strong>
                  <br />
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;

import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/orders';
import { Order } from '../types';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderApi.getMyOrders();
      if (response.success && response.data) {
        setOrders(response.data);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading orders...</div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-4">My Orders</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="card text-center">
            <p className="text-muted">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="grid">
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex-between mb-3">
                  <div>
                    <strong>Order #{order.id.slice(0, 8)}</strong>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {order.totalCredits} Credits
                    </div>
                    <span className="badge badge-success">{order.status}</span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2">Items:</h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex-between mb-2" style={{ paddingLeft: '1rem' }}>
                      <div>
                        <strong>{item.product.name}</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.priceInCreditsAtPurchase} credits each
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

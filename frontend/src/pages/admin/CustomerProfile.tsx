import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/users';
import { creditApi } from '../../api/credits';

const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustData, setAdjustData] = useState({
    amount: 0,
    type: 'REWARD' as 'REWARD' | 'ADJUSTMENT',
    reason: '',
  });

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;

    try {
      const response = await userApi.getCustomerProfile(id);
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (err: any) {
      setError('Failed to load customer profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');

    try {
      await creditApi.adjustCredits({
        customerId: id,
        ...adjustData,
      });
      setShowAdjustForm(false);
      setAdjustData({ amount: 0, type: 'REWARD', reason: '' });
      loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to adjust credits');
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

  if (loading) {
    return <div className="page"><div className="container loading">Loading profile...</div></div>;
  }

  if (!profile) {
    return <div className="page"><div className="container"><div className="alert alert-error">Customer not found</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate('/admin/customers')} className="btn btn-secondary mb-3">
          ← Back to Customers
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Customer Info */}
        <div className="card mb-4">
          <h2 className="card-header">Customer Information</h2>
          <div className="grid grid-2">
            <div>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Role:</strong> {profile.role}</p>
            </div>
            <div>
              <p>
                <strong>Credit Balance:</strong>{' '}
                <span style={{ fontSize: '1.5rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                  {profile.creditBalance}
                </span>
              </p>
              <p><strong>Joined:</strong> {formatDate(profile.createdAt)}</p>
            </div>
          </div>

          <button
            onClick={() => setShowAdjustForm(!showAdjustForm)}
            className="btn btn-primary mt-3"
          >
            {showAdjustForm ? 'Cancel' : 'Adjust Credits'}
          </button>

          {showAdjustForm && (
            <form onSubmit={handleAdjustCredits} className="mt-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    value={adjustData.amount}
                    onChange={(e) => setAdjustData({ ...adjustData, amount: Number(e.target.value) })}
                    required
                  />
                  <small className="text-muted">Positive to add, negative to subtract</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={adjustData.type}
                    onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value as any })}
                  >
                    <option value="REWARD">Reward</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    value={adjustData.reason}
                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                Apply Credit Adjustment
              </button>
            </form>
          )}
        </div>

        {/* Recent Transactions */}
        {profile.latestTransactions && profile.latestTransactions.length > 0 && (
          <div className="card mb-4">
            <h2 className="card-header">Recent Credit Transactions</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.latestTransactions.map((txn: any) => (
                    <tr key={txn.id}>
                      <td>{formatDate(txn.createdAt)}</td>
                      <td><span className="badge badge-info">{txn.type}</span></td>
                      <td>
                        <span className={txn.amount > 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                          {txn.amount > 0 ? '+' : ''}{txn.amount}
                        </span>
                      </td>
                      <td>{txn.reason}</td>
                      <td>{txn.createdBy?.name || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {profile.latestOrders && profile.latestOrders.length > 0 && (
          <div className="card">
            <h2 className="card-header">Recent Orders</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Credits</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.latestOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td>#{order.id.slice(0, 8)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items.length} item(s)</td>
                      <td><strong>{order.totalCredits}</strong></td>
                      <td><span className="badge badge-success">{order.status}</span></td>
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

export default CustomerProfile;

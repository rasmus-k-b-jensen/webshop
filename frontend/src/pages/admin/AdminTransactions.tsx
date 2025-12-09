import React, { useEffect, useState } from 'react';
import { creditApi } from '../../api/credits';
import { CreditTransaction } from '../../types';

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await creditApi.getTransactions({ limit: 100 });
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (err: any) {
      setError('Failed to load transactions');
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REWARD':
        return 'badge-success';
      case 'PURCHASE':
        return 'badge-danger';
      case 'ADJUSTMENT':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading transactions...</div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-4">Credit Transactions</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {transactions.length === 0 ? (
          <div className="card text-center">
            <p className="text-muted">No transactions yet.</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td>
                        <strong>{transaction.customer?.name}</strong>
                        <br />
                        <small className="text-muted">{transaction.customer?.email}</small>
                      </td>
                      <td>
                        <span className={`badge ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td>
                        <span
                          className={transaction.amount > 0 ? 'text-success' : 'text-danger'}
                          style={{ fontWeight: 'bold', fontSize: '1.125rem' }}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </span>
                      </td>
                      <td>{transaction.reason}</td>
                      <td>{transaction.createdBy?.name || 'System'}</td>
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

export default AdminTransactions;

import React, { useEffect, useState } from 'react';
import { creditApi } from '../api/credits';
import { CreditTransaction } from '../types';

const CreditHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await creditApi.getMyHistory();
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (err: any) {
      setError('Failed to load credit history');
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
    return <div className="page"><div className="container loading">Loading credit history...</div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-4">Credit History</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {transactions.length === 0 ? (
          <div className="card text-center">
            <p className="text-muted">No credit transactions yet.</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td>
                        <span className={`badge ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td>
                        <span
                          className={transaction.amount > 0 ? 'text-success' : 'text-danger'}
                          style={{ fontWeight: 'bold' }}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </span>
                      </td>
                      <td>
                        {transaction.balanceAfter !== undefined && (
                          <strong>{transaction.balanceAfter}</strong>
                        )}
                      </td>
                      <td>{transaction.reason}</td>
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

export default CreditHistory;

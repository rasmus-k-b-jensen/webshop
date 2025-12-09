import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/users';
import { User } from '../../types';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await userApi.getAllCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (err: any) {
      setError('Failed to load customers');
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
    });
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading customers...</div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-4">Customer Management</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Credit Balance</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td><strong>{customer.name}</strong></td>
                    <td>{customer.email}</td>
                    <td>
                      <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                        {customer.creditBalance}
                      </span>
                    </td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>
                      <Link
                        to={`/admin/customers/${customer.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;

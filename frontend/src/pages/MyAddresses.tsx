import React, { useEffect, useState } from 'react';
import { addressApi, Address, CreateAddressData } from '../api/address';

const MyAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateAddressData>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Denmark',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await addressApi.getAll();
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (err: any) {
      setError('Failed to load addresses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Denmark',
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state || '',
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await addressApi.update(editingId, formData);
        setSuccess('Address updated successfully');
      } else {
        await addressApi.create(formData);
        setSuccess('Address added successfully');
      }
      await loadAddresses();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressApi.delete(id);
      setSuccess('Address deleted successfully');
      await loadAddresses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressApi.setDefault(id);
      setSuccess('Default address updated');
      await loadAddresses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update default address');
    }
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading addresses...</div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>My Addresses</h1>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add New Address
            </button>
          )}
        </div>

        {error && <div className="alert alert-error mb-3">{error}</div>}
        {success && <div className="alert alert-success mb-3">{success}</div>}

        {showForm && (
          <div className="card mb-4">
            <h2 className="mb-3">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Recipient Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  Set as default address
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Address' : 'Add Address'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="card">
            <p className="text-muted">No addresses saved yet. Add your first address above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {addresses.map((address) => (
              <div key={address.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3>
                      {address.name}
                      {address.isDefault && (
                        <span className="badge" style={{ marginLeft: '0.5rem' }}>Default</span>
                      )}
                    </h3>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                      {address.addressLine1}
                      {address.addressLine2 && <>, {address.addressLine2}</>}
                      <br />
                      {address.city}{address.state && `, ${address.state}`} {address.postalCode}
                      <br />
                      {address.country}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    {!address.isDefault && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(address)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAddresses;

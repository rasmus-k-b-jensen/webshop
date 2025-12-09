import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/products';
import { orderApi } from '../api/orders';
import { addressApi, Address, CreateAddressData } from '../api/address';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');

  const [product, setProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  
  const [newAddress, setNewAddress] = useState<CreateAddressData>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Denmark',
    isDefault: false,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    if (!productId) {
      setError('No product specified');
      setLoading(false);
      return;
    }

    try {
      const [productRes, addressRes] = await Promise.all([
        productApi.getById(productId),
        addressApi.getAll(),
      ]);

      if (productRes.success && productRes.data) {
        setProduct(productRes.data);
      }

      if (addressRes.success && addressRes.data) {
        setAddresses(addressRes.data);
        const defaultAddr = addressRes.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (err: any) {
      setError('Failed to load checkout data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let shippingAddressId = selectedAddressId;
      let shippingAddress = undefined;

      // If using new address, create it first
      if (showNewAddressForm) {
        const createRes = await addressApi.create(newAddress);
        if (createRes.success && createRes.data) {
          shippingAddressId = createRes.data.id;
        }
      }

      // Create order
      const orderData: any = {
        productId: productId!,
        quantity,
        shippingAddressId,
        isGift,
      };

      if (isGift && giftMessage.trim()) {
        orderData.giftMessage = giftMessage;
      }

      const response = await orderApi.create(orderData);
      
      if (response.success) {
        await refreshUser();
        navigate('/my-orders', { state: { message: 'Order placed successfully!' } });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCredits = product ? product.priceInCredits * quantity : 0;
  const canAfford = user && user.creditBalance >= totalCredits;

  if (loading) {
    return <div className="page"><div className="container loading">Loading checkout...</div></div>;
  }

  if (!product) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">Product not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        <h1 className="mb-4">Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Column - Order Summary */}
          <div>
            <div className="card mb-3">
              <h2 className="mb-3">Order Summary</h2>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }}
                  />
                )}
                <div>
                  <h3>{product.name}</h3>
                  <p className="text-muted">Quantity: {quantity}</p>
                  <p className="product-price">{product.priceInCredits} credits each</p>
                </div>
              </div>
              <div className="divider"></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span className="product-price">{totalCredits} Credits</span>
              </div>
              {user && (
                <p className="text-muted mt-2">
                  Your balance: {user.creditBalance} credits
                  {!canAfford && <span className="text-danger"> (Insufficient credits)</span>}
                </p>
              )}
            </div>

            {/* Gift Options */}
            <div className="card">
              <h3 className="mb-3">🎁 Gift Options</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                  />
                  Send as a gift
                </label>
              </div>
              {isGift && (
                <div className="form-group">
                  <label>Gift Message (optional)</label>
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Shipping Address */}
          <div>
            <form onSubmit={handleSubmit}>
              <div className="card mb-3">
                <h2 className="mb-3">Shipping Address</h2>

                {addresses.length > 0 && !showNewAddressForm && (
                  <div className="mb-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={{
                          padding: '1rem',
                          border: selectedAddressId === addr.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          backgroundColor: selectedAddressId === addr.id ? 'var(--background-secondary)' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <strong>{addr.name}</strong>
                            {addr.isDefault && <span className="badge" style={{ marginLeft: '0.5rem' }}>Default</span>}
                            <p className="text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                              <br />
                              {addr.city}{addr.state && `, ${addr.state}`} {addr.postalCode}
                              <br />
                              {addr.country}
                            </p>
                          </div>
                          <input
                            type="radio"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            style={{ marginTop: '0.25rem' }}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowNewAddressForm(true)}
                      style={{ width: '100%' }}
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {(showNewAddressForm || addresses.length === 0) && (
                  <div>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-secondary mb-3"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        ← Use Saved Address
                      </button>
                    )}

                    <div className="form-group">
                      <label>Recipient Name *</label>
                      <input
                        type="text"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Address Line 1 *</label>
                      <input
                        type="text"
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Address Line 2</label>
                      <input
                        type="text"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Postal Code *</label>
                        <input
                          type="text"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Country *</label>
                        <input
                          type="text"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        Save as default address
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {error && <div className="alert alert-error mb-3">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !canAfford || (addresses.length === 0 && !showNewAddressForm) || (!showNewAddressForm && !selectedAddressId)}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              >
                {submitting ? 'Placing Order...' : `Place Order (${totalCredits} Credits)`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

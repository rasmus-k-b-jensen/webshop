import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/products';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    try {
      const response = await productApi.getById(id);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (err: any) {
      setError('Failed to load product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!product || !id) return;
    navigate(`/checkout?productId=${id}&quantity=${quantity}`);
  };

  const canAfford = product && user && user.creditBalance >= product.priceInCredits;
  const canPurchase = canAfford && (product?.stock === null || (product?.stock || 0) > 0);

  if (loading) {
    return <div className="page"><div className="container loading">Loading...</div></div>;
  }

  if (!product) {
    return <div className="page"><div className="container"><div className="alert alert-error">Product not found</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1.5rem' }}
            />
          )}

          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{product.name}</h1>
          
          <div className="mb-3">
            <div className="product-price" style={{ fontSize: '2rem' }}>
              {product.priceInCredits} Credits
            </div>
            {user && (
              <p className="text-muted">Your balance: {user.creditBalance} credits</p>
            )}
          </div>

          {product.stock !== null && product.stock !== undefined && (
            <p className="mb-3">
              <strong>Availability:</strong>{' '}
              {product.stock > 0 ? (
                <span className="text-success">{product.stock} in stock</span>
              ) : (
                <span className="text-danger">Out of stock</span>
              )}
            </p>
          )}

          <div className="mb-4">
            <h3 className="mb-2">Description</h3>
            <p style={{ lineHeight: '1.8' }}>{product.description}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex gap-2">
            <button
              onClick={handlePurchase}
              disabled={!canPurchase}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {!canAfford
                ? 'Insufficient Credits'
                : product.stock === 0
                ? 'Out of Stock'
                : `Redeem for ${product.priceInCredits} Credits`}
            </button>
            <button onClick={() => navigate('/products')} className="btn btn-secondary">
              Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

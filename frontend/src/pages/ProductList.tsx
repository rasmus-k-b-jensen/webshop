import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/products';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll(true);
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (err: any) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canAfford = (price: number) => {
    return user && user.creditBalance >= price;
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading products...</div></div>;
  }

  if (error) {
    return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-4">
          <h1>Available Products</h1>
          {isAuthenticated && user && (
            <div className="credit-badge" style={{ fontSize: '1.25rem' }}>
              Your Credits: {user.creditBalance}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="card text-center">
            <p className="text-muted">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                  />
                ) : (
                  <div className="product-image" />
                )}

                <div className="product-content">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-price">{product.priceInCredits} Credits</div>

                  {product.stock !== null && product.stock !== undefined && (
                    <p className="product-stock">
                      {product.stock > 0 ? (
                        <span className="text-success">
                          {product.stock} available
                        </span>
                      ) : (
                        <span className="text-danger">Out of stock</span>
                      )}
                    </p>
                  )}

                  {isAuthenticated ? (
                    <Link
                      to={`/products/${product.id}`}
                      className={`btn btn-block ${
                        canAfford(product.priceInCredits) && (product.stock === null || product.stock === undefined || product.stock > 0)
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {!canAfford(product.priceInCredits)
                        ? 'Insufficient Credits'
                        : product.stock === 0
                        ? 'Out of Stock'
                        : 'View Details'}
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-primary btn-block">
                      Login to Redeem
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

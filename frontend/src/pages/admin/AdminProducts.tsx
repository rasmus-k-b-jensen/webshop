import React, { useEffect, useState } from 'react';
import { productApi } from '../../api/products';
import { Product } from '../../types';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    priceInCredits: 0,
    stock: null as number | null,
    isActive: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll(false); // Load all products including inactive
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData);
      } else {
        await productApi.create(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl || '',
      priceInCredits: product.priceInCredits,
      stock: product.stock ?? null,
      isActive: product.isActive,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productApi.toggleActive(product.id);
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle product status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      priceInCredits: 0,
      stock: null,
      isActive: true,
    });
  };

  if (loading) {
    return <div className="page"><div className="container loading">Loading products...</div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-4">
          <h1>Manage Products</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
              resetForm();
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {showForm && (
          <div className="card mb-4">
            <h2 className="card-header">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (optional)</label>
                <input
                  type="url"
                  name="imageUrl"
                  className="form-input"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Price (Credits)</label>
                  <input
                    type="number"
                    name="priceInCredits"
                    className="form-input"
                    value={formData.priceInCredits}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock (leave empty for unlimited)</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-input"
                    value={formData.stock || ''}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {product.description.substring(0, 50)}...
                      </p>
                    </td>
                    <td><strong>{product.priceInCredits}</strong> credits</td>
                    <td>
                      {product.stock === null ? (
                        <span className="text-muted">Unlimited</span>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>
                      <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn btn-sm btn-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="btn btn-sm btn-secondary"
                        >
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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

export default AdminProducts;

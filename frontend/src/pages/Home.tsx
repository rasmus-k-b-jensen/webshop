import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="text-center mb-4">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Welcome to Credit Webshop
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            Redeem amazing products using only credits - no money required!
          </p>
        </div>

        <div className="grid grid-3 mt-4">
          <div className="card text-center">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              🎁 Earn Credits
            </h3>
            <p className="text-muted">
              Credits are granted by our team for various services and contributions.
            </p>
          </div>

          <div className="card text-center">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              🛍️ Shop Products
            </h3>
            <p className="text-muted">
              Browse our catalog and redeem products using your available credits.
            </p>
          </div>

          <div className="card text-center">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              📊 Track History
            </h3>
            <p className="text-muted">
              View your complete credit history and past orders anytime.
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin' : '/products'}
              className="btn btn-primary"
              style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}
            >
              {isAdmin ? 'Go to Dashboard' : 'Browse Products'}
            </Link>
          ) : (
            <div className="flex-center gap-2">
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          Credit Webshop
        </Link>

        <ul className="navbar-links">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/products" className="navbar-link">
                  Products
                </Link>
              </li>

              {isAdmin ? (
                <>
                  <li>
                    <Link to="/admin" className="navbar-link">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/products" className="navbar-link">
                      Manage Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/customers" className="navbar-link">
                      Customers
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/orders" className="navbar-link">
                      Orders
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/my-orders" className="navbar-link">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-addresses" className="navbar-link">
                      Addresses
                    </Link>
                  </li>
                  <li>
                    <Link to="/credit-history" className="navbar-link">
                      Credit History
                    </Link>
                  </li>
                  <li>
                    <span className="credit-badge">
                      Credits: {user?.creditBalance || 0}
                    </span>
                  </li>
                </>
              )}

              <li>
                <button onClick={logout} className="btn btn-secondary btn-sm">
                  Logout ({user?.name})
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

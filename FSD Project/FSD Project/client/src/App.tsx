import { useState } from 'react';
import { BrowserRouter, Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppProviders, useAuth, useCart } from './context';
import { AdminPage } from './AdminPage';
import { AdminLoginPage } from './AdminLoginPage';
import { NotificationsPage } from './NotificationsPage';
import {
  AccountPage,
  CartPage,
  CategoriesPage,
  CheckoutPage,
  ContactPage,
  CustomerOrderDetailPage,
  OrderHistoryPage,
  GalleryPage,
  HomePage,
  MenuPage,
  NotFoundPage,
  ReservationPage,
  ReservationHistoryPage,
  StoryPage,
} from './pages';

function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    setError('');
    try {
      await logout();
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Foodie Table, home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span className="brand-name">Foodie <i>Table</i></span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
          <span className="menu-toggle-lines" aria-hidden="true"><i /><i /></span>
        </button>

        <nav id="primary-nav" className={'primary-nav' + (menuOpen ? ' is-open' : '')} aria-label="Main navigation">
          <div className="nav-links">
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <NavLink to="/story" onClick={closeMenu}>Our story</NavLink>
            <NavLink to="/menu" onClick={closeMenu}>Menu</NavLink>
            <NavLink to="/gallery" onClick={closeMenu}>Gallery</NavLink>
            <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
            <NavLink to={user?.role === 'manager' ? '/manager' : '/account/orders'} onClick={closeMenu}>{user?.role === 'manager' ? 'Manager desk' : 'My orders'}</NavLink>
          </div>
          <div className="nav-utilities">
            <NavLink className="utility-link" to="/cart" onClick={closeMenu} aria-label={`Your bag, ${count} items`}>
              Bag <span className="cart-count" aria-live="polite">{count}</span>
            </NavLink>
            <Link className="button button-outline-dark nav-admin" to={user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : '/admin/login'} onClick={closeMenu}>
              {user?.role === 'admin' ? 'Admin desk' : user?.role === 'manager' ? 'Manager desk' : 'Staff login'}
            </Link>
            <NavLink className="utility-link account-link" to="/account" onClick={closeMenu}>
              {user ? user.name.split(' ')[0] : 'Sign in'}
            </NavLink>
            {user && <button className="logout-button" type="button" onClick={() => { closeMenu(); void signOut(); }}>Sign out</button>}
            <Link className="button button-reserve nav-reserve" to="/reservations" onClick={closeMenu}>Reserve a table</Link>
          </div>
        </nav>
      </header>
      {error && <p className="header-error" role="status">{error}</p>}
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="footer-brand" to="/">Foodie <i>Table</i></Link>
          <p>A neighborhood table for good food and the people around it.</p>
        </div>
        <div className="footer-nav-block">
          <p className="footer-label">Find your way</p>
          <Link to="/story">Our story</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-nav-block">
          <p className="footer-label">Come by</p>
          <span>Address to be confirmed</span>
          <span>Opening hours to be confirmed</span>
          <span>Phone number to be confirmed</span>
          <Link to="/reservations">Request a table</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Representative photography by Unsplash contributors. Restaurant photography to be confirmed.</span>
        <span>Foodie Table · A neighborhood kitchen</span>
      </div>
    </footer>
  );
}

function Layout() {
  const location = useLocation();
  return <><Header /><main key={location.pathname}><Outlet /></main><Footer /></>;
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="story" element={<StoryPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="reservations" element={<ReservationPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="account/orders" element={<OrderHistoryPage />} />
            <Route path="account/reservations" element={<ReservationHistoryPage />} />
            <Route path="account/notifications" element={<NotificationsPage />} />
            <Route path="account/orders/:orderId" element={<CustomerOrderDetailPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="manager" element={<AdminPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

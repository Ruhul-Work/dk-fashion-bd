/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { MotionConfig, AnimatePresence } from 'framer-motion';
import { Navbar, ScrollProgress } from './components/Chrome';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TrackOrder from './pages/TrackOrder';
import Offers from './pages/Offers';
import OfferDetails from './pages/OfferDetails';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WebsiteProvider } from './context/WebsiteContext';
import SmoothScroll from './components/SmoothScroll';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import { Toaster as HotToaster } from 'react-hot-toast';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function TrackPageView() {
  const { pathname, search } = useLocation();
  const lastTrackedPage = useRef<string | null>(null);
  const page = `${pathname}${search}`;

  useEffect(() => {
    if (lastTrackedPage.current === page) return;
    lastTrackedPage.current = page;
    window.fbq?.('track', 'PageView');
  }, [page]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem('sg-seen');
  });

  useEffect(() => {
    if (!loading) sessionStorage.setItem('sg-seen', '1');
  }, [loading]);

  useEffect(() => {
    if (!sessionStorage.getItem('sg-seen')) {
      sessionStorage.setItem('sg-seen', '1');
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <TrackPageView />
        <AuthProvider>
          <WebsiteProvider>
            <CartProvider>
              <ScrollToTop />
              {loading && <Preloader onDone={() => setLoading(false)} />}
              <Cursor />
              <div className="paper-grain relative min-h-screen">
                <SmoothScroll>
                  <ScrollProgress />
                  <Navbar />
                  <main className="flex-grow">
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/offers" element={<Offers />} />
                        <Route path="/offers/:slug" element={<OfferDetails />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/order/:id" element={<OrderDetail />} />
                        <Route path="/track-order" element={<TrackOrder />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                      </Routes>
                    </AnimatePresence>
                  </main>
                  <Footer />
                </SmoothScroll>
                <HotToaster position="top-right" reverseOrder={false} />
              </div>
            </CartProvider>
          </WebsiteProvider>
        </AuthProvider>
      </Router>
    </MotionConfig>
  );
}

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWebsite } from '../context/WebsiteContext';
import { SERVER_URL } from '../services/api';
import { cn } from '../lib/utils';
import SearchModal from './SearchModal';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { settings } = useWebsite();
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-[14px] font-medium tracking-[0.5px] uppercase transition-all pb-1 border-b-[2px] ${
      isActive ? 'border-brand-text text-brand-text' : 'border-transparent text-gray-600 hover:text-brand-text'
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `block px-4 py-2.5 text-sm font-medium tracking-wide uppercase transition-colors ${
      isActive ? 'text-brand-text border-l-4 border-brand-text bg-gray-50' : 'text-gray-600 hover:text-brand-text hover:bg-gray-50 border-l-4 border-transparent'
    }`;
  };
  return (
    <>
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* App Status Bar */}
      {/* <div className="bg-brand-bg text-[10px] text-gray-400 uppercase tracking-widest px-10 py-1.5 flex justify-between border-b border-gray-100">
        <span>Service.API.tsx Connected</span>
        <span>v1.0.4 Pre-Release</span>
      </div> */}

      <nav className="sticky top-0 z-50  border-b border-gray-100 py-5 px-2 bg-brand-bg max-w-full"> {/* bg-brand-bg  */}
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brand-text p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-lg font-medium tracking-widest uppercase flex items-center gap-2">
              {settings?.logo ? (
                <img
                  src={settings.logo.startsWith('http') ? settings.logo : `${SERVER_URL}${settings.logo}`}
                  alt={settings.company_name || 'Smart Garments'}
                  className="h-8 w-auto object-contain "
                />

              ) : (
                settings?.company_name || 'Smart Garments'
              )} <span className='hidden text-xl font-medium lg:block'>{settings?.company_name}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-[30px] items-center mt-1">
            <Link to="/" className={getLinkClass('/')}>Home</Link>
            <Link to="/shop" className={getLinkClass('/shop')}>Shop</Link>
            <Link to="/categories" className={getLinkClass('/categories')}>Categories</Link>
            <Link to="/offers" className={getLinkClass('/offers')}>Offers</Link>
            <Link to="/track-order" className={getLinkClass('/track-order')}>Track Order</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-[20px]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className=" sm:block hover:text-brand-accent transition-colors"
            >
              <Search size={20} />
            </button>
            <Link to={user ? "/profile" : "/login"} className="relative">
              <User size={20} />
            </Link>
            <Link to="/cart" className="relative group">
              <ShoppingBag size={20} className="group-hover:text-brand-accent transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-text text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-brand-bg border-b border-gray-200 absolute w-full top-16 z-50 sticky ">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className={getMobileLinkClass('/')} onClick={() => setIsMenuOpen(false)}>HOME</Link>
            <Link to="/shop" className={getMobileLinkClass('/shop')} onClick={() => setIsMenuOpen(false)}>SHOP ALL</Link>
            <Link to="/categories" className={getMobileLinkClass('/categories')} onClick={() => setIsMenuOpen(false)}>CATEGORIES</Link>
            <Link to="/offers" className={getMobileLinkClass('/offers')} onClick={() => setIsMenuOpen(false)}>OFFERS</Link>
            <Link to="/track-order" className={getMobileLinkClass('/track-order')} onClick={() => setIsMenuOpen(false)}>TRACK ORDER</Link>
          </div>
        </div>
      )}
    </>
  );
}

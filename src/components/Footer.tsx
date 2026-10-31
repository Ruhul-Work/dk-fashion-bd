import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWebsite } from '../context/WebsiteContext';
import { lenisGo } from './SmoothScroll';
import { assetUrl } from '../lib/api';

export function Footer() {
  const { settings } = useWebsite();
  const navigate = useNavigate();
  const goHomeSection = (id: string) => {
    navigate('/');
    window.setTimeout(() => lenisGo(`#${id}`), 450);
  };
  const company = settings?.company_name || 'Smart Garments';
  const email = settings?.email || 'smartgarments@example.com';
  const phone = settings?.phone || '';

  return (
    <footer className="relative overflow-hidden bg-moss pt-16 text-ivory">
      <div className="relative flex overflow-hidden pb-10">
        <motion.div className="flex animate-marquee-slow">
          {[0, 1].map((c) => (
            <span
              key={c}
              aria-hidden={c === 1}
              className="shrink-0 whitespace-nowrap font-display text-[16vw] font-semibold leading-none text-outline opacity-40 sm:text-[10vw]"
            >
              {company.toUpperCase()} ·
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 border-t border-ivory/10 px-4 py-12 sm:grid-cols-3 lg:px-8">
        <div>
          <div className="inline-block rounded-2xl bg-ivory p-3 shadow-soft">
            {assetUrl(settings?.logo) ? (
              <img src={assetUrl(settings?.logo)} alt={company} className="h-10 w-auto object-contain" />
            ) : (
              <span className="font-display text-2xl text-moss">{company}</span>
            )}
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/60">
            {settings?.address || 'A thoughtful atelier crafting garments with care.'}
          </p>
        </div>
        <div className="text-sm text-ivory/70">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-ivory/40">Navigate</p>
          <ul className="flex flex-col gap-2">
            <li><Link className="transition-colors hover:text-caramel" to="/">Home</Link></li>
            <li><Link className="transition-colors hover:text-caramel" to="/shop">Shop</Link></li>
            <li><button className="transition-colors hover:text-caramel" onClick={() => goHomeSection('categories')}>Collections</button></li>
            <li><button className="transition-colors hover:text-caramel" onClick={() => goHomeSection('lookbook')}>Lookbook</button></li>
            {/* <li><button className="transition-colors hover:text-caramel" onClick={() => goHomeSection('soon')}>Shopee</button></li> */}
          </ul>
        </div>
        <div className="text-sm text-ivory/70">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-ivory/40">Elsewhere</p>
          <ul className="flex flex-col gap-2">
            <li><a href={`mailto:${email}`} className="transition-colors hover:text-caramel">{email}</a></li>
            {phone && <li><a href={`tel:${phone}`} className="transition-colors hover:text-caramel">{phone}</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/40">
        © {new Date().getFullYear()} {company} — crafted with care ·{' '}
        <a href="https://bintelfuturetech.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-caramel">
          Developed by Bintel Future Tech
        </a>
      </div>
    </footer>
  );
}

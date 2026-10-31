import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Product, SERVER_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { QuickAddModal } from './QuickAddModal';
import { useWebsite } from '../context/WebsiteContext';
import { CurtainImage } from './motion-kit';

interface ProductCardProps {
  product: Product;
  className?: string;
  key?: React.Key;
  tag?: string;
  imageClass?: string;
  stepped?: boolean;
  index?: number;
}

function trimString(str: string, len: number = 20) {
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

export function ProductCard({ product, className, index = 0, tag, imageClass, stepped = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings } = useWebsite();

  const hasDiscount = product.mrp && Number(product.mrp) > Number(product.offer_price ?? product.price);
  const discountAmount = hasDiscount ? Number(product.mrp) - Number(product.offer_price ?? product.price) : 0;
  const discountPercentage = hasDiscount ? Math.round((discountAmount / Number(product.mrp)) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.has_variants) {
      setIsModalOpen(true);
    } else {
      addToCart(product);
    }
  };

  const price = Number(product.offer_price ?? product.price ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const currency = settings?.currency_code || '';

  const imageSrc = product.thumbnail_image?.startsWith('http')
    ? product.thumbnail_image
    : `${SERVER_URL}${product.thumbnail_image || ''}`;

  const easeSoft: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

  return (
    <>
      <motion.div
        className={cn('group relative overflow-hidden rounded-[1.6rem] img-fallback shadow-soft transition-shadow duration-500 hover:shadow-lift', className)}
        initial={{ opacity: 0, y: 44 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-4% 0px' }}
        transition={{ delay: (index % 3) * 0.09, duration: 0.6, ease: easeSoft }}
        whileHover={{ y: -6 }}
      >
        <Link to={`/product/${product.slug}`} className="block" data-cursor="hover">
          {imageSrc ? (
            <CurtainImage
              src={imageSrc}
              alt={product.name}
              className={"w-full " + (imageClass || "aspect-[3/3.8]")}
              imgClassName="transition-transform duration-700 group-hover:scale-105"
              delay={(index % 3) * 0.07}
            />
          ) : (
            <div className="w-full aspect-[3/3.8]" />
          )}

          {product.isNew && (
            <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-ivory/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-caramel-deep shadow-soft">
              New
            </span>
          )}

          {hasDiscount && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-eucalyptus px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-moss shadow-soft">
              −{discountPercentage}%
            </span>
          )}

          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute -inset-y-20 left-[-30%] w-1/2 rotate-12 bg-gradient-to-r from-transparent via-ivory/25 to-transparent transition-transform duration-1000 group-hover:translate-x-[420%]" />
          </div>

          <div className="absolute inset-x-2 bottom-2 z-10 rounded-xl bg-ivory/95 px-3 py-2.5 backdrop-blur-md transition-transform duration-500 lg:inset-x-3 lg:bottom-3 lg:translate-y-16 lg:px-4 lg:py-3 lg:group-hover:translate-y-0">
            <p className="font-display text-[13px] leading-snug sm:text-base text-moss">
              {trimString(product.name, 20)}
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-olive">
                {product.category }
              </span>
              <span className="shrink-0 text-sm font-medium text-moss">
                {currency} {price.toFixed(0)}
                {hasDiscount && (
                  <span className="ml-2 text-xs line-through text-olive/70">{currency} {mrp.toFixed(0)}</span>
                )}
              </span>
            </div>
          </div>
        </Link>

        <button
          onClick={handleQuickAdd}
          className="absolute right-4 bottom-24 z-20 hidden rounded-full bg-moss px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory opacity-0 transition-all duration-300 group-hover:opacity-100 md:inline-flex hover:bg-caramel"
          aria-label="Quick add to cart"
        >
          <Plus size={14} className="mr-1" /> Quick add
        </button>
      </motion.div>

      <QuickAddModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
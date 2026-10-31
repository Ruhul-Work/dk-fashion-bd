import { Link } from 'react-router-dom';
import { Tag, Calendar, Gift, Percent, Truck, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { SERVER_URL } from '../services/api';

export interface Offer {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  offer_type: 'gift' | 'discount' | 'shipping' | 'bundle';
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export function OfferCard({ offer }: { offer: Offer }) {
  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'gift': return <Gift size={22} />;
      case 'discount': return <Percent size={22} />;
      case 'shipping': return <Truck size={22} />;
      case 'bundle': return <Package size={22} />;
      default: return <Tag size={22} />;
    }
  };

  const getOfferColor = (type: string) => {
    switch (type) {
      case 'gift': return 'bg-eucalyptus/20 text-eucalyptus-deep border-eucalyptus/40';
      case 'discount': return 'bg-caramel/15 text-caramel-deep border-caramel/40';
      case 'shipping': return 'bg-olive/15 text-olive border-olive/40';
      case 'bundle': return 'bg-moss/15 text-moss border-moss/40';
      default: return 'bg-sand text-olive border-hairline';
    }
  };

  return (
    <Link
      to={`/offers/${offer.slug}`}
      state={{ offer }}
      className="block h-full bg-ivory border border-hairline hover:border-caramel hover:shadow-lift transition-all duration-300 rounded-[1.6rem] overflow-hidden group flex flex-col"
    >
      {offer.banner_image ? (
        <div className="w-full h-48 sm:h-56 overflow-hidden bg-sand border-b border-hairline relative">
          <div className="absolute inset-0 bg-moss/10 group-hover:bg-transparent transition-colors z-10" />
          <img
            src={offer.banner_image.startsWith('http') ? offer.banner_image : `${SERVER_URL}${offer.banner_image}`}
            alt={offer.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute top-4 left-4 z-20">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-soft backdrop-blur", getOfferColor(offer.offer_type))}>
              {offer.offer_type} Offer
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 flex items-center justify-center border-b border-hairline relative bg-sand">
          <div className={cn("p-4 rounded-full bg-ivory shadow-soft border", getOfferColor(offer.offer_type))}>
            {getOfferIcon(offer.offer_type)}
          </div>
          <div className="absolute top-4 left-4 z-20">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-soft bg-ivory/95 backdrop-blur", getOfferColor(offer.offer_type))}>
              {offer.offer_type} Offer
            </span>
          </div>
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-medium uppercase tracking-wider text-moss group-hover:text-caramel-deep transition-colors mb-3">
          {offer.name}
        </h3>

        {offer.description && (
          <p className="text-sm text-olive line-clamp-2 mb-6 flex-grow">
            {offer.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-hairline">
          <div className="flex items-center text-xs font-medium text-olive">
            <Calendar size={14} className="mr-1.5 text-olive/70" />
            Valid till {new Date(offer.end_date).toLocaleDateString()}
          </div>
          <span className="text-xs font-bold text-caramel-deep uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform">
            Explore <span className="ml-1 text-lg leading-none">&rarr;</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

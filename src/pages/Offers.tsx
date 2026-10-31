import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { OfferCard, Offer } from '../components/OfferCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await api.getOffers();
        setOffers(data);
      } catch (error) {
        console.error("Failed to load offers:", error);
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers();
  }, []);

  if (loadingOffers) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-hairline border-t-caramel rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <Breadcrumbs items={[{ label: 'Offers', path: '/offers' }]} />
      {/* Hero Section */}
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-hairline rounded-[1.6rem] bg-ivory py-16 px-4 sm:px-6 lg:px-8 text-center shadow-soft">
          <h1 className="font-display text-3xl tracking-tight text-moss sm:text-4xl uppercase mb-4">
            Exclusive <span className="text-caramel">Offers</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm text-olive uppercase tracking-widest">
            Discover our latest deals and special promotions just for you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {offers.length === 0 ? (
          <div className="text-center py-20 border border-hairline rounded-[1.6rem] bg-ivory">
            <Tag className="mx-auto h-12 w-12 text-olive mb-4" />
            <h3 className="text-lg font-medium text-moss uppercase tracking-wider">No active offers</h3>
            <p className="mt-2 text-sm text-olive">Check back later for exciting new promotions and discounts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                key={offer.id}
              >
                <OfferCard offer={offer} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

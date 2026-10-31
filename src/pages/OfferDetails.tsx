import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { api, Product, SERVER_URL } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Tag, Calendar, Gift, Percent, Truck, Package, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface Offer {
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

export default function OfferDetails() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<Offer | null>(location.state?.offer || null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOffer, setLoadingOffer] = useState(!offer);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!offer && slug) {
      const fetchOffer = async () => {
        try {
          const offers = await api.getOffers();
          const foundOffer = offers.find((o: Offer) => o.slug === slug);
          if (foundOffer) {
            setOffer(foundOffer);
          } else {
            navigate('/offers');
          }
        } catch (error) {
          console.error("Failed to load offers:", error);
          navigate('/offers');
        } finally {
          setLoadingOffer(false);
        }
      };
      fetchOffer();
    }
  }, [offer, slug, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!slug) return;
      setLoadingProducts(true);
      try {
        const data = await api.getOfferProducts(slug);

        const formattedProducts = data.map((p: any) => ({
          ...p,
          images: p.images || [p.image_url || 'https://picsum.photos/seed/furniture/800/600'],
          specs: p.specs || {},
          category: p.category?.name || p.category || 'Uncategorized'
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Failed to load products for offer:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [slug]);

  const getOfferColor = (type: string) => {
    switch (type) {
      case 'gift': return 'bg-sand text-caramel-deep border-hairline';
      case 'discount': return 'bg-caramel/10 text-caramel-deep border-caramel/30';
      case 'shipping': return 'bg-sage text-moss border-hairline';
      case 'bundle': return 'bg-sand text-moss border-hairline';
      default: return 'bg-sand text-olive border-hairline';
    }
  };

  const offerIcon = (type: string) => {
    switch (type) {
      case 'gift': return Gift;
      case 'discount': return Percent;
      case 'shipping': return Truck;
      case 'bundle': return Tag;
      default: return Tag;
    }
  };

  if (loadingOffer) {
    return (
      <main className="pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-hairline border-t-caramel" />
          </div>
        </div>
      </main>
    );
  }

  if (!offer) {
    return null;
  }

  const Icon = offerIcon(offer.offer_type);

  return (
    <main className="pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <Breadcrumbs items={[{ label: 'Offers', path: '/offers' }, { label: offer.name, path: `/offers/${offer.slug}` }]} />

        <Link to="/offers" className="mt-6 inline-flex items-center text-xs font-medium uppercase tracking-[0.18em] text-olive transition-colors hover:text-caramel-deep">
          <ArrowLeft size={16} className="mr-2" />
          Back to all offers
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 rounded-[1.6rem] border border-hairline bg-ivory p-6 shadow-soft sm:p-10"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest", getOfferColor(offer.offer_type))}>
                  <Icon size={14} />
                  {offer.offer_type} Offer
                </span>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wider text-moss sm:text-3xl">
                {offer.name}
              </h2>
              {offer.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-olive sm:text-base">
                  {offer.description}
                </p>
              )}

              <div className="mt-5 inline-flex items-center rounded-full border border-hairline bg-sand px-4 py-2 text-sm font-medium text-olive">
                <Calendar size={16} className="mr-2 text-caramel-deep" />
                Valid until {new Date(offer.end_date).toLocaleDateString()}
              </div>
            </div>

            {offer.banner_image && (
              <div className="w-full shrink-0 md:w-1/3">
                <img
                  src={offer.banner_image.startsWith('http') ? offer.banner_image : `${SERVER_URL}${offer.banner_image}`}
                  alt={offer.name}
                  className="w-full rounded-[1.2rem] border border-hairline object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>

        <div className="mt-10 flex items-center justify-between">
          <h3 className="font-display text-lg uppercase tracking-widest text-moss">
            Applicable Products {products.length > 0 && `(${products.length})`}
          </h3>
        </div>

        {loadingProducts ? (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-4 aspect-[4/5] rounded-lg bg-sand" />
                <div className="mb-2 h-4 w-3/4 rounded bg-sand" />
                <div className="h-4 w-1/2 rounded bg-sand" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.6rem] border border-hairline bg-ivory py-20 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-olive" />
            <h3 className="text-sm font-medium uppercase tracking-widest text-moss">No products found</h3>
            <p className="mt-2 text-sm text-olive">
              There are currently no products available under this offer.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Category, SERVER_URL } from '../services/api';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { motion } from 'motion/react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(data => {
      setCategories(data);
      setLoading(false);
    });
    document.title = 'Categories | Smart Garments';
   
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <Breadcrumbs items={[{ label: 'Categories', path: '/categories' }]} />

      <header className="mb-16">
        <h1 className="text-4xl font-medium tracking-tight mb-4 uppercase">Our Collections</h1>
        <p className="text-gray-600 max-w-lg text-sm uppercase tracking-widest leading-loose">
          Explore our curated selections of smart garments and minimalist essentials.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Link to={`/shop?category=${cat.slug}`} className="group block relative overflow-hidden bg-brand-bg geometric-shadow h-full">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={cat.icon ? (cat.icon.startsWith('http') ? cat.icon : `${SERVER_URL}${cat.icon}`) : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800'}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-black/80 to-transparent text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-medium uppercase tracking-tight mb-2">{cat.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-500">View Collection</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Category, SERVER_URL } from '../services/api';
import { cn } from '../lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className={cn("group relative aspect-[4/5] overflow-hidden   rounded-md border-indigo-300 shadow-lg  bg-gray-200 block  hover:border-brand-accent transition-colors", className)}
    >
      <img
        src={`${SERVER_URL}${category.icon}`}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <span className="bg-white px-4 py-2 text-[12px] font-medium uppercase tracking-[0.5px] w-fit text-brand-text geometric-shadow transition-colors group-hover:bg-brand-accent">
          {category.name}
        </span>
      </div>
    </Link>
  );
}


import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-[13px] text-gray-500 font-normal uppercase tracking-[0.15em] mb-10 overflow-x-auto whitespace-nowrap pb-2">
      <Link to="/" className="hover:text-brand-text transition-colors">Home</Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight size={10} className="flex-shrink-0" />
          <Link
            to={item.path}
            className={`hover:text-brand-text transition-colors ${index === items.length - 1 ? 'text-brand-text' : ''}`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, Product, SERVER_URL, Size } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { useWebsite } from '../context/WebsiteContext';
interface QuickAddModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [parentproduct, setParentproduct] = useState(product);
    const { settings } = useWebsite();

  const colors = new Set<string>();
  const sizes = new Set<string>();

  // async function fetch() {
  //     const data = await api.getProductById(product.slug);
  //     product = data;
  //   }

  //  if(isOpen){
  //  fetch();  
  //  }

  useEffect(() => {
    async function fetch() {
      const data = await api.getProductById(product.slug);
      setParentproduct(data);
      // console.log(product);

    }
    fetch();
  }, [])

  if (parentproduct && parentproduct.children) {
    parentproduct.children.forEach((item: any) => {
      if (item.color?.name) colors.add(item.color.name);
      if (item.size?.name) sizes.add(item.size.name);
    });
    // console.log(sizes);
  }







  useEffect(() => {
    if (isOpen) {
      if (sizes.size > 0) {
        setSelectedSize([...sizes][0]);
      } else {
        setSelectedSize(null);
      }

      if (colors.size > 0) {
        setSelectedColor([...colors][0]);
        // console.log(colors);
      } else {
        setSelectedColor('');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, product]);

  const handleConfirm = () => {
    if (sizes.size > 0 && !selectedSize) {
      return toast.error('Please select a size');
    }
    if (colors.size > 0 && !selectedColor) {
      return toast.error('Please select a color');
    }

    let p = null;
    if (parentproduct.has_variants) {
      if (selectedSize && selectedColor) {
        p = parentproduct.children.find(item => item.size.name == selectedSize && item.color.name == selectedColor);
      } else if (selectedColor) {
        p = parentproduct.children.find(item => item.color.name == selectedColor);
      } else if (selectedSize) {
        p = parentproduct.children.find(item => item.size.name == selectedSize);
      }
      if (!p) {
        toast.error('This variant not available');
        return;
      }
    } else {
      p = product;
    }
    // let productData = null;
    // async function fetch() {
    //   // const data = await api.getProductById(p.slug);
    //   productData = await api.checkOffer(p.slug); 
    //   // console.log(product);

    // }
    // await fetch(); 

    addToCart(p, selectedSize || undefined, selectedColor || undefined);
    onClose();
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[70] px-4"
          >
            <div className="bg-ivory shadow-lift overflow-hidden p-8 border border-hairline rounded-[1.6rem]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-sand flex-shrink-0 overflow-hidden rounded-xl">
                    <img src={`${SERVER_URL}${product.thumbnail_image}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-tight mb-1 text-moss">{product.name}</h3>
                    <p className="text-xs font-medium text-caramel-deep">{settings?.currency_code} {product.offer_price??product.price}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-sand transition-colors rounded-full text-olive hover:text-moss">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {sizes.size > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-olive font-medium mb-3">Select Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {([...sizes]).map((size: any) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2.5 text-[10px] uppercase tracking-widest border transition-all rounded-full ${selectedSize === size ? 'bg-moss text-ivory border-moss' : 'border-hairline text-moss hover:border-caramel hover:text-caramel-deep'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {colors.size > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-olive font-medium mb-3">Select Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {([...colors]).map((color: any) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2.5 text-[10px] uppercase tracking-widest border transition-all rounded-full ${selectedColor === color ? 'bg-moss text-ivory border-moss' : 'border-hairline text-moss hover:border-caramel hover:text-caramel-deep'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  className="w-full rounded-full bg-moss text-ivory py-4 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-caramel transition-all flex items-center justify-center gap-2 group mt-4"
                >
                  <ShoppingBag size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                  Add to Bag
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}

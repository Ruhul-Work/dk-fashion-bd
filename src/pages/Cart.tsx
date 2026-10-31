import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, X, ArrowLeft, ShoppingBag, Gift } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SERVER_URL } from '../services/api';
import { useWebsite } from '../context/WebsiteContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { settings } = useWebsite();

  function trimString(str: string, len: number = 16) {
    if (window.innerWidth > 768) {
      return str;
    }
    return str.length > len ? str.slice(0, len) + '...' : str;
  }

  document.title = 'Cart | Smart Garments';

  if (cart.length === 0) {
    return (
      <div className="paper-grain mx-auto max-w-6xl px-4 py-28 text-center">
        <div className="mb-8 flex justify-center text-olive/30">
          <ShoppingBag size={80} strokeWidth={1} />
        </div>
        <h2 className="font-display text-3xl text-moss">Your bag is empty</h2>
        <p className="mt-3 text-olive">Looking for something specific? Our core collections are a good place to start.</p>
        <Link to="/shop" className="mt-10 inline-block rounded-full bg-moss px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-caramel">
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="paper-grain mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <Breadcrumbs items={[{ label: 'Shopping Bag', path: '/cart' }]} />

      <h1 className="font-display text-4xl tracking-tight text-moss">Shopping <span className="text-caramel">Bag</span></h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {cart.map((item) => (
            <div key={`${item.id}-${item.selectedSize?.id || 'none'}-${item.selectedColor || 'none'}`} className="flex flex-col gap-3 relative">
              <div className="group relative flex gap-3 overflow-hidden rounded-[1.6rem] border border-hairline bg-ivory p-4 shadow-soft transition-all hover:border-caramel hover:shadow-lift sm:gap-5 sm:p-5">
                <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl img-fallback sm:h-32 sm:w-24">
                  <img src={`${SERVER_URL}${item.thumbnail_image}`} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-sm text-moss uppercase tracking-[0.05em] sm:text-base">{trimString(item.name, 35)}</h3>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-olive sm:text-[11px]">
                        {settings?.currency_code} {item.offer_price ?? item.price} per unit
                      </p>
                      {(item.selectedSize || item.selectedColor) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-caramel-deep sm:gap-4 sm:text-[10px]">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="h-9 w-9 rounded-full border border-hairline text-olive transition-colors hover:border-caramel hover:text-caramel-deep" aria-label="Remove">
                      <X size={16} className="mx-auto" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div className="flex items-center rounded-full border border-hairline bg-sand px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)} className="p-1 text-olive transition-colors hover:text-moss" aria-label="Decrease">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium text-moss">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)} className="p-1 text-olive transition-colors hover:text-moss" aria-label="Increase">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-display text-lg text-moss">
                      {settings?.currency_code} {(Number(item.offer_price ?? item.price) * item.quantity).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>

              {item.freeProducts && item.freeProducts.map((p) => (
                <div
                  key={p.id}
                  className="ml-10 flex gap-4 rounded-[1.3rem] border border-dashed border-eucalyptus bg-eucalyptus/10 p-4 transition-all duration-300 hover:shadow-soft md:ml-16"
                >
                  <div className="absolute" />
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-hairline img-fallback">
                    <img src={`${SERVER_URL}${p.thumbnail_image}`} alt={p.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-eucalyptus-deep px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-ivory shadow-soft">
                          <Gift size={10} />
                          Free Gift
                        </span>
                      </div>
                      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-moss">{p.name}</h3>
                      {(p.selectedSize || p.selectedColor) && (
                        <div className="mt-1 flex gap-4 text-[10px] uppercase tracking-[0.18em] text-olive">
                          {p.selectedSize && <span>Size: {p.selectedSize}</span>}
                          {p.selectedColor && <span>Color: {p.selectedColor}</span>}
                        </div>
                      )}
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-olive">
                        Quantity: {p.quantity * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-olive transition-colors hover:text-moss">
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs font-medium uppercase tracking-[0.2em] text-caramel-deep transition-colors hover:text-caramel"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-[1.6rem] border border-hairline bg-ivory p-8 shadow-soft">
            <h2 className="font-display text-xl text-moss">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm text-olive">
                <span>Subtotal</span>
                <span>{settings?.currency_code} {cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-olive">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="my-4 h-px w-full bg-hairline" />
              <div className="flex justify-between font-display text-xl text-moss">
                <span>Total</span>
                <span>{settings?.currency_code} {cartTotal}</span>
              </div>
            </div>
            <Link to="/checkout" className="mt-8 block w-full rounded-full bg-moss px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-caramel">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, FormEvent } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, X, Gift } from 'lucide-react';
import { api, SERVER_URL } from '../services/api';
import { useWebsite } from '../context/WebsiteContext';
import { toast } from 'react-hot-toast';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'success'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { settings } = useWebsite();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    note: '',
    name: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const u: any = user;
      setFormData(prev => ({
        ...prev,
        email: u.email || u.user_email || u.mail || prev.email,
        phone: u.phone || u.user_phone || u.mobile || prev.phone,
        name: u.name || u.full_name || u.user_name || prev.name,
      }));
    }
    //  if(!user){
    // toast.error('Please login to place order.');
    // navigate("/login");
  // }
  }, [user]);

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    let discount = 0;
    if (appliedCoupon.discount_type === 'flat') {
      discount = parseFloat(appliedCoupon.discount);
    } else if (appliedCoupon.discount_type === 'percentage') {
      discount = (cartTotal * parseFloat(appliedCoupon.discount)) / 100;
    }

    if (appliedCoupon.max_discount && discount > parseFloat(appliedCoupon.max_discount)) {
      discount = parseFloat(appliedCoupon.max_discount);
    }
    return discount;
  };

  const discountAmount = calculateDiscount();
  const shippingCharge = (settings?.free_shipping_amount <= cartTotal) ? 0 : settings?.shipping_charge || 0; 
  const finalTotal = cartTotal + shippingCharge - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const response = await api.getCoupon(couponCode);
      if (response.status && response.data) {
        const coupon = response.data;
        
        // Basic validation
        const now = new Date();
        const startDate = new Date(coupon.start_date);
        const endDate = new Date(coupon.end_date);

        if (parseInt(coupon.is_active) !== 1 && coupon.is_active !== true) {
          throw new Error('This coupon is currently inactive.');
        }
        if (now < startDate) {
          throw new Error('This coupon is not yet valid.');
        }
        if (now > endDate) {
          throw new Error('This coupon has expired.');
        }
        if (cartTotal < parseFloat(coupon.min_purchase)) {
          throw new Error(`Minimum purchase of ${settings?.currency_code} ${coupon.min_purchase} required for this coupon.`);
        }

        setAppliedCoupon(coupon);
        setCouponError('');
        toast.success(`Coupon "${coupon.code}" applied!`);
      } else {
        const msg = response.message || 'Invalid coupon code.';
        setCouponError(msg);
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to apply coupon.';
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsPaymentModalOpen(true);
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    // if (!transactionId.trim()) {
    //   toast.error('Transaction ID is required');
    //   return;
    // }
    setIsLoading(true);
    setError('');
    
    const orderData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      shipping_address: `${formData.address}, ${formData.city}, ${formData.zip}`,
      city: formData.city,
      postal_code: formData.zip,
      note: formData.note,
      items: cart.map(item => ({
        id: item.id,
        qty: item.quantity,
        size_id: item.selectedSize?.id,
        color: item.selectedColor
      })),
      coupon_id: appliedCoupon?.id??null,
      // transaction_id: transactionId.trim()
    };

    try {
      const ord = await api.placeOrder(orderData);
    if(ord.success){

      setOrder(ord);
      setIsPaymentModalOpen(false);
      setStep('success');
      clearCart();
      toast.success('Order placed successfully!');
    }
    } catch (err: any) {
      const msg = err.message || 'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

 

  if (step === 'success') {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-40 pb-32 text-center">
        <div className="mb-8 flex justify-center text-caramel">
          <CheckCircle2 size={80} strokeWidth={1} />
        </div>
        <h2 className="font-display text-4xl text-moss mb-4 uppercase tracking-tight">
          Ordered <span className="text-caramel">Successfully</span>
        </h2>
        <p className="text-olive mb-12 max-w-sm mx-auto font-normal text-xs uppercase tracking-widest leading-loose">
          Your order <span className="font-semibold text-moss">{order?.order_number}</span> has been acknowledged by Smart Garments Ltd. We are processing your request with precision.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link to="/profile" className="inline-block rounded-full bg-moss text-ivory px-10 py-4 text-xs font-medium uppercase tracking-widest hover:bg-caramel transition-all">
              View My Orders
            </Link>
          ) : (
            <Link to={`/track-order?orderId=${order?.order_number}`} className="inline-block rounded-full bg-moss text-ivory px-10 py-4 text-xs font-medium uppercase tracking-widest hover:bg-caramel transition-all">
              Track Order
            </Link>
          )}
          <Link to="/" className="inline-block rounded-full border border-hairline text-moss px-10 py-4 text-xs font-medium uppercase tracking-widest hover:border-caramel transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-medium mb-8">Your bag is empty</h2>
        <Link to="/shop" className="text-moss font-medium underline underline-offset-4">Return to Shop</Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Info */}
          <div className="lg:col-span-7">
            <h1 className="font-display text-4xl tracking-tight uppercase text-moss mb-12">Check<span className="text-caramel">out</span></h1>
            <form onSubmit={handlePlaceOrder} className="space-y-12">
              {error && <p className="text-red-500 text-[10px] uppercase tracking-widest">{error}</p>}
              
              <section>
                <h3 className="text-xs font-medium uppercase tracking-widest mb-6 pb-2 border-b border-hairline">Contact Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email Address"
                    required
                    className="w-full rounded-2xl bg-sand border border-hairline px-4 py-3 text-sm focus:border-caramel outline-none transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="tel"
                    name="tel"
                    autoComplete="tel"
                    placeholder="Phone Number"
                    required
                    className="w-full rounded-2xl bg-sand border border-hairline px-4 py-3 text-sm focus:border-caramel outline-none transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium uppercase tracking-widest mb-6 pb-2 border-b border-hairline">Shipping Details</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Full Name"
                    required
                    className="w-full rounded-2xl bg-sand border border-hairline px-4 py-3 text-sm focus:border-caramel outline-none transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    placeholder="Shipping Address"
                    required
                    className="w-full rounded-2xl bg-sand border border-hairline px-4 py-4 text-sm focus:border-caramel outline-none transition-colors"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <input
                    type="text"
                    name="city"
                    autoComplete="address-level2"
                    placeholder="City"
                    required
                    className="w-full rounded-2xl bg-sand border border-hairline px-4 py-3 text-sm focus:border-caramel outline-none transition-colors"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                  <input
                    type="text"
                    name="postal-code"
                    autoComplete="postal-code"
                    placeholder="Postal Code"
                    className="w-full rounded-2xl bg-sand border border-hairline px-4 py-3 text-sm focus:border-caramel outline-none transition-colors"
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-medium uppercase tracking-widest mb-6 pb-2 border-b border-hairline">Additional Note</h3>
                <textarea
                  placeholder="Note for delivery"
                  className="w-full rounded-2xl bg-sand px-4 py-4 text-sm ring-1 ring-hairline focus:ring-caramel outline-none min-h-[100px]"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                />
              </section>

              <button
                type="submit"
                disabled={isLoading}
                // onClick={handlePlaceOrder}
                className="w-full rounded-full bg-moss text-white py-6 text-xs font-medium uppercase tracking-[0.2em] hover:bg-caramel transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing Order...' : `Confirm Order — ${settings?.currency_code} ${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-ivory rounded-2xl border border-hairline p-5 md:p-8 sticky top-24 geometric-shadow">
              <h2 className="text-xs font-medium uppercase tracking-[0.15em] mb-8">Your Bag ({cart.length})</h2>
              <div className="space-y-6 mb-8 mt-4 max-h-96 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize?.id || 'none'}-${item.selectedColor || 'none'}`} className="flex flex-col gap-2">
                    {/* Main product row */}
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-sand flex-shrink-0">
                        <img src={`${SERVER_URL}${item.thumbnail_image}`} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium uppercase tracking-wide">{item.name}</h4>
                        <p className="text-[10px] font-medium text-olive mt-1 uppercase tracking-widest">
                          {settings?.currency_code} {item.offer_price??item.price} × {item.quantity}
                        </p>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[9px] font-medium text-olive mt-0.5 uppercase tracking-[0.1em]">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedSize && item.selectedColor && ' | '}
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>
                        )}
                      </div>
                      <p className="text-sm md:text-md font-medium">{settings?.currency_code} {(item.offer_price??item.price) * item.quantity}</p>
                    </div>

                    {/* Free product cards */}
                    {item.freeProducts && item.freeProducts.map(p => (
                      <div
                        key={p.id}
                        className="ml-6 flex gap-3 px-3 py-1 border border-dashed border-emerald-300 bg-emerald-50/50 rounded-[1.6rem] relative"
                      >
                        {/* Tree connector line */}
                        <div className="absolute -top-2 left-[-12px] w-[12px] h-[26px] border-l-2 border-b-2 border-dashed border-hairline rounded-bl-lg pointer-events-none" />
                        <div className="w-12 h-16 flex-shrink-0 bg-sand overflow-hidden rounded border border-emerald-100">
                          <img src={`${SERVER_URL}${p.thumbnail_image}`} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider mb-1"> 
                              <Gift size={10} />
                              Free Gift
                            </span>
                            <h5 className="text-[10px] font-semibold text-moss uppercase tracking-widest">{p.name}  </h5>
                            {(p.selectedSize || p.selectedColor) && (
                              <p className="text-[9px] text-red-700 uppercase tracking-widest mt-0.5">
                                {p.selectedSize && `Size: ${p.selectedSize}`}
                                {p.selectedSize && p.selectedColor && ' | '}
                                {p.selectedColor && `Color: ${p.selectedColor}`}
                              </p>
                            )}
                            <p className="text-[9px] text-red-500 uppercase tracking-widest mt-0.5">Qty: {p.quantity * item.quantity}</p>
                          </div>
                          {/* <div className="flex items-center gap-2 mt-1">
                            {p.price && (
                              <span className="text-[9px] line-through text-gray-400">{settings?.currency_code} {p.price}</span>
                            )}
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">FREE</span>
                          </div> */}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="border-t border-hairline pt-6 space-y-4">
                <div className="flex justify-between text-xs text-moss uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{settings?.currency_code} {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-moss uppercase tracking-widest">
                  <span>Shipping</span>
                  <span>{settings?.currency_code} { shippingCharge.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-green-600 uppercase tracking-widest">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{settings?.currency_code} {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-hairline">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="COUPON CODE"
                      className="flex-1 rounded-2xl bg-sand border-none px-4 py-3 text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-caramel outline-none"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode}
                      className="rounded-2xl bg-moss text-white px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-caramel transition-all disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="mt-2 text-[10px] text-red-500 uppercase tracking-widest">{couponError}</p>}
                  {appliedCoupon && !couponError && <p className="mt-2 text-[10px] text-green-600 uppercase tracking-widest">Coupon applied successfully!</p>}
                </div>

                <div className="flex justify-between text-gray-900 text-lg font-medium uppercase pt-2">
                  <span>Total</span>
                  <span>{settings?.currency_code} {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="bg-ivory p-8 max-w-md w-full relative geometric-shadow animate-fade-in-up">
            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            
            <h2 className="text-xl font-medium mb-6 uppercase tracking-tighter text-center border-b border-hairline pb-4">Complete Payment</h2>
            
            {settings?.merchant_qr ? (
              <div className="mb-8 flex flex-col items-center">
                <p className="text-xs text-olive uppercase tracking-widest mb-4">Scan QR to Pay</p>
                <div className="p-4 rounded-2xl border border-hairline bg-sand geometric-shadow">
                  <img 
                    src={`${SERVER_URL}${settings.merchant_qr}`} 
                    alt="Merchant QR" 
                    className="max-w-[200px] h-auto object-contain mix-blend-multiply"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-8 text-sm text-olive text-center bg-sand p-4 rounded-2xl border border-hairline">
                Payment QR Code not available. Please proceed with transaction details.
              </div>
            )}
            
            <div className="text-center mb-8 bg-sand py-4 rounded-2xl border border-hairline">
              <p className="text-[10px] text-olive uppercase tracking-[0.2em] mb-1">Amount to Pay</p>
              <p className="text-3xl font-medium text-moss">{settings?.currency_code} {finalTotal.toFixed(2)}</p>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div className="mb-8">
                <label className="block text-[10px] font-medium uppercase tracking-[0.1em] mb-3 text-olive">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRX987654321"
                  className="w-full rounded-2xl bg-sand border border-hairline px-4 py-3 text-sm focus:border-caramel outline-none transition-colors"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-2xl border border-hairline text-moss py-4 text-xs font-medium uppercase tracking-[0.1em] hover:border-caramel transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-moss text-white py-4 text-xs font-medium uppercase tracking-[0.1em] hover:bg-caramel transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


import * as React from "react";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Search, CheckCircle2, Circle, User, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';
import { api, Order, SERVER_URL } from '../services/api';
import { useWebsite } from '../context/WebsiteContext';
import { Breadcrumbs } from '../components/Breadcrumbs';

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' }
];

export default function TrackOrder() {
  const { settings } = useWebsite();
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  
  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackData = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.trackOrder(id.trim());
      console.log(res);
      if (res) {
        setOrder(res);
      } else {
        setError('Order not found. Please check the Order ID and try again.');
      }
    } catch (err) {
      setError('An error occurred while tracking your order.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchTrackData(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackData(orderId);
  };

  const currentStatusIndex = STATUS_STEPS.findIndex(step => step.key === order?.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 min-h-screen">
      <Breadcrumbs items={[
        { label: 'Track Order', path: '/track-order' }
      ]} />

      <div className="mb-12">
        <div className="border border-hairline rounded-[1.6rem] bg-ivory py-12 px-4 sm:px-6 lg:px-8 text-center shadow-soft">
          <h1 className="font-display text-3xl tracking-tight text-moss sm:text-4xl uppercase mb-4">
            Track Your <span className="text-caramel">Order</span>
          </h1>
          <p className="text-olive text-sm max-w-md mx-auto">Enter your order ID to see real-time updates on your purchase.</p>

          <form onSubmit={handleTrack} className="mt-8 max-w-md mx-auto flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-olive" size={18} />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (e.g. ORD-1234)"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-sand border border-hairline text-moss focus:outline-none focus:border-caramel text-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full px-6 py-3 bg-moss text-ivory text-xs font-medium uppercase tracking-widest hover:bg-caramel transition-colors disabled:opacity-50"          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-xs uppercase tracking-wider">{error}</p>}
      </div>
      </div>

      {order && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Tracking Steps */}
          <div className="bg-ivory p-3 lg:p-8 border border-hairline rounded-[1.6rem] mb-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-olive font-bold mb-8">Order Status</h2>
            <div className="relative flex justify-between">
              {/* Connection Line */}
              <div className="absolute top-4 left-0 w-full h-[1px] bg-hairline -z-0">
                <div
                  className="h-full bg-caramel transition-all duration-1000" 
                  style={{ width: `${(Math.max(0, currentStatusIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-ivory ${isCompleted ? 'border-moss text-moss' : 'border-hairline text-olive/40'} ${isCurrent? 'border-caramel text-caramel' : ''}`} >
                      {isCompleted ? <CheckCircle2 size={16} className="" /> : <Circle size={16} />}
                    </div>
                    <span className={`mt-3 text-[9px] uppercase tracking-widest font-bold ${isCurrent ? 'text-caramel-deep' : 'text-olive'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Info */}
            {/* <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 border border-gray-100">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Customer Info</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Name</p>
                      <p className="text-sm font-medium uppercase">{order.user_name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Phone</p>
                      <p className="text-sm font-medium">{order.user_phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-medium">{order.user_email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Shipping Address</p>
                      <p className="text-sm font-medium capitalize">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Order Items & Summary */}
            {/* <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 border border-gray-100">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Order Items</h2>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, i) => (
                    <div key={i} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                          <img 
                            src={item.image_url?.startsWith('http') ? item.image_url : `${SERVER_URL}${item.image_url}`} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide">{item.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                            {item.color} / {item.size} — x{item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-medium">{settings?.currency_code} {item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 border border-gray-100">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Payment Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                    <span>Payment Status</span>
                    <span className={order.payment_status === 'Paid' || order.payment_status === 'paid' ? 'text-green-500 font-bold' : 'text-orange-500 font-bold'}>{order.payment_status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>{settings?.currency_code} {order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                    <span>Discount</span>
                    <span className="text-red-400">-{settings?.currency_code} {order.coupon_discount}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                    <span>Shipping</span>
                    <span>{settings?.currency_code} {order.shipping_charge || settings?.shipping_charge}</span>
                  </div>
                  <div className="h-px bg-gray-100 my-4"></div>
                  <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                    <span>Total Amount</span>
                    <span>{settings?.currency_code} {order.total}</span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}

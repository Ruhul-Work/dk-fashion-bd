import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Order } from '../services/api';
import { ArrowLeft, Package } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { api, SERVER_URL } from '../services/api';
import { useWebsite } from '../context/WebsiteContext';

import { usePageTitle } from '../lib/usePageTitle'

export default function OrderDetail() {
  usePageTitle('Order Detail')
  const { settings } = useWebsite();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);

        const res = await api.getOrderById(id);

        // Adjust this depending on your API shape
        setOrder(res);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (isLoading) return <div className="pt-28 pb-24 text-center font-mono text-[10px] uppercase tracking-widest text-olive">Loading Order Data...</div>;

  if (!order) return <div className="py-24 text-center">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 min-h-screen">
      <Breadcrumbs items={[
        { label: 'Profile', path: '/profile' },
        { label: 'Order History', path: '/profile' },
        { label: order.order_number || order.id, path: `/order/${order.order_number}` } 
      ]} />

      <div className="mb-12"> 
        <h1 className="font-display text-4xl tracking-tight mb-4 text-moss">Order <span className="text-caramel">Details</span></h1>
        <div className="flex flex-wrap gap-3 md:gap-6 text-[11px] uppercase tracking-widest text-olive">
          <p>Order ID: <span className="text-moss font-medium">{order.order_number || order.id}</span></p>
          <p>Placed on: <span className="text-moss">{order.date}</span></p>
          <p>Order Status: <span className={`${order.status === 'pending' ? 'text-caramel-deep' : order.status === 'confirmed' ? 'text-moss' : order.status === 'shipped' ? 'text-caramel' : order.status === 'delivered' ? 'text-eucalyptus-deep' : order.status === 'cancelled' ? 'text-red-500' : 'text-olive'} font-medium`}>{order.status}</span></p>
          <p>Payment Status: <span className={order.payment_status === 'Paid' || order.payment_status === 'paid' ? 'text-eucalyptus-deep font-medium' : 'text-caramel-deep font-medium'} >{order.payment_status}</span></p>
        </div>
      </div>

      <div className="space-y-6 mb-12">
        {order.items.map((item, i) => (
          // console.log(item),
          <div key={i} className="flex justify-between items-center py-4 border-b border-hairline last:border-0 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-sand flex-shrink-0 overflow-hidden border border-hairline rounded-xl">
                <img
                  src={item.thumbnail_image?.startsWith('http') ? item.thumbnail_image : `${SERVER_URL}${item.product.thumbnail_image}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm md:text-md font-medium text-moss uppercase tracking-wide">{item.name} <span className="text-sm text-olive lowercase">( x{parseInt(item.quantity)} )</span></p>
                <p className="text-xs text-olive mt-1 uppercase">Color: {item.color} | Size: {item.size}</p>
                <p className="text-sm text-caramel-deep mt-1 uppercase font-medium"><span className="line-through text-xs text-olive">{settings?.currency_code} {item.product.mrp}</span>  {settings?.currency_code} {item.price}</p>
              </div>
            </div>
            <p className={`text-md font-medium w-20 text-right ${item.price==0?'text-eucalyptus-deep':''}`}>{item.price==0?'':settings?.currency_code} {item.price==0?'Free':item.price * parseInt(item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="bg-ivory p-8 border border-hairline rounded-[1.6rem] shadow-soft">
        <div className="space-y-4">
          <div className="flex justify-between text-md text-moss">
            <span>Subtotal</span>
            <span>{settings?.currency_code} {order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-olive">
            <span>Discount</span>
            <span className='text-caramel-deep'>{settings?.currency_code} {order.discount ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm text-olive">
            <span>Coupon Discount</span>
            <span className='text-caramel-deep'>{settings?.currency_code} {order.coupon_discount ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm text-olive">
            <span>Shipping</span>
            <span>{settings?.currency_code} {settings?.shipping_charge}</span>
          </div>
          <div className="h-px bg-hairline w-full"></div>
          <div className="flex justify-between text-xl font-semibold text-moss">
            <span>Total Amount</span>
            <span>{settings?.currency_code} {order.total}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-hairline">
        <div className="flex items-start gap-4 text-sm text-olive">
          <Package size={20} className="flex-shrink-0 text-caramel" />
          <div>
            <h4 className="font-medium text-moss mb-1 uppercase tracking-widest">Shipping Address</h4>
            <p className='capitalize text-olive'>{order.shipping_address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

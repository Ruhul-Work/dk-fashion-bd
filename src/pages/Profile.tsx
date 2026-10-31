import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Order } from '../services/api';
import { ChevronRight, LogOut, Package, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebsite } from '../context/WebsiteContext';
import { toast } from 'react-hot-toast';

import { usePageTitle } from '../lib/usePageTitle'

export default function Profile() {
  usePageTitle('Profile')
  const { settings } = useWebsite();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setUsername(user.username || '');
    }
  }, [user]);

  useEffect( () => {
    if (activeTab === 'orders' && user) {
      setIsLoadingOrders(true);
      const fetchOrders = async () => {
        const orders = await api.getUserOrders();
        setOrders(orders);
        setIsLoadingOrders(false);
      }
      fetchOrders();
    }
    document.title = user ? 'Profile | Smart Garments' : 'Login | Smart Garments';
  }, [activeTab, user]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await updateUser({ 
        name, 
        email, 
        phone, 
        username,
        current_password: currentPassword || undefined,
        password: newPassword || undefined,
        password_confirmation: confirmPassword || undefined
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditing(false);
    } catch (err: any) {
      // Errors are handled by the global toaster in api.ts
    }
  };

  if (!user) return <div className="py-24 text-center font-mono text-[10px] uppercase tracking-widest text-olive">Please log in to view your profile.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 min-h-screen">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 text-[12px] font-medium uppercase tracking-[0.2em] flex items-center gap-3 transition-colors rounded-2xl ${activeTab === 'profile' ? 'bg-caramel/15 text-caramel-deep' : 'text-moss hover:bg-sand'}`}
          >
            <UserIcon size={14} /> Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 text-[12px] font-medium uppercase tracking-[0.2em] flex items-center gap-3 transition-colors rounded-2xl ${activeTab === 'orders' ? 'bg-caramel/15 text-caramel-deep' : 'text-moss hover:bg-sand'}`}
          >
            <Package size={14} /> Orders
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 text-[12px] font-medium uppercase tracking-[0.2em] flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors rounded-2xl"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' ? (
            <div className="max-w-xl">
              <h2 className="font-display text-3xl tracking-tight uppercase text-moss mb-8">Account <span className="text-caramel">Details</span></h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] uppercase tracking-widest font-medium text-olive mb-2">Display Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-sand rounded-2xl border border-hairline focus:border-caramel outline-none px-4 py-3 text-sm outline-none border-hairline focus:border-caramel"
                      />
                    ) : (
                      <p className="py-3 text-base font-medium text-moss">{user.name}</p>
                    )}
                  </div>
                  {/* <div>
                    <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-sand rounded-2xl border border-hairline focus:border-caramel outline-none px-4 py-3 text-sm outline-none  border-hairline focus:border-caramel"
                      />
                    ) : (
                      <p className="py-3 text-base font-medium text-moss">{user.username || '—'}</p>
                    )}
                  </div> */}
                   <div>
                    <label className="block text-[12px] uppercase tracking-widest font-medium text-olive mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={phone}
                        disabled
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-sand rounded-2xl border border-hairline focus:border-caramel outline-none px-4 py-3 text-sm outline-none  border-hairline focus:border-caramel"
                      />
                    ) : (
                      <p className="py-3 text-base font-medium text-moss">{user.phone || '—'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] uppercase tracking-widest font-medium text-olive mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-sand rounded-2xl border border-hairline focus:border-caramel outline-none px-4 py-3 text-sm outline-none  border-hairline focus:border-caramel"
                      />
                    ) : (
                      <p className="py-3 text-base font-medium text-moss">{user.email || '—'}</p>
                    )}
                  </div>
                 
                </div>

                {isEditing && (
                  <>
                    <div className="h-px bg-hairline w-full my-8"></div>
                    <h3 className="text-[11px] uppercase tracking-widest font-medium text-gray-700 mb-6">Change Password (Leave blank to keep current)</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-sand rounded-2xl border border-hairline focus:border-caramel outline-none px-4 py-3 text-sm outline-none  border-hairline focus:border-caramel"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-sand rounded-2xl border border-hairline focus:border-caramel outline-none px-4 py-3 text-sm outline-none  border-hairline focus:border-caramel"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-sand rounded-2xl border border-hairline focus:border-caramel outline-none px-4 py-3 text-sm outline-none  border-hairline focus:border-caramel"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {isEditing ? (
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 rounded-full bg-moss text-ivory py-4 text-xs font-medium uppercase tracking-widest hover:bg-caramel transition-all">Apply Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 rounded-full border border-hairline py-4 text-xs font-medium uppercase tracking-widest text-moss hover:border-caramel transition-colors">Discard</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} className="rounded-full bg-moss text-ivory px-12 py-4 mt-4 text-xs font-medium uppercase tracking-widest hover:bg-caramel transition-all">Modify Profile</button>
                )}
              </form>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-3xl tracking-tight uppercase text-moss mb-8">Shipment <span className="text-caramel">History</span></h2>
              {isLoadingOrders ? (
                <div className="py-12 text-center text-[10px] uppercase tracking-widest text-olive">Synchronizing...</div>
              ) : !Array.isArray(orders) || orders.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-gray-100">
                  <p className="text-olive font-mono text-[10px] uppercase tracking-[0.2em]">No order data found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Link
                      key={order.id}
                      to={`/order/${order.order_number}`}
                      className="block group p-6 border border-hairline hover:border-caramel transition-all shadow-soft bg-ivory rounded-[1.6rem]"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">ID: {order.order_number}</p>
                          <p className="text-sm font-mono">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium mb-1">{settings?.currency_code} {order.total}</p>
                          <p className="text-[10px] uppercase tracking-widest font-medium text-caramel-deep bg-caramel/15 px-2 py-1 rounded-full">{order.status}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-widest text-olive font-medium">{order.items?.length || 0} {(order.items?.length === 1) ? 'UNIT' : 'UNITS'}</p>
                        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest group-hover:text-brand-text transition-colors">
                          Details <ChevronRight size={14} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

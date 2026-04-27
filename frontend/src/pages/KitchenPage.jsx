import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import OrderTicket from '@/components/OrderTicket';
import { ChefHat, RefreshCw, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { printKitchenOrder } from '@/lib/printorder';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('kitchen_dark_mode');
    return saved === null ? true : saved === 'true';
  });
  const prevOrderIds = useRef(null);

  const d = darkMode;

  const playNotification = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const beep = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      beep(880, 0, 0.15);
      beep(1100, 0.2, 0.15);
      beep(1320, 0.4, 0.3);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/orders/kitchen`);
      const newOrders = response.data;
      const newPendingOrders = newOrders.filter(o => o.status === 'pending');

      if (prevOrderIds.current !== null) {
        const newlyAdded = newPendingOrders.filter(
          o => !prevOrderIds.current.includes(o.id)
        );
        if (newlyAdded.length > 0) {
          if (soundEnabled) playNotification();
          toast.info(`🛎️ ${newlyAdded.length} novo(s) pedido(s) chegou!`, { duration: 4000 });
          newlyAdded.forEach(o => printKitchenOrder(o));
        }
      }

      prevOrderIds.current = newPendingOrders.map(o => o.id);
      setOrders(newOrders);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  }, [soundEnabled, playNotification]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem('kitchen_dark_mode', String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, { status: newStatus });
      const statusMessages = {
        preparing: 'Pedido em preparação!',
        ready: 'Pedido pronto para entrega!'
      };
      toast.success(statusMessages[newStatus] || 'Status atualizado!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? 'bg-stone-950' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${d ? 'bg-orange-600/20' : 'bg-orange-100'}`}>
              <ChefHat className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold ${d ? 'text-white' : 'text-stone-800'}`} data-testid="kitchen-title">
                COZINHA
              </h1>
              <p className={d ? 'text-stone-500' : 'text-stone-500'}>
                {orders.length} pedido(s) em aberto
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Toggle Dark/Light */}
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              className={`flex items-center gap-2 border transition-colors ${
                d
                  ? 'bg-stone-800 border-stone-700 text-yellow-400 hover:bg-stone-700'
                  : 'bg-white border-gray-300 text-stone-600 hover:bg-gray-50'
              }`}
              title={d ? 'Modo claro' : 'Modo escuro'}
            >
              {d ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline text-sm">{d ? 'Claro' : 'Escuro'}</span>
            </Button>

            {/* Som */}
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              className={`flex items-center gap-2 border transition-colors ${
                d
                  ? `bg-stone-800 border-stone-700 hover:bg-stone-700 ${soundEnabled ? 'text-orange-500' : 'text-stone-500'}`
                  : `bg-white border-gray-300 hover:bg-gray-50 ${soundEnabled ? 'text-orange-500' : 'text-stone-400'}`
              }`}
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            {/* Atualizar */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              className={`flex items-center gap-2 border transition-colors ${
                d
                  ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                  : 'bg-white border-gray-300 text-stone-600 hover:bg-gray-50'
              }`}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`rounded-lg h-64 animate-pulse ${d ? 'bg-stone-900' : 'bg-gray-200'}`} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className={`w-16 h-16 mx-auto mb-4 ${d ? 'text-stone-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${d ? 'text-stone-500' : 'text-gray-500'}`}>Nenhum pedido na cozinha</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingOrders.length > 0 && (
              <div>
                <h2 className="text-2xl text-yellow-500 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                  NOVOS PEDIDOS ({pendingOrders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="pending-orders">
                  {pendingOrders.map(order => (
                    <OrderTicket
                      key={`${order.id}-${JSON.stringify(order.items)}`}
                      order={order}
                      onStatusChange={handleStatusChange}
                      nextStatus="preparing"
                      actionLabel="Iniciar"
                      onOrderUpdate={fetchOrders}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            )}
            {preparingOrders.length > 0 && (
              <div>
                <h2 className="text-2xl text-orange-500 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                  EM PREPARAÇÃO ({preparingOrders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="preparing-orders">
                  {preparingOrders.map(order => (
                    <OrderTicket
                      key={`${order.id}-${JSON.stringify(order.items)}`}
                      order={order}
                      onStatusChange={handleStatusChange}
                      nextStatus="ready"
                      actionLabel="Pronto!"
                      onOrderUpdate={fetchOrders}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
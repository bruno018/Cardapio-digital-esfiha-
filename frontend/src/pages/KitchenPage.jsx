import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderTicket from '@/components/OrderTicket';
import { ChefHat, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/orders/kitchen`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, {
        status: newStatus
      });
      
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl text-white" data-testid="kitchen-title">
              COZINHA
            </h1>
            <p className="text-stone-500">
              {orders.length} pedido(s) em aberto
            </p>
          </div>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="btn-secondary flex items-center gap-2"
          data-testid="refresh-kitchen-btn"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-stone-900 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <ChefHat className="w-16 h-16 text-stone-600 mx-auto mb-4" />
          <p className="text-stone-500 text-lg">
            Nenhum pedido na cozinha
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <h2 className="text-2xl text-yellow-500 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                NOVOS PEDIDOS ({pendingOrders.length})
              </h2>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                data-testid="pending-orders"
              >
                {pendingOrders.map(order => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    nextStatus="preparing"
                    actionLabel="Iniciar"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <div>
              <h2 className="text-2xl text-orange-500 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                EM PREPARAÇÃO ({preparingOrders.length})
              </h2>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                data-testid="preparing-orders"
              >
                {preparingOrders.map(order => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    nextStatus="ready"
                    actionLabel="Pronto!"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

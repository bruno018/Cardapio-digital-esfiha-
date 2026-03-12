import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CreditCard, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CashierPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/orders/cashier`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching cashier orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleMarkDelivered = async (orderId) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, {
        status: 'delivered'
      });
      toast.success('Pedido finalizado!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao finalizar pedido');
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const readyOrders = orders.filter(o => o.status === 'ready');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl text-white" data-testid="cashier-title">
              CAIXA
            </h1>
            <p className="text-stone-500">
              {readyOrders.length} pedido(s) prontos para entrega
            </p>
          </div>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="btn-secondary flex items-center gap-2"
          data-testid="refresh-cashier-btn"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-stone-500 text-sm mb-1">Prontos</p>
            <p className="text-3xl text-green-500 font-bold" data-testid="ready-count">
              {readyOrders.length}
            </p>
          </div>
          <div>
            <p className="text-stone-500 text-sm mb-1">Entregues</p>
            <p className="text-3xl text-stone-400 font-bold" data-testid="delivered-count">
              {deliveredOrders.length}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-stone-500 text-sm mb-1">Faturamento Total</p>
            <p className="text-3xl text-amber-400 font-bold" data-testid="total-revenue">
              {formatPrice(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-stone-900 rounded-xl h-64 animate-pulse" />
      ) : (
        <div className="space-y-8">
          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div>
              <h2 className="text-2xl text-green-500 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                PRONTOS PARA ENTREGA
              </h2>
              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-800 hover:bg-transparent">
                      <TableHead className="text-stone-400">Mesa</TableHead>
                      <TableHead className="text-stone-400">Cliente</TableHead>
                      <TableHead className="text-stone-400">Itens</TableHead>
                      <TableHead className="text-stone-400">Hora</TableHead>
                      <TableHead className="text-stone-400 text-right">Total</TableHead>
                      <TableHead className="text-stone-400 text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyOrders.map(order => (
                      <TableRow 
                        key={order.id} 
                        className="border-stone-800 hover:bg-stone-800/50"
                        data-testid={`ready-order-${order.id}`}
                      >
                        <TableCell className="font-bold text-white text-lg">
                          #{order.table_number}
                        </TableCell>
                        <TableCell className="text-stone-300">
                          {order.customer_name}
                        </TableCell>
                        <TableCell className="text-stone-400">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </TableCell>
                        <TableCell className="text-stone-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(order.created_at)}
                        </TableCell>
                        <TableCell className="text-amber-400 font-bold text-right">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="btn-primary py-2 px-4"
                            data-testid={`deliver-${order.id}`}
                          >
                            Entregar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Delivered Orders */}
          {deliveredOrders.length > 0 && (
            <div>
              <h2 className="text-2xl text-stone-500 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                PEDIDOS ENTREGUES
              </h2>
              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden opacity-75">
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-800 hover:bg-transparent">
                      <TableHead className="text-stone-500">Mesa</TableHead>
                      <TableHead className="text-stone-500">Cliente</TableHead>
                      <TableHead className="text-stone-500">Itens</TableHead>
                      <TableHead className="text-stone-500">Hora</TableHead>
                      <TableHead className="text-stone-500 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveredOrders.slice(0, 10).map(order => (
                      <TableRow 
                        key={order.id} 
                        className="border-stone-800 hover:bg-stone-800/50"
                        data-testid={`delivered-order-${order.id}`}
                      >
                        <TableCell className="font-medium text-stone-400">
                          #{order.table_number}
                        </TableCell>
                        <TableCell className="text-stone-500">
                          {order.customer_name}
                        </TableCell>
                        <TableCell className="text-stone-600 text-sm">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </TableCell>
                        <TableCell className="text-stone-600">
                          {formatTime(order.created_at)}
                        </TableCell>
                        <TableCell className="text-stone-500 text-right">
                          {formatPrice(order.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-20">
              <CreditCard className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-500 text-lg">
                Nenhum pedido no caixa ainda
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

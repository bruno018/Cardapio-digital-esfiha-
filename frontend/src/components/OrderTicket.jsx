import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Pencil, X, Check, Trash2, Bike, ShoppingBag, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500'
  },
  preparing: {
    label: 'Preparando',
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500'
  },
  ready: {
    label: 'Pronto',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500'
  },
  delivered: {
    label: 'Entregue',
    icon: CheckCircle2,
    color: 'text-stone-500',
    bgColor: 'bg-stone-500/20',
    borderColor: 'border-stone-500'
  }
};

export default function OrderTicket({ order, onStatusChange, nextStatus, actionLabel, onOrderUpdate }) {
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const [editing, setEditing] = useState(false);
  const [editedItems, setEditedItems] = useState(order.items);
  const [displayItems, setDisplayItems] = useState(order.items);
  const [displayTotal, setDisplayTotal] = useState(order.total);
  const [hasLocalUpdate, setHasLocalUpdate] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Detecta se é pedido de delivery
  const isDelivery = order.source === 'delivery';
  const isDeliveryType = order.delivery_type === 'delivery';

  useEffect(() => {
    if (!hasLocalUpdate) {
      setDisplayItems(order.items);
      setDisplayTotal(order.total);
    }
  }, [order, hasLocalUpdate]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calcTotal = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleEditClick = async () => {
    setEditing(true);
    setEditedItems(displayItems.map(i => ({ ...i })));
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChangeProduct = (index, productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const updated = [...editedItems];
    updated[index] = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: updated[index].quantity || 1
    };
    setEditedItems(updated);
  };

  const handleChangeQty = (index, qty) => {
    if (qty < 1) return;
    const updated = [...editedItems];
    updated[index] = { ...updated[index], quantity: qty };
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (editedItems.length === 1) {
      toast.error('O pedido precisa ter pelo menos 1 item!');
      return;
    }
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      await axios.delete(`${API}/orders/${order.id}`);
      toast.success('Pedido excluído com sucesso!');
      if (onOrderUpdate) onOrderUpdate();
    } catch(err) {
      toast.error('Erro ao excluir pedido');
    }
  };

  const handleSave = async () => {
    try {
      const newTotal = calcTotal(editedItems);
      await axios.patch(`${API}/orders/${order.id}/status`, {
        status: order.status,
        items: editedItems,
        total: newTotal
      });
      setDisplayItems(editedItems);
      setDisplayTotal(newTotal);
      setHasLocalUpdate(true);
      toast.success('Pedido atualizado com sucesso!');
      setEditing(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch(err) {
      console.log('Erro completo:', err.response?.data);
      toast.error('Erro ao salvar pedido');
    }
  };

  return (
    <div className={`kitchen-ticket ${order.status} animate-fadeIn`} data-testid={`order-ticket-${order.id}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl text-white font-bold">#{order.table_number}</span>
          <span className={`status-badge ${order.status}`}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {config.label}
          </span>
          {/* Badge delivery ou retirada */}
          {isDelivery && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isDeliveryType
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              {isDeliveryType
                ? <><Bike className="w-3 h-3" /> Entrega</>
                : <><ShoppingBag className="w-3 h-3" /> Retirada</>
              }
            </span>
          )}
        </div>
        <span className="text-stone-500 text-sm flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatTime(order.created_at)}
        </span>
      </div>

      {/* Customer Name */}
      <div className="text-stone-300 font-medium">{order.customer_name}</div>

      {/* Informações de entrega (só para pedidos delivery) */}
      {isDelivery && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-1.5">
          {/* Telefone */}
          {order.customer_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-stone-300">{order.customer_phone}</span>
            </div>
          )}

          {/* Endereço (só se for entrega) */}
          {isDeliveryType && order.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span className="text-stone-300">{order.address}</span>
            </div>
          )}

          {/* Pagamento */}
          {order.payment_method && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-400 font-medium text-xs uppercase tracking-wide">Pagamento:</span>
              <span className="text-stone-300 capitalize">
                {order.payment_method === 'pix' ? 'PIX' : 
                 order.payment_method === 'card' ? 'Cartão' : 
                 order.payment_method}
              </span>
            </div>
          )}

          {/* Observação geral do pedido */}
          {order.notes && (
            <div className="flex items-start gap-2 text-sm pt-1 border-t border-blue-500/20">
              <span className="text-blue-400 font-medium text-xs uppercase tracking-wide shrink-0">Obs:</span>
              <span className="text-stone-300">{order.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-stone-950/50 rounded-lg p-3 space-y-2">
        {editing ? (
          loadingProducts ? (
            <p className="text-stone-400 text-sm">Carregando produtos...</p>
          ) : (
            editedItems.map((item, index) => (
              <div key={index} className="flex flex-col gap-1 border-b border-stone-800 pb-2">
                <select
                  className="bg-stone-800 text-white text-sm rounded px-2 py-1 w-full"
                  value={item.product_id || ''}
                  onChange={e => handleChangeProduct(index, e.target.value)}
                >
                  <option value="">Selecione um produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{`${p.name} — ${formatPrice(p.price)}`}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleChangeQty(index, item.quantity - 1)} className="text-orange-400 font-bold px-2">−</button>
                    <span className="text-white">{item.quantity}</span>
                    <button onClick={() => handleChangeQty(index, item.quantity + 1)} className="text-orange-400 font-bold px-2">+</button>
                  </div>
                  <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          displayItems.map((item, index) => (
            <div key={index} className="flex flex-col text-sm" data-testid={`order-item-${order.id}-${index}`}>
              <div className="flex justify-between">
                <span className="text-stone-300">
                  <span className="text-orange-500 font-bold mr-2">{item.quantity}x</span>
                  {item.name}
                </span>
                <span className="text-stone-500">{formatPrice(item.price * item.quantity)}</span>
              </div>
              {/* Observação por item */}
              {item.notes && (
                <span className="text-yellow-400/80 text-xs ml-5 mt-0.5">
                  obs: {item.notes}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Total and Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-800">
        <span className="text-lg font-bold text-amber-400">
          Total: {formatPrice(editing ? calcTotal(editedItems) : displayTotal)}
        </span>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={() => setEditing(false)} className="bg-stone-700 hover:bg-stone-600 text-white py-2 px-3 text-sm">
                <X className="w-4 h-4" />
              </Button>
              <Button onClick={handleDelete} className="bg-red-700 hover:bg-red-600 text-white py-2 px-3 text-sm">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white py-2 px-3 text-sm">
                <Check className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEditClick} className="bg-stone-700 hover:bg-stone-600 text-white py-2 px-3 text-sm">
                <Pencil className="w-4 h-4" />
              </Button>
              {onStatusChange && nextStatus && (
                <Button onClick={() => onStatusChange(order.id, nextStatus)} className="btn-primary py-2 px-4" data-testid={`order-action-${order.id}`}>
                  {actionLabel}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

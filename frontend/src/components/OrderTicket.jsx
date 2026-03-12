import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function OrderTicket({ order, onStatusChange, nextStatus, actionLabel }) {
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div 
      className={`kitchen-ticket ${order.status} animate-fadeIn`}
      data-testid={`order-ticket-${order.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-white font-bold">
            #{order.table_number}
          </span>
          <span className={`status-badge ${order.status}`}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {config.label}
          </span>
        </div>
        <span className="text-stone-500 text-sm flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatTime(order.created_at)}
        </span>
      </div>

      {/* Customer Name */}
      <div className="text-stone-300 font-medium">
        {order.customer_name}
      </div>

      {/* Items */}
      <div className="bg-stone-950/50 rounded-lg p-3 space-y-2">
        {order.items.map((item, index) => (
          <div 
            key={index} 
            className="flex justify-between text-sm"
            data-testid={`order-item-${order.id}-${index}`}
          >
            <span className="text-stone-300">
              <span className="text-orange-500 font-bold mr-2">{item.quantity}x</span>
              {item.name}
            </span>
            <span className="text-stone-500">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Total and Action */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-800">
        <span className="text-lg font-bold text-amber-400">
          Total: {formatPrice(order.total)}
        </span>
        {onStatusChange && nextStatus && (
          <Button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className="btn-primary py-2 px-4"
            data-testid={`order-action-${order.id}`}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

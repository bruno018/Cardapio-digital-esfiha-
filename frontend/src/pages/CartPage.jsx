import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Trash2, Plus, Minus, CheckCircle2, MessageSquare, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SUGGESTIONS = [
  'Sem cebola',
  'Sem tomate',
  'Maionese extra',
  'Sem pimenta',
  'Bem passado',
  'Ao ponto',
];

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [notes, setNotes] = useState({});
  const [openNotes, setOpenNotes] = useState({});

  const formatPrice = (price) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const toggleNote = (id) =>
    setOpenNotes((prev) => ({ ...prev, [id]: !prev[id] }));

  const setNote = (id, value) =>
    setNotes((prev) => ({ ...prev, [id]: value }));

  const addSuggestion = (id, suggestion) => {
    const current = notes[id] || '';
    const already = current.toLowerCase().includes(suggestion.toLowerCase());
    if (already) return;
    const updated = current ? `${current}, ${suggestion}` : suggestion;
    setNote(id, updated);
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Por favor, informe seu nome');
      return;
    }
    if (!tableNumber.trim()) {
      toast.error('Por favor, informe o número da mesa');
      return;
    }
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }

    setLoading(true);
    try {
      const itemsWithNotes = items.map((item) => ({
        ...item,
        notes: notes[item.product_id] || '',
      }));

      await axios.post(`${API}/orders`, {
        customer_name: customerName,
        table_number: tableNumber,
        items: itemsWithNotes,
        total,
      });

      setOrderComplete(true);
      clearCart();
      toast.success('Pedido enviado com sucesso!');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-4xl text-white mb-4">PEDIDO ENVIADO!</h2>
          <p className="text-stone-400 text-lg mb-2">Obrigado, {customerName}!</p>
          <p className="text-stone-500">Seu pedido foi enviado para a cozinha.</p>
          <p className="text-orange-500 mt-4 font-medium">Mesa {tableNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-4xl md:text-5xl text-white text-center mb-8" data-testid="cart-title">
        SEU CARRINHO
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-stone-600 mx-auto mb-4" />
          <p className="text-stone-500 text-lg mb-4">Seu carrinho está vazio</p>
          <Button onClick={() => navigate('/')} className="btn-primary" data-testid="go-to-menu-btn">
            Ver Cardápio
          </Button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">

          {/* Cart Items */}
          <div className="flex-1 space-y-3" data-testid="cart-items">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden animate-fadeIn"
                data-testid={`cart-item-${item.product_id}`}
              >
                {/* Item principal */}
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base text-white font-semibold uppercase leading-tight">{item.name}</h3>
                    <p className="text-amber-400 font-bold text-sm mt-0.5">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="btn-icon"
                      data-testid={`decrease-${item.product_id}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-bold w-8 text-center" data-testid={`quantity-${item.product_id}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="btn-icon"
                      data-testid={`increase-${item.product_id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right min-w-[72px]">
                    <p className="text-stone-300 font-medium text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-stone-500 hover:text-red-500 transition-colors"
                    data-testid={`remove-${item.product_id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Botao observacao */}
                <div className="border-t border-stone-800">
                  <button
                    onClick={() => toggleNote(item.product_id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-stone-400 hover:text-orange-400 hover:bg-stone-800/50 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {notes[item.product_id]
                        ? <span className="text-orange-400 truncate max-w-[200px]">{notes[item.product_id]}</span>
                        : 'Adicionar observacao'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${openNotes[item.product_id] ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Campo de observacao expandido */}
                  {openNotes[item.product_id] && (
                    <div className="px-4 pb-4 animate-fadeIn">
                      {/* Sugestoes rapidas */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => addSuggestion(item.product_id, s)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              notes[item.product_id]?.toLowerCase().includes(s.toLowerCase())
                                ? 'bg-orange-600/20 border-orange-600 text-orange-400'
                                : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-orange-600 hover:text-orange-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      {/* Textarea livre */}
                      <textarea
                        rows={2}
                        value={notes[item.product_id] || ''}
                        onChange={(e) => setNote(item.product_id, e.target.value)}
                        placeholder="Ex: sem cebola, maionese extra, bem passado..."
                        className="w-full bg-stone-950 border border-stone-700 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-white placeholder:text-stone-600 outline-none transition-colors resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="md:w-80">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-2xl text-white mb-6">FINALIZAR</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="name" className="text-stone-400 mb-2 block">
                    Seu Nome
                  </Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="input-field"
                    data-testid="customer-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="table" className="text-stone-400 mb-2 block">
                    Número da Mesa
                  </Label>
                  <Input
                    id="table"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Ex: 5"
                    className="input-field"
                    data-testid="table-number-input"
                  />
                </div>
              </div>

              <div className="border-t border-stone-800 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Total</span>
                  <span className="text-2xl text-amber-400 font-bold" data-testid="cart-total">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="btn-primary w-full"
                data-testid="submit-order-btn"
              >
                {loading ? 'Enviando...' : 'Enviar Pedido'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

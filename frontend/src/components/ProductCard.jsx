import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div 
      className="product-card animate-fadeIn"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-card-image transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
      </div>
      
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-xl text-white font-semibold tracking-wide">
          {product.name}
        </h3>
        <p className="text-stone-400 text-sm line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="price-tag" data-testid={`product-price-${product.id}`}>
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="btn-primary flex items-center gap-2 py-2 px-4"
            data-testid={`add-to-cart-${product.id}`}
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

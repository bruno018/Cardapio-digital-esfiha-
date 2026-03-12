import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = [
  { id: 'esfihas', label: 'Esfihas' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'sobremesas', label: 'Sobremesas' },
];

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('esfihas');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First seed products if needed
        await axios.get(`${API}/products/seed`);
        // Then fetch all products
        const response = await axios.get(`${API}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl text-white mb-2" data-testid="menu-title">
          CARDÁPIO
        </h1>
        <p className="text-stone-400 text-lg">
          Escolha suas esfihas favoritas
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap" data-testid="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            data-testid={`category-${cat.id}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-stone-900 rounded-2xl overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="products-grid"
        >
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`stagger-${(index % 5) + 1}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-500 text-lg">
            Nenhum produto encontrado nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
}

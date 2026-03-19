import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, ChevronRight, ShoppingBag } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const combos = [
  {
    id: 'combo-1',
    name: 'Combo Família',
    description: '6 esfihas de carne + 2 refrigerantes 600ml',
    price: 49.90,
    image_url: 'https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg',
    category: 'combos',
  },
  {
    id: 'combo-2',
    name: 'Combo Sobremesa',
    description: '4 esfihas especiais + 1 esfiha de chocolate',
    price: 38.90,
    image_url: 'https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png',
    category: 'combos',
  },
];

const categories = [
  {
    id: 'esfihas',
    label: 'Esfihas',
    subcategories: [
      { id: 'esfihas-carne', label: 'Carnes', filter: (p) => p.name.toLowerCase().includes('carne') || p.name.toLowerCase().includes('calabresa') || p.name.toLowerCase().includes('beirute') },
      { id: 'esfihas-frango', label: 'Frango', filter: (p) => p.name.toLowerCase().includes('frango') },
      { id: 'esfihas-queijo', label: 'Queijos', filter: (p) => p.name.toLowerCase().includes('queijo') },
      { id: 'esfihas-especiais', label: 'Especiais', filter: (p) => p.name.toLowerCase().includes('vegetariana') },
    ]
  },
  {
    id: 'combos',
    label: 'Combos do Dia',
    subcategories: []
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    subcategories: [
      { id: 'bebidas-todas', label: 'Todas', filter: () => true },
    ]
  },
  {
    id: 'sobremesas',
    label: 'Sobremesas',
    subcategories: [
      { id: 'sobremesas-todas', label: 'Todas', filter: () => true },
    ]
  },
];

const banners = [
  {
    id: 1,
    title: 'Esfihas Especiais',
    subtitle: 'Peça já a sua favorita!',
    tag: '🔥 Mais Pedidas',
    bg: 'from-orange-900/80 to-stone-900',
    category: 'esfihas',
    subcategory: 'esfihas-especiais',
    image: 'https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg'
  },
  {
    id: 2,
    title: 'Combo do Dia',
    subtitle: '2 esfihas + 1 bebida',
    tag: '⚡ Oferta',
    bg: 'from-amber-900/80 to-stone-900',
    category: 'combos',
    image: 'https://i.ibb.co/F4hNRJ1b/esfiha-de-carne-e-queijo.png'
  },
  {
    id: 3,
    title: 'Sobremesas',
    subtitle: 'Termine com chave de ouro!',
    tag: '🍫 Novidade',
    bg: 'from-rose-900/80 to-stone-900',
    category: 'sobremesas',
    image: 'https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png'
  },
];

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('esfihas');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState(['esfihas']);
  const { itemCount } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await axios.get(`${API}/products/seed`);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBannerClick = (category, subcategory = null) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
    setExpandedCategories(prev =>
      prev.includes(category) ? prev : [...prev, category]
    );
  };

  const currentCategory = categories.find(c => c.id === activeCategory);

  const filteredProducts = activeCategory === 'combos'
    ? combos
    : products.filter(p => {
      if (p.category !== activeCategory) return false;
      if (!activeSubcategory) return true;
      const sub = currentCategory?.subcategories.find(s => s.id === activeSubcategory);
      return sub ? sub.filter(p) : true;
    });

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row">

          {/* Sidebar */}
          <aside className="w-full md:w-64 md:min-h-screen bg-stone-900 border-b md:border-b-0 md:border-r border-stone-800 md:sticky md:top-0 md:h-screen md:overflow-y-auto flex flex-col">

            {/* Logo + Carrinho */}
            <div className="p-4 border-b border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-xl">
                    🥙
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg leading-none">ESFIHARIA</h1>
                    <p className="text-orange-500 text-xs">DIGITAL</p>
                  </div>
                </div>
                <NavLink to="/cart" className="relative">
                  <div className="w-10 h-10 bg-stone-800 hover:bg-stone-700 rounded-full flex items-center justify-center transition-colors">
                    <ShoppingBag className="w-5 h-5 text-white" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </NavLink>
              </div>
            </div>

            {/* Categories */}
            <div className="p-3 flex-1">
              <p className="text-stone-500 text-xs uppercase tracking-wider px-2 mb-2">Categorias</p>
              {categories.map(cat => (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg mb-1 transition-all ${activeCategory === cat.id
                        ? 'bg-orange-600/20 text-orange-400'
                        : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                      }`}
                  >
                    <span className="font-medium">{cat.label}</span>
                    {cat.subcategories.length > 0 && (
                      <ChevronRight className={`w-4 h-4 transition-transform ${expandedCategories.includes(cat.id) ? 'rotate-90' : ''
                        }`} />
                    )}
                  </button>

                  {/* Subcategories */}
                  {expandedCategories.includes(cat.id) && cat.subcategories.length > 1 && (
                    <div className="ml-4 mb-2 space-y-1">
                      <button
                        onClick={() => setActiveSubcategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeSubcategory === null && activeCategory === cat.id
                            ? 'bg-orange-600/10 text-orange-400'
                            : 'text-stone-500 hover:text-white hover:bg-stone-800'
                          }`}
                      >
                        Todos
                      </button>
                      {cat.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => { setActiveCategory(cat.id); setActiveSubcategory(sub.id); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeSubcategory === sub.id
                              ? 'bg-orange-600/10 text-orange-400'
                              : 'text-stone-500 hover:text-white hover:bg-stone-800'
                            }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* WB Sistemas Logo */}
            <div className="p-4 border-t border-stone-800">
              <p className="text-stone-600 text-xs text-center mb-2">Desenvolvido por</p>
              <img
                src="https://i.ibb.co/8n8s99Ms/Wb-sistemas-logo.png"
                alt="WB Sistemas"
                className="w-28 h-auto mx-auto object-contain opacity-50 hover:opacity-80 transition-opacity"
              />
            </div>

          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">

            {/* Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-6 h-36 md:h-48">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  onClick={() => handleBannerClick(banner.category, banner.subcategory)}
                  className={`absolute inset-0 transition-opacity duration-700 ${index === activeBanner
                      ? 'opacity-100 cursor-pointer z-10'
                      : 'opacity-0 pointer-events-none z-0'
                    }`}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg}`} />
                  <div className="relative flex flex-col justify-center h-full px-6 md:px-8">
                    <span className="inline-flex items-center gap-1 bg-orange-600/30 text-orange-400 text-xs px-2 py-1 rounded-full w-fit mb-2">
                      <Tag className="w-3 h-3" />
                      {banner.tag}
                    </span>
                    <h2 className="text-white text-2xl md:text-3xl font-bold">{banner.title}</h2>
                    <p className="text-stone-300 text-sm md:text-base">{banner.subtitle}</p>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-3 right-4 flex gap-1 z-10">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveBanner(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === activeBanner ? 'bg-orange-500 w-4' : 'bg-stone-600'
                      }`}
                  />
                ))}
              </div>
            </div>
            {/* Category Title */}
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-white text-xl font-bold">{currentCategory?.label}</h2>
              {activeSubcategory && (
                <>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                  <span className="text-orange-400 text-sm">
                    {currentCategory?.subcategories.find(s => s.id === activeSubcategory)?.label}
                  </span>
                </>
              )}
              <span className="ml-auto text-stone-500 text-sm">{filteredProducts.length} itens</span>
            </div>

            {/* Products Grid */}
            {loading && activeCategory !== 'combos' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="products-grid">
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
          </main>
        </div>
      </div>
    </div>
  );
}
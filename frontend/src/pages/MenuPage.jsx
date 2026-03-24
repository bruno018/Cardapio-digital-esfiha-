import { useState, useEffect } from 'react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ChevronRight, Star, Zap, Plus, Search, X, UtensilsCrossed, Coffee, Cake, Package } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

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
    Icon: UtensilsCrossed,
    bannerDesc: 'Massa artesanal fresquinha com recheios irresistíveis feitos todo dia.',
    subcategories: [
      { id: 'esfihas-carne', label: 'Carnes', filter: (p) => p.name.toLowerCase().includes('carne') || p.name.toLowerCase().includes('calabresa') || p.name.toLowerCase().includes('beirute') },
      { id: 'esfihas-frango', label: 'Frango', filter: (p) => p.name.toLowerCase().includes('frango') },
      { id: 'esfihas-queijo', label: 'Queijos', filter: (p) => p.name.toLowerCase().includes('queijo') },
      { id: 'esfihas-especiais', label: 'Especiais', filter: (p) => p.name.toLowerCase().includes('vegetariana') },
    ],
  },
  {
    id: 'combos',
    label: 'Combos do Dia',
    Icon: Package,
    bannerDesc: 'Combinações especiais com o melhor custo-benefício da casa.',
    subcategories: [],
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    Icon: Coffee,
    bannerDesc: 'Sucos naturais, refrigerantes e muito mais para acompanhar.',
    subcategories: [
      { id: 'bebidas-todas', label: 'Todas', filter: () => true },
    ],
  },
  {
    id: 'sobremesas',
    label: 'Sobremesas',
    Icon: Cake,
    bannerDesc: 'Feche com chave de ouro! Esfihas doces e sobremesas artesanais.',
    subcategories: [
      { id: 'sobremesas-todas', label: 'Todas', filter: () => true },
    ],
  },
];

const banners = [
  {
    id: 1,
    title: 'Esfihas Especiais',
    subtitle: 'Peça já a sua favorita!',
    tag: 'Mais Pedidas',
    category: 'esfihas',
    subcategory: 'esfihas-especiais',
    image: 'https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg',
  },
  {
    id: 2,
    title: 'Combo do Dia',
    subtitle: '2 esfihas + 1 bebida',
    tag: 'Oferta',
    category: 'combos',
    image: 'https://i.ibb.co/F4hNRJ1b/esfiha-de-carne-e-queijo.png',
  },
  {
    id: 3,
    title: 'Sobremesas',
    subtitle: 'Termine com chave de ouro!',
    tag: 'Novidade',
    category: 'sobremesas',
    image: 'https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png',
  },
];

const formatPrice = (price) =>
  Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState(['esfihas']);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, addItem } = useCart();

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
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
    setSearchQuery('');
    setSearchOpen(false);
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleBannerClick = (category, subcategory = null) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
    setSearchQuery('');
    setSearchOpen(false);
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev : [...prev, category]
    );
  };

  const goHome = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const currentCategory = categories.find((c) => c.id === activeCategory);

  const allProducts = [...products, ...combos];

  const searchResults = searchQuery.trim().length > 1
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredProducts =
    activeCategory === 'combos'
      ? combos
      : products.filter((p) => {
          if (p.category !== activeCategory) return false;
          if (!activeSubcategory) return true;
          const sub = currentCategory?.subcategories.find((s) => s.id === activeSubcategory);
          return sub ? sub.filter(p) : true;
        });

  const recommendedProducts = products.slice(0, 6);
  const bestSellers = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

  const isSearching = searchQuery.trim().length > 1;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col md:flex-row">

      {/* SIDEBAR */}
      <aside className="w-full md:w-56 md:min-h-screen bg-stone-900 border-b md:border-b-0 md:border-r border-stone-800 md:sticky md:top-0 md:h-screen md:overflow-y-auto flex flex-col shrink-0">

        {/* Logo */}
        <div className="p-4 border-b border-stone-800">
          <button onClick={goHome} className="flex items-center gap-3 w-full text-left">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/40">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none tracking-wide">ESFIHARIA</h1>
              <p className="text-orange-500 text-xs tracking-widest">DIGITAL</p>
            </div>
          </button>
        </div>

        {/* Nav icons */}
        <div className="flex md:flex-col border-b md:border-b-0 border-stone-800 md:border-none">
          <button
            onClick={goHome}
            className={`flex md:flex-col items-center gap-2 px-4 py-3 text-xs transition-colors w-full ${
              activeCategory === null
                ? 'text-orange-400 bg-orange-900/20'
                : 'text-stone-500 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Destaques</span>
          </button>
          <button
            onClick={() => toggleCategory('esfihas')}
            className={`flex md:flex-col items-center gap-2 px-4 py-3 text-xs transition-colors w-full ${
              activeCategory !== null
                ? 'text-orange-400 bg-orange-900/10'
                : 'text-stone-500 hover:text-white hover:bg-stone-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Cardapio</span>
          </button>
          <button
            onClick={() => handleBannerClick('combos')}
            className="flex md:flex-col items-center gap-2 px-4 py-3 text-xs text-stone-500 hover:text-white hover:bg-stone-800 transition-colors w-full"
          >
            <Zap className="w-4 h-4" />
            <span>Ofertas</span>
          </button>
        </div>

        {/* Category list */}
        <div className="p-3 flex-1 overflow-y-auto hidden md:block">
          <p className="text-stone-600 text-xs uppercase tracking-wider px-2 mb-2">Categorias</p>
          {categories.map((cat) => {
            const Icon = cat.Icon;
            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 transition-all text-sm ${
                    activeCategory === cat.id
                      ? 'bg-orange-600/20 text-orange-400 font-medium'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </span>
                  {cat.subcategories.length > 0 && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        expandedCategories.includes(cat.id) ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </button>

                {expandedCategories.includes(cat.id) && cat.subcategories.length > 1 && (
                  <div className="ml-4 mb-2 space-y-0.5">
                    <button
                      onClick={() => setActiveSubcategory(null)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                        activeSubcategory === null && activeCategory === cat.id
                          ? 'bg-orange-600/10 text-orange-400'
                          : 'text-stone-500 hover:text-white hover:bg-stone-800'
                      }`}
                    >
                      Todos
                    </button>
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => { setActiveCategory(cat.id); setActiveSubcategory(sub.id); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                          activeSubcategory === sub.id
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
            );
          })}
        </div>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-stone-800 hidden md:block">
          <p className="text-stone-600 text-xs text-center mb-2">Desenvolvido por</p>
          <img
            src="https://i.ibb.co/8n8s99Ms/Wb-sistemas-logo.png"
            alt="WB Sistemas"
            className="w-28 h-auto mx-auto object-contain opacity-40 hover:opacity-70 transition-opacity"
          />
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">

        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-stone-950/90 backdrop-blur border-b border-stone-800 px-4 py-3 flex items-center gap-3">

          {/* Voltar / Titulo */}
          <div className="text-sm font-medium flex-shrink-0">
            {activeCategory === null ? (
              <span className="text-white font-semibold">Bem-vindo</span>
            ) : (
              <button onClick={goHome} className="text-orange-400 hover:text-orange-300 transition-colors">
                Voltar
              </button>
            )}
          </div>

          {/* Barra de pesquisa */}
          <div className={`flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-full px-3 py-2 transition-all duration-300 ${searchOpen ? 'flex-1' : 'w-9 h-9 justify-center cursor-pointer hover:bg-stone-700'}`}
            onClick={() => !searchOpen && setSearchOpen(true)}
          >
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            {searchOpen && (
              <>
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-stone-500 min-w-0"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); setSearchOpen(false); }}
                  className="text-stone-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Carrinho */}
          <NavLink to="/cart" className="relative shrink-0 ml-auto">
            <div className="w-9 h-9 bg-stone-800 hover:bg-stone-700 rounded-full flex items-center justify-center transition-colors">
              <ShoppingBag className="w-4 h-4 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </div>
          </NavLink>
        </div>

        {/* RESULTADOS DE BUSCA */}
        {isSearching && (
          <div className="px-4 md:px-6 py-4">
            <p className="text-stone-400 text-sm mb-4">
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para <span className="text-white font-medium">"{searchQuery}"</span>
            </p>
            {searchResults.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-10 h-10 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-400 text-base font-medium">Nenhum produto encontrado.</p>
                <p className="text-stone-600 text-sm mt-1">Tente outro termo.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {searchResults.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-stone-900 border border-stone-800 hover:border-orange-500/50 rounded-2xl overflow-hidden flex transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <div className="w-32 md:w-44 shrink-0 overflow-hidden">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
                      <div>
                        <h3 className="text-white font-bold text-base leading-tight uppercase">{product.name}</h3>
                        <p className="text-stone-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="price-tag">{formatPrice(product.price)}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn-primary flex items-center gap-2 py-2 px-4"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HOME PAGE */}
        {!isSearching && activeCategory === null && (
          <div>
            {/* Banner rotativo */}
            <div className="relative overflow-hidden h-48 md:h-64">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  onClick={() => handleBannerClick(banner.category, banner.subcategory)}
                  className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${
                    index === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-8">
                    <span className="inline-block bg-orange-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-2 uppercase tracking-wide">
                      {banner.tag}
                    </span>
                    <h2 className="text-white text-2xl md:text-4xl font-bold leading-tight">{banner.title}</h2>
                    <p className="text-stone-300 text-sm md:text-base mt-1">{banner.subtitle}</p>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBanner(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeBanner ? 'bg-orange-500 w-5' : 'bg-stone-600 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Categorias rapidas */}
            <div className="px-4 md:px-6 pt-5">
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.Icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className="flex flex-col items-center gap-1.5 bg-stone-900 hover:bg-orange-900/20 border border-stone-800 hover:border-orange-800 rounded-xl p-3 transition-all group"
                    >
                      <Icon className="w-5 h-5 text-stone-400 group-hover:text-orange-400 transition-colors" />
                      <span className="text-stone-400 group-hover:text-orange-400 text-xs font-medium text-center leading-tight transition-colors">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recomendados */}
            <div className="px-4 md:px-6 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  Recomendados pela Casa
                </h3>
                <button
                  onClick={() => toggleCategory('esfihas')}
                  className="text-orange-400 text-xs hover:text-orange-300 transition-colors flex items-center gap-1"
                >
                  Ver todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {loading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-stone-900 rounded-xl overflow-hidden shrink-0 w-36">
                      <Skeleton className="h-24 w-full" />
                      <div className="p-2 space-y-1.5">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {[...recommendedProducts, ...combos].map((product) => (
                    <div
                      key={product.id}
                      className="shrink-0 w-36 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 rounded-xl overflow-hidden transition-all text-left group"
                    >
                      <div className="h-24 overflow-hidden cursor-pointer" onClick={() => toggleCategory(product.category)}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 cursor-pointer" onClick={() => toggleCategory(product.category)}>
                        <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{product.name}</p>
                        <p className="text-orange-400 text-xs font-bold mt-1">{formatPrice(product.price)}</p>
                      </div>
                      <div className="px-2 pb-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          className="w-full flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-semibold py-1.5 rounded-lg transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mais Pedidos */}
            <div className="px-4 md:px-6 pt-6 pb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  Mais Pedidos
                </h3>
              </div>

              {loading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-stone-900 rounded-xl overflow-hidden shrink-0 w-36">
                      <Skeleton className="h-24 w-full" />
                      <div className="p-2 space-y-1.5">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {bestSellers.map((product) => (
                    <div
                      key={product.id}
                      className="shrink-0 w-36 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 rounded-xl overflow-hidden transition-all text-left group"
                    >
                      <div className="h-24 overflow-hidden cursor-pointer" onClick={() => toggleCategory(product.category)}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 cursor-pointer" onClick={() => toggleCategory(product.category)}>
                        <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{product.name}</p>
                        <p className="text-orange-400 text-xs font-bold mt-1">{formatPrice(product.price)}</p>
                      </div>
                      <div className="px-2 pb-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          className="w-full flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-semibold py-1.5 rounded-lg transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORY PAGE */}
        {!isSearching && activeCategory !== null && (
          <div>
            {/* Category banner */}
            <div className="relative h-32 md:h-40 overflow-hidden">
              {(() => {
                const matchBanner = banners.find((b) => b.category === activeCategory);
                return matchBanner ? (
                  <img src={matchBanner.image} alt={currentCategory?.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-stone-800" />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <h2 className="text-white text-xl md:text-2xl font-bold">
                  {currentCategory?.label}
                </h2>
                <p className="text-stone-400 text-xs mt-0.5">{currentCategory?.bannerDesc}</p>
              </div>
            </div>

            {/* Subcategory pills */}
            {currentCategory?.subcategories.length > 1 && (
              <div className="flex gap-2 px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide border-b border-stone-800">
                <button
                  onClick={() => setActiveSubcategory(null)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeSubcategory === null
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700'
                  }`}
                >
                  Todos
                </button>
                {currentCategory.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubcategory(sub.id)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeSubcategory === sub.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}

            {/* Items count */}
            <div className="flex items-center justify-end px-4 md:px-6 py-2">
              <span className="text-stone-500 text-sm">{filteredProducts.length} itens</span>
            </div>

            {/* Lista de produtos */}
            <div className="px-4 md:px-6 pb-8 flex flex-col gap-3">
              {loading && activeCategory !== 'combos' ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="bg-stone-900 rounded-2xl overflow-hidden flex">
                    <Skeleton className="h-28 w-32 shrink-0 rounded-none" />
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between mt-auto">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`bg-stone-900 border border-stone-800 hover:border-orange-500/50 rounded-2xl overflow-hidden flex transition-all duration-300 animate-fadeIn stagger-${(index % 5) + 1}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-32 md:w-44 shrink-0 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
                      <div>
                        <h3 className="text-white font-bold text-base md:text-lg leading-tight uppercase">
                          {product.name}
                        </h3>
                        <p className="text-stone-400 text-sm mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="price-tag">{formatPrice(product.price)}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn-primary flex items-center gap-2 py-2 px-4"
                          data-testid={`add-to-cart-${product.id}`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <UtensilsCrossed className="w-10 h-10 text-stone-700 mx-auto mb-3" />
                  <p className="text-stone-400 text-base font-medium">Nenhum produto encontrado.</p>
                  <p className="text-stone-600 text-sm mt-1">Tente outra categoria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

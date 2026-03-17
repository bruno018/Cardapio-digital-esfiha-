import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, ChefHat, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Layout() {
  const location = useLocation();
  const { itemCount } = useCart();
  
  // Check if we're on staff pages (kitchen/cashier)
  const isStaffPage = location.pathname === '/kitchen' || location.pathname === '/cashier';
  const isMenuPage = location.pathname === '/';
  
  // Customer navigation (Cardápio + Carrinho)
  const customerNavItems = [
    { path: '/', icon: UtensilsCrossed, label: 'Cardápio' },
    { path: '/cart', icon: ShoppingBag, label: 'Carrinho', badge: itemCount },
  ];
  
  // Staff navigation (Cozinha + Caixa)
  const staffNavItems = [
    { path: '/kitchen', icon: ChefHat, label: 'Cozinha' },
    { path: '/cashier', icon: CreditCard, label: 'Caixa' },
  ];
  
  const navItems = isStaffPage ? staffNavItems : customerNavItems;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Desktop Header */}
      {!isMenuPage && (
        
  <header className="hidden md:block glass-header sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
          {isStaffPage ? <ChefHat className="w-5 h-5 text-white" /> : <UtensilsCrossed className="w-5 h-5 text-white" />}
        </div>
        <h1 className="text-2xl text-white" data-testid="app-title">
          {isStaffPage ? 'PAINEL FUNCIONÁRIO' : 'ESFIHARIA DIGITAL'}
        </h1>
      </div>
      <nav className="flex gap-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <NavLink
            key={path}
            to={path}
            data-testid={`nav-${label.toLowerCase().replace('á', 'a')}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge > 0 && (
                <span className="cart-counter">{badge}</span>
              )}
            </div>
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  </header>
)}

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-header z-50">
        <div className="flex justify-around py-2 px-4">
          {navItems.map(({ path, icon: Icon, label, badge }) => (
            <NavLink
              key={path}
              to={path}
              data-testid={`mobile-nav-${label.toLowerCase().replace('á', 'a')}`}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {badge > 0 && (
                  <span className="cart-counter">{badge}</span>
                )}
              </div>
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import MenuPage from "@/pages/MenuPage";
import CartPage from "@/pages/CartPage";
import KitchenPage from "@/pages/KitchenPage";
import CashierPage from "@/pages/CashierPage";
import ProtectedPage from "@/components/ProtectedPage";
import { CartProvider } from "@/context/CartContext";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="kitchen" element={
              <ProtectedPage title="Cozinha — Acesso Funcionários">
                <KitchenPage />
              </ProtectedPage>
            } />
            <Route path="cashier" element={
              <ProtectedPage title="Caixa — Acesso Funcionários">
                <CashierPage />
              </ProtectedPage>
            } />
          </Route>
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
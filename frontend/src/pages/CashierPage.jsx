import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CreditCard, RefreshCw, CheckCircle2, Clock, TrendingUp, ShoppingBag, DollarSign, FileText, Printer, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { printCashierOrder } from '@/lib/printorder';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CashierPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showCloseDay, setShowCloseDay] = useState(false);
  const [closeDayPassword, setCloseDayPassword] = useState('');
  const [closingDay, setClosingDay] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('cashier_dark_mode');
    return saved === null ? true : saved === 'true';
  });

  const d = darkMode;

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem('cashier_dark_mode', String(!prev));
      return !prev;
    });
  };

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

  const fetchMonthlyReport = async () => {
    setLoadingReport(true);
    try {
      const response = await axios.get(`${API}/orders/reports/monthly`);
      setMonthlyReport(response.data);
      setShowReport(true);
    } catch (error) {
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCloseDay = async () => {
    if (closeDayPassword !== process.env.REACT_APP_STAFF_PASSWORD) {
      toast.error('Senha incorreta!');
      setCloseDayPassword('');
      return;
    }
    setClosingDay(true);
    try {
      const response = await axios.post(`${API}/orders/close-day`);
      toast.success(`Caixa fechado! ${response.data.archived} pedidos arquivados.`);
      setShowCloseDay(false);
      setCloseDayPassword('');
      fetchOrders();
    } catch (error) {
      toast.error('Erro ao fechar caixa');
    } finally {
      setClosingDay(false);
    }
  };

  const generatePDF = () => {
    if (!monthlyReport) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ESFIHARIA DIGITAL', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Relatório Mensal — ${monthlyReport.month}`, pageWidth / 2, 30, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 48, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');

    doc.setFillColor(245, 158, 11, 0.1);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, 55, 55, 28, 3, 3, 'FD');
    doc.setTextColor(245, 158, 11);
    doc.text('FATURAMENTO', 41, 65, { align: 'center' });
    doc.setFontSize(13);
    doc.text(formatPrice(monthlyReport.total_revenue), 41, 76, { align: 'center' });

    doc.setFillColor(34, 197, 94, 0.1);
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(77, 55, 55, 28, 3, 3, 'FD');
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(11);
    doc.text('PEDIDOS', 104, 65, { align: 'center' });
    doc.setFontSize(13);
    doc.text(`${monthlyReport.total_orders}`, 104, 76, { align: 'center' });

    doc.setFillColor(59, 130, 246, 0.1);
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(140, 55, 55, 28, 3, 3, 'FD');
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(11);
    doc.text('TICKET MÉDIO', 167, 65, { align: 'center' });
    doc.setFontSize(13);
    const ticketMedio = monthlyReport.total_orders > 0
      ? monthlyReport.total_revenue / monthlyReport.total_orders : 0;
    doc.text(formatPrice(ticketMedio), 167, 76, { align: 'center' });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHAMENTO DOS PEDIDOS', 14, 96);

    autoTable(doc, {
      startY: 100,
      head: [['Data', 'Mesa', 'Cliente', 'Itens', 'Total']],
      body: monthlyReport.orders.map(order => [
        formatDate(order.created_at),
        `#${order.table_number}`,
        order.customer_name,
        order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
        formatPrice(order.total)
      ]),
      headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 22 }, 1: { cellWidth: 15 }, 2: { cellWidth: 35 },
        3: { cellWidth: 80 }, 4: { cellWidth: 25, halign: 'right' }
      },
      foot: [['', '', '', 'TOTAL DO MÊS', formatPrice(monthlyReport.total_revenue)]],
      footStyles: { fillColor: [30, 30, 30], textColor: [245, 158, 11], fontStyle: 'bold', fontSize: 10 }
    });

    doc.save(`relatorio-${monthlyReport.month.replace('/', '-')}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleMarkDelivered = async (orderId) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, { status: 'delivered' });
      toast.success('Pedido finalizado!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao finalizar pedido');
    }
  };

  const formatPrice = (price) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const readyOrders = orders.filter(o => o.status === 'ready');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

  // Estilos reutilizáveis baseados no modo
  const bg       = d ? 'bg-stone-950'              : 'bg-gray-100';
  const cardBg   = d ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200 shadow-sm';
  const textMain = d ? 'text-white'                : 'text-stone-800';
  const textSub  = d ? 'text-stone-500'            : 'text-gray-500';
  const textMid  = d ? 'text-stone-300'            : 'text-stone-700';
  const textFade = d ? 'text-stone-400'            : 'text-gray-500';
  const rowHover = d ? 'border-stone-800 hover:bg-stone-800/50' : 'border-gray-100 hover:bg-gray-50';
  const headTxt  = d ? 'text-stone-400'            : 'text-gray-500';
  const inputBg  = d ? 'bg-stone-800 text-white placeholder-stone-500 border-stone-700 focus:border-red-500'
                     : 'bg-gray-100 text-stone-800 placeholder-gray-400 border-gray-300 focus:border-red-400';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}>

      {/* Modal Fechar Caixa */}
      {showCloseDay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className={`border rounded-2xl p-8 w-full max-w-sm shadow-2xl ${d ? 'bg-stone-900 border-red-500/30' : 'bg-white border-red-300'}`}>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${textMain}`}>Fechar Caixa</h2>
                <p className={`mt-1 ${textSub}`}>
                  Todos os pedidos entregues serão arquivados e o faturamento do dia será zerado.
                </p>
                <p className="text-amber-400 text-sm mt-2">
                  ⚠️ O relatório mensal não será afetado!
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Digite a senha para confirmar"
                value={closeDayPassword}
                onChange={e => setCloseDayPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCloseDay()}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${inputBg}`}
                autoFocus
              />
              <div className="flex gap-3">
                <Button onClick={() => { setShowCloseDay(false); setCloseDayPassword(''); }}
                  className={`flex-1 py-3 ${d ? 'bg-stone-700 hover:bg-stone-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-stone-700'}`}>
                  Cancelar
                </Button>
                <Button onClick={handleCloseDay}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white py-3"
                  disabled={closingDay}>
                  {closingDay ? 'Fechando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${d ? 'bg-green-600/20' : 'bg-green-100'}`}>
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold ${textMain}`} data-testid="cashier-title">
                CAIXA
              </h1>
              <p className={textSub}>{readyOrders.length} pedido(s) prontos para entrega</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            {/* Toggle dark/light */}
            <Button onClick={toggleDarkMode} variant="outline"
              className={`flex items-center gap-2 border transition-colors ${d ? 'bg-stone-800 border-stone-700 text-yellow-400 hover:bg-stone-700' : 'bg-white border-gray-300 text-stone-600 hover:bg-gray-50'}`}
              title={d ? 'Modo claro' : 'Modo escuro'}>
              {d ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline text-sm">{d ? 'Claro' : 'Escuro'}</span>
            </Button>
            <Button onClick={() => setShowCloseDay(true)} variant="outline"
              className="btn-secondary flex items-center gap-2 text-red-400">
              <CheckCircle2 className="w-4 h-4" />
              Fechar Caixa
            </Button>
            <Button onClick={fetchMonthlyReport} variant="outline"
              className="btn-secondary flex items-center gap-2 text-amber-400"
              disabled={loadingReport}>
              <TrendingUp className="w-4 h-4" />
              {loadingReport ? 'Carregando...' : 'Relatório do Mês'}
            </Button>
            <Button onClick={handleRefresh} variant="outline"
              className={`flex items-center gap-2 border transition-colors ${d ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-white border-gray-300 text-stone-600 hover:bg-gray-50'}`}
              disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </Button>
          </div>
        </div>

        {/* Stats Card */}
        <div className={`border rounded-xl p-6 mb-8 ${cardBg}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className={`text-sm mb-1 ${textSub}`}>Prontos</p>
              <p className="text-3xl text-green-500 font-bold">{readyOrders.length}</p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${textSub}`}>Entregues Hoje</p>
              <p className={`text-3xl font-bold ${textFade}`}>{deliveredOrders.length}</p>
            </div>
            <div className="col-span-2">
              <p className={`text-sm mb-1 ${textSub}`}>Faturamento do Dia</p>
              <p className="text-3xl text-amber-400 font-bold">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Monthly Report */}
        {showReport && monthlyReport && (
          <div className={`border border-amber-500/30 rounded-xl p-6 mb-8 ${d ? 'bg-stone-900' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-amber-400 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                RELATÓRIO — {monthlyReport.month.toUpperCase()}
              </h2>
              <div className="flex gap-2">
                <Button onClick={generatePDF} className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 py-2 px-4">
                  <FileText className="w-4 h-4" />
                  Gerar PDF
                </Button>
                <button onClick={() => setShowReport(false)} className={`text-xl px-2 ${textSub} hover:${textMain}`}>✕</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { icon: DollarSign, color: 'amber', label: 'Faturamento do Mês', value: formatPrice(monthlyReport.total_revenue) },
                { icon: ShoppingBag, color: 'green', label: 'Total de Pedidos', value: monthlyReport.total_orders },
                { icon: TrendingUp, color: 'blue', label: 'Ticket Médio', value: monthlyReport.total_orders > 0 ? formatPrice(monthlyReport.total_revenue / monthlyReport.total_orders) : formatPrice(0) },
              ].map(({ icon: Icon, color, label, value }) => (
                <div key={label} className={`rounded-xl p-4 flex items-center gap-4 ${d ? 'bg-stone-800' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-12 h-12 bg-${color}-500/20 rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                  </div>
                  <div>
                    <p className={`text-sm ${textSub}`}>{label}</p>
                    <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {monthlyReport.orders.length > 0 ? (
              <div className={`rounded-xl overflow-hidden ${d ? 'bg-stone-950/50' : 'bg-gray-50 border border-gray-200'}`}>
                <Table>
                  <TableHeader>
                    <TableRow className={d ? 'border-stone-800 hover:bg-transparent' : 'border-gray-200 hover:bg-transparent'}>
                      <TableHead className={headTxt}>Data</TableHead>
                      <TableHead className={headTxt}>Mesa</TableHead>
                      <TableHead className={headTxt}>Cliente</TableHead>
                      <TableHead className={headTxt}>Itens</TableHead>
                      <TableHead className={`${headTxt} text-right`}>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyReport.orders.map(order => (
                      <TableRow key={order.id} className={rowHover}>
                        <TableCell className={textFade}>{formatDate(order.created_at)}</TableCell>
                        <TableCell className={`font-bold ${textMain}`}>#{order.table_number}</TableCell>
                        <TableCell className={textMid}>{order.customer_name}</TableCell>
                        <TableCell className={`${textFade} text-sm`}>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                        <TableCell className="text-amber-400 font-bold text-right">{formatPrice(order.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={textSub}>Nenhum pedido entregue este mês ainda.</p>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {loading ? (
          <div className={`rounded-xl h-64 animate-pulse ${d ? 'bg-stone-900' : 'bg-gray-200'}`} />
        ) : (
          <div className="space-y-8">
            {readyOrders.length > 0 && (
              <div>
                <h2 className="text-2xl text-green-500 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  PRONTOS PARA ENTREGA
                </h2>
                <div className={`border rounded-xl overflow-hidden ${cardBg}`}>
                  <Table>
                    <TableHeader>
                      <TableRow className={d ? 'border-stone-800 hover:bg-transparent' : 'border-gray-200 hover:bg-transparent'}>
                        <TableHead className={headTxt}>Mesa</TableHead>
                        <TableHead className={headTxt}>Cliente</TableHead>
                        <TableHead className={headTxt}>Itens</TableHead>
                        <TableHead className={headTxt}>Hora</TableHead>
                        <TableHead className={`${headTxt} text-right`}>Total</TableHead>
                        <TableHead className={`${headTxt} text-right`}>Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readyOrders.map(order => (
                        <TableRow key={order.id} className={rowHover}>
                          <TableCell className={`font-bold text-lg ${textMain}`}>#{order.table_number}</TableCell>
                          <TableCell className={textMid}>{order.customer_name}</TableCell>
                          <TableCell className={textFade}>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                          <TableCell className={textSub}>
                            <Clock className="w-4 h-4 inline mr-1" />
                            {formatTime(order.created_at)}
                          </TableCell>
                          <TableCell className="text-amber-400 font-bold text-right">{formatPrice(order.total)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button onClick={() => printCashierOrder(order)}
                                className={`py-2 px-3 ${d ? 'bg-stone-700 hover:bg-stone-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-stone-700'}`}
                                title="Imprimir comprovante">
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => handleMarkDelivered(order.id)} className="btn-primary py-2 px-4">
                                Entregar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {deliveredOrders.length > 0 && (
              <div>
                <h2 className={`text-2xl mb-4 flex items-center gap-2 ${textSub}`}>
                  <CheckCircle2 className="w-6 h-6" />
                  PEDIDOS ENTREGUES HOJE
                </h2>
                <div className={`border rounded-xl overflow-hidden opacity-75 ${cardBg}`}>
                  <Table>
                    <TableHeader>
                      <TableRow className={d ? 'border-stone-800 hover:bg-transparent' : 'border-gray-200 hover:bg-transparent'}>
                        <TableHead className={headTxt}>Mesa</TableHead>
                        <TableHead className={headTxt}>Cliente</TableHead>
                        <TableHead className={headTxt}>Itens</TableHead>
                        <TableHead className={headTxt}>Hora</TableHead>
                        <TableHead className={`${headTxt} text-right`}>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveredOrders.slice(0, 10).map(order => (
                        <TableRow key={order.id} className={rowHover}>
                          <TableCell className={`font-medium ${textFade}`}>#{order.table_number}</TableCell>
                          <TableCell className={textSub}>{order.customer_name}</TableCell>
                          <TableCell className={`${textSub} text-sm`}>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                          <TableCell className={textSub}>{formatTime(order.created_at)}</TableCell>
                          <TableCell className={`${textSub} text-right`}>{formatPrice(order.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {orders.length === 0 && (
              <div className="text-center py-20">
                <CreditCard className={`w-16 h-16 mx-auto mb-4 ${d ? 'text-stone-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${textSub}`}>Nenhum pedido no caixa ainda</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CreditCard, RefreshCw, CheckCircle2, Clock, TrendingUp, ShoppingBag, DollarSign, FileText, Printer } from 'lucide-react';
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

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

      {/* Modal Fechar Caixa */}
      {showCloseDay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-stone-900 border border-red-500/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Fechar Caixa</h2>
                <p className="text-stone-400 mt-1">
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
                className="w-full bg-stone-800 text-white placeholder-stone-500 border border-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => { setShowCloseDay(false); setCloseDayPassword(''); }}
                  className="flex-1 bg-stone-700 hover:bg-stone-600 text-white py-3"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCloseDay}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white py-3"
                  disabled={closingDay}
                >
                  {closingDay ? 'Fechando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl text-white" data-testid="cashier-title">
              CAIXA
            </h1>
            <p className="text-stone-500">{readyOrders.length} pedido(s) prontos para entrega</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCloseDay(true)}
            variant="outline"
            className="btn-secondary flex items-center gap-2 text-red-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            Fechar Caixa
          </Button>
          <Button
            onClick={fetchMonthlyReport}
            variant="outline"
            className="btn-secondary flex items-center gap-2 text-amber-400"
            disabled={loadingReport}
          >
            <TrendingUp className="w-4 h-4" />
            {loadingReport ? 'Carregando...' : 'Relatório do Mês'}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="btn-secondary flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-stone-500 text-sm mb-1">Prontos</p>
            <p className="text-3xl text-green-500 font-bold">{readyOrders.length}</p>
          </div>
          <div>
            <p className="text-stone-500 text-sm mb-1">Entregues Hoje</p>
            <p className="text-3xl text-stone-400 font-bold">{deliveredOrders.length}</p>
          </div>
          <div className="col-span-2">
            <p className="text-stone-500 text-sm mb-1">Faturamento do Dia</p>
            <p className="text-3xl text-amber-400 font-bold">{formatPrice(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      {showReport && monthlyReport && (
        <div className="bg-stone-900 border border-amber-500/30 rounded-xl p-6 mb-8">
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
              <button onClick={() => setShowReport(false)} className="text-stone-500 hover:text-white text-xl px-2">✕</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-stone-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-stone-400 text-sm">Faturamento do Mês</p>
                <p className="text-2xl text-amber-400 font-bold">{formatPrice(monthlyReport.total_revenue)}</p>
              </div>
            </div>
            <div className="bg-stone-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-stone-400 text-sm">Total de Pedidos</p>
                <p className="text-2xl text-green-400 font-bold">{monthlyReport.total_orders}</p>
              </div>
            </div>
            <div className="bg-stone-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-stone-400 text-sm">Ticket Médio</p>
                <p className="text-2xl text-blue-400 font-bold">
                  {monthlyReport.total_orders > 0
                    ? formatPrice(monthlyReport.total_revenue / monthlyReport.total_orders)
                    : formatPrice(0)}
                </p>
              </div>
            </div>
          </div>

          {monthlyReport.orders.length > 0 ? (
            <div className="bg-stone-950/50 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-800 hover:bg-transparent">
                    <TableHead className="text-stone-400">Data</TableHead>
                    <TableHead className="text-stone-400">Mesa</TableHead>
                    <TableHead className="text-stone-400">Cliente</TableHead>
                    <TableHead className="text-stone-400">Itens</TableHead>
                    <TableHead className="text-stone-400 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyReport.orders.map(order => (
                    <TableRow key={order.id} className="border-stone-800 hover:bg-stone-800/50">
                      <TableCell className="text-stone-400">{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-white font-bold">#{order.table_number}</TableCell>
                      <TableCell className="text-stone-300">{order.customer_name}</TableCell>
                      <TableCell className="text-stone-400 text-sm">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                      <TableCell className="text-amber-400 font-bold text-right">{formatPrice(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-stone-500">Nenhum pedido entregue este mês ainda.</p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-stone-900 rounded-xl h-64 animate-pulse" />
      ) : (
        <div className="space-y-8">
          {readyOrders.length > 0 && (
            <div>
              <h2 className="text-2xl text-green-500 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                PRONTOS PARA ENTREGA
              </h2>
              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-800 hover:bg-transparent">
                      <TableHead className="text-stone-400">Mesa</TableHead>
                      <TableHead className="text-stone-400">Cliente</TableHead>
                      <TableHead className="text-stone-400">Itens</TableHead>
                      <TableHead className="text-stone-400">Hora</TableHead>
                      <TableHead className="text-stone-400 text-right">Total</TableHead>
                      <TableHead className="text-stone-400 text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyOrders.map(order => (
                      <TableRow key={order.id} className="border-stone-800 hover:bg-stone-800/50">
                        <TableCell className="font-bold text-white text-lg">#{order.table_number}</TableCell>
                        <TableCell className="text-stone-300">{order.customer_name}</TableCell>
                        <TableCell className="text-stone-400">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                        <TableCell className="text-stone-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(order.created_at)}
                        </TableCell>
                        <TableCell className="text-amber-400 font-bold text-right">{formatPrice(order.total)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => printCashierOrder(order)}
                              className="bg-stone-700 hover:bg-stone-600 text-white py-2 px-3"
                              title="Imprimir comprovante"
                            >
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
              <h2 className="text-2xl text-stone-500 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                PEDIDOS ENTREGUES HOJE
              </h2>
              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden opacity-75">
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-800 hover:bg-transparent">
                      <TableHead className="text-stone-500">Mesa</TableHead>
                      <TableHead className="text-stone-500">Cliente</TableHead>
                      <TableHead className="text-stone-500">Itens</TableHead>
                      <TableHead className="text-stone-500">Hora</TableHead>
                      <TableHead className="text-stone-500 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveredOrders.slice(0, 10).map(order => (
                      <TableRow key={order.id} className="border-stone-800 hover:bg-stone-800/50">
                        <TableCell className="font-medium text-stone-400">#{order.table_number}</TableCell>
                        <TableCell className="text-stone-500">{order.customer_name}</TableCell>
                        <TableCell className="text-stone-600 text-sm">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                        <TableCell className="text-stone-600">{formatTime(order.created_at)}</TableCell>
                        <TableCell className="text-stone-500 text-right">{formatPrice(order.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-20">
              <CreditCard className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-500 text-lg">Nenhum pedido no caixa ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
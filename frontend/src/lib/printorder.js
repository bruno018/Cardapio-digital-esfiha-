export function printKitchenOrder(order) {
  const formatPrice = (price) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const content = `
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            padding: 4mm;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .xlarge { font-size: 20px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .item-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .qty { font-weight: bold; color: #000; min-width: 25px; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="center bold xlarge">ESFIHARIA DIGITAL</div>
        <div class="center">--------------------------------</div>
        <div class="divider"></div>
        <div class="center bold large">PEDIDO COZINHA</div>
        <div class="center bold xlarge">#${order.table_number}</div>
        <div class="divider"></div>
        <div><span class="bold">Cliente:</span> ${order.customer_name}</div>
        <div><span class="bold">Hora:</span> ${formatTime(order.created_at)}</div>
        <div class="divider"></div>
        <div class="bold">ITENS:</div>
        <br/>
        ${order.items.map(item => `
          <div class="item-row">
            <span><span class="qty">${item.quantity}x</span> ${item.name}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="total-row">
          <span>TOTAL:</span>
          <span>${formatPrice(order.total)}</span>
        </div>
        <div class="divider"></div>
        <div class="center">*** PREPARO ***</div>
        <div class="divider"></div>
        <br/><br/><br/>
      </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(content);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

export function printCashierOrder(order) {
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

  const content = `
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            padding: 4mm;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .xlarge { font-size: 20px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .item-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .qty { font-weight: bold; min-width: 25px; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="center bold xlarge">ESFIHARIA DIGITAL</div>
        <div class="center">--------------------------------</div>
        <div class="divider"></div>
        <div class="center bold large">COMPROVANTE</div>
        <div class="center bold xlarge">#${order.table_number}</div>
        <div class="divider"></div>
        <div><span class="bold">Cliente:</span> ${order.customer_name}</div>
        <div><span class="bold">Data:</span> ${formatDate(order.created_at)}</div>
        <div><span class="bold">Hora:</span> ${formatTime(order.created_at)}</div>
        <div class="divider"></div>
        <div class="bold">ITENS:</div>
        <br/>
        ${order.items.map(item => `
          <div class="item-row">
            <span><span class="qty">${item.quantity}x</span> ${item.name}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="total-row">
          <span>TOTAL:</span>
          <span>${formatPrice(order.total)}</span>
        </div>
        <div class="divider"></div>
        <div class="center">Obrigado pela preferencia!</div>
        <div class="center">Volte sempre!</div>
        <div class="divider"></div>
        <br/><br/><br/>
      </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(content);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}
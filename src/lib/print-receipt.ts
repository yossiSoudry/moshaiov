import type { Order } from 'brainerce';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatILS(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : value || 0;
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? (n as number) : 0);
}

export function printOrderReceipt(order: Order): void {
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;

  const orderNumber =
    (order as { orderNumber?: string }).orderNumber || order.id;
  const dateStr = new Date(order.createdAt).toLocaleDateString('he-IL');
  const total = order.totalAmount || order.total || 0;
  const subtotal = order.subtotal ?? null;
  const shipping = order.shippingAmount ?? null;
  const tax = order.taxAmount ?? null;
  const discount = order.discountAmount ?? null;
  const addr = order.shippingAddress;

  const itemsHtml = (order.items || [])
    .map((item) => {
      const lineTotal =
        parseFloat(item.totalPrice || '') ||
        parseFloat(item.price || item.unitPrice || '0') * item.quantity;
      const unit = parseFloat(item.price || item.unitPrice || '0');
      return `
        <tr>
          <td>${escapeHtml(item.name || '')}${
        item.sku ? `<div class="muted">${escapeHtml(item.sku)}</div>` : ''
      }</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatILS(unit)}</td>
          <td class="num">${formatILS(lineTotal)}</td>
        </tr>`;
    })
    .join('');

  const addressHtml = addr
    ? `<div class="block">
         <h3>כתובת למשלוח</h3>
         <div>${escapeHtml(`${addr.firstName || ''} ${addr.lastName || ''}`.trim())}</div>
         <div>${escapeHtml(addr.line1)}${addr.line2 ? `, ${escapeHtml(addr.line2)}` : ''}</div>
         <div>${escapeHtml(addr.city)}${addr.postalCode ? `, ${escapeHtml(addr.postalCode)}` : ''}</div>
         ${addr.phone ? `<div>${escapeHtml(addr.phone)}</div>` : ''}
       </div>`
    : '';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
  <head>
    <meta charset="utf-8" />
    <title>קבלה - הזמנה #${escapeHtml(orderNumber)}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, "Segoe UI", "Heebo", Arial, sans-serif; color: #111; margin: 0; padding: 32px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
      .brand { font-size: 22px; font-weight: 700; }
      .meta { text-align: left; font-size: 13px; }
      .muted { color: #666; font-size: 12px; }
      h2 { font-size: 18px; margin: 0 0 8px; }
      h3 { font-size: 14px; margin: 0 0 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px; }
      th { background: #f5f5f5; }
      td.num, th.num { text-align: left; white-space: nowrap; }
      .totals { margin-top: 16px; margin-right: auto; width: 280px; }
      .totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
      .totals .total { border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; font-weight: 700; font-size: 15px; }
      .block { margin-top: 20px; font-size: 13px; }
      .footer { margin-top: 32px; text-align: center; color: #666; font-size: 12px; }
      @media print { body { padding: 16px; } .no-print { display: none; } }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="brand">MOSHAYOV</div>
        <div class="muted">תכשיטי זהב ויהלומים</div>
      </div>
      <div class="meta">
        <h2>קבלה</h2>
        <div>הזמנה #${escapeHtml(orderNumber)}</div>
        <div>${escapeHtml(dateStr)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>פריט</th>
          <th class="num">כמות</th>
          <th class="num">מחיר ליחידה</th>
          <th class="num">סה"כ</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      ${subtotal != null ? `<div class="row"><span>סכום ביניים</span><span>${formatILS(subtotal)}</span></div>` : ''}
      ${discount != null && parseFloat(discount) > 0 ? `<div class="row"><span>הנחה</span><span>- ${formatILS(discount)}</span></div>` : ''}
      ${shipping != null ? `<div class="row"><span>משלוח</span><span>${formatILS(shipping)}</span></div>` : ''}
      ${tax != null && parseFloat(tax) > 0 ? `<div class="row"><span>מע"מ</span><span>${formatILS(tax)}</span></div>` : ''}
      <div class="row total"><span>סה"כ לתשלום</span><span>${formatILS(total)}</span></div>
    </div>

    ${addressHtml}

    ${order.paymentMethod ? `<div class="block"><h3>אמצעי תשלום</h3><div>${escapeHtml(order.paymentMethod)}</div></div>` : ''}

    <div class="footer">תודה שקנית אצלנו · moshaiov.vercel.app</div>

    <script>
      window.addEventListener('load', function () {
        setTimeout(function () { window.print(); }, 200);
      });
    </script>
  </body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

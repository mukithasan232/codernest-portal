/**
 * CoderNest Invoice Generator Utility
 * File: src/lib/invoice-generator.ts
 *
 * Generates enterprise-grade, printable HTML invoice receipts for client billing,
 * automated Stripe checkout completions, and accounting records.
 */

export interface InvoiceLineItem {
  name: string;
  description?: string;
  quantity?: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceTemplateData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  companyName?: string | null;
  items: InvoiceLineItem[];
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'draft' | 'cancelled';
  paymentMethod?: string | null;
  stripeSessionId?: string | null;
  createdAt: Date | string;
  paidAt?: Date | string | null;
  dueDate?: Date | string | null;
}

/**
 * Generates an accessible, responsive, printable HTML invoice template
 */
export function generateInvoiceHtml(data: InvoiceTemplateData): string {
  const currencySymbol = data.currency.toUpperCase() === 'USD' ? '$' : data.currency.toUpperCase() === 'BDT' ? '৳' : `${data.currency.toUpperCase()} `;
  const formattedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedPaidDate = data.paidAt
    ? new Date(data.paidAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isPaid = data.status === 'paid';

  const rows = data.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 16px 12px; font-weight: 500; color: #1e293b;">
        <div style="font-weight: 600; font-size: 14px; color: #0f172a;">${item.name}</div>
        ${item.description ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">${item.description}</div>` : ''}
      </td>
      <td style="padding: 16px 12px; text-align: center; color: #475569; font-size: 14px;">${item.quantity ?? 1}</td>
      <td style="padding: 16px 12px; text-align: right; color: #475569; font-size: 14px;">${currencySymbol}${(item.unitPrice).toLocaleString()}</td>
      <td style="padding: 16px 12px; text-align: right; font-weight: 600; color: #0f172a; font-size: 14px;">${currencySymbol}${(item.total).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber} — CoderNest Digital Solutions</title>
  <style>
    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .invoice-container { box-shadow: none !important; border: none !important; max-width: 100% !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 32px 16px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      padding: 48px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 32px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    .brand-accent {
      color: #2563eb;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-paid {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .status-pending {
      background-color: #fef9c3;
      color: #854d0e;
      border: 1px solid #fef08a;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 40px;
    }
    .meta-box h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .meta-box p {
      margin: 0;
      font-size: 15px;
      line-height: 1.5;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    th {
      background-color: #f8fafc;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .summary-box {
      margin-left: auto;
      width: 280px;
      margin-top: 24px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      color: #64748b;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      border-top: 2px solid #0f172a;
      margin-top: 8px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 48px;
      padding-top: 24px;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="no-print" style="margin-bottom: 24px; display: flex; justify-content: flex-end; gap: 12px;">
      <button onclick="window.print()" style="cursor: pointer; background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">Print / Download PDF</button>
    </div>

    <div class="header">
      <div>
        <div class="brand-title">CoderNest<span class="brand-accent">.</span></div>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Enterprise Software & Digital Solutions</p>
        <p style="margin: 2px 0 0 0; color: #64748b; font-size: 13px;">billing@codernest.agency | https://codernest.agency</p>
      </div>
      <div style="text-align: right;">
        <div class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">
          ${data.status.toUpperCase()}
        </div>
        <h2 style="margin: 12px 0 0 0; font-size: 18px; font-weight: 700; color: #0f172a;">${data.invoiceNumber}</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Date: ${formattedDate}</p>
        ${formattedPaidDate ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #16a34a; font-weight: 600;">Paid: ${formattedPaidDate}</p>` : ''}
      </div>
    </div>

    <div class="details-grid">
      <div class="meta-box">
        <h4>Billed To:</h4>
        <p style="font-weight: 700; color: #0f172a;">${data.clientName || 'Valued Client'}</p>
        ${data.companyName ? `<p style="color: #475569;">${data.companyName}</p>` : ''}
        <p style="color: #64748b; font-size: 14px;">${data.clientEmail}</p>
      </div>
      <div class="meta-box" style="text-align: right;">
        <h4>Payment Info:</h4>
        <p style="color: #475569;">Method: <strong>${data.paymentMethod || 'Stripe Secure Checkout'}</strong></p>
        ${data.stripeSessionId ? `<p style="font-size: 11px; color: #94a3b8; word-break: break-all;">Ref: ${data.stripeSessionId}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${currencySymbol}${data.amount.toLocaleString()}</span>
      </div>
      <div class="summary-row">
        <span>Tax & Processing</span>
        <span>${currencySymbol}0.00</span>
      </div>
      <div class="summary-total">
        <span>Total Paid</span>
        <span>${currencySymbol}${data.amount.toLocaleString()}</span>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0;">Thank you for partnering with CoderNest Digital Solutions.</p>
      <p style="margin: 0; font-size: 11px;">Flagship Engineering: MedOS &bull; SMM Elite &bull; CoderNest Cinema &bull; DevVibe</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

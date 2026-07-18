import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import type { Invoice } from '@/types';
import { DollarSign, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

const STATUS_ICONS: Record<string, any> = {
  draft:    { icon: Clock,        color: 'text-slate-400', bg: 'bg-slate-400/10' },
  pending:  { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  paid:     { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-400/10' },
  overdue:  { icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-400/10' },
};

export default async function DashboardInvoicesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const appUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  
  if (!appUser) {
    redirect('/auth/login');
  }

  const data = await prisma.invoice.findMany({
    where: { clientId: appUser.id },
    orderBy: { createdAt: 'desc' }
  });

  const invoices = data as unknown as Invoice[];

  const total = invoices.reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
  const paid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Invoices</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and pay your outstanding invoices.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Billed',   value: total,       color: 'text-slate-900 dark:text-white' },
          { label: 'Paid',           value: paid,        color: 'text-green-500 dark:text-green-400' },
          { label: 'Outstanding',    value: outstanding, color: 'text-yellow-500 dark:text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${s.color}`}>
              ${s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {invoices.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <DollarSign className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400">No invoices yet.</p>
            </div>
          ) : (
            invoices.map(inv => {
              const sc = STATUS_ICONS[inv.status as string] || STATUS_ICONS.draft;
              const StatusIcon = sc.icon;
              const paymentLink = inv.stripePaymentLink ?? inv.paypalLink ?? inv.escrowLink;

              return (
                <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${sc.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        #{inv.id.slice(0, 8).toUpperCase()} · ${inv.amount.toLocaleString()} {inv.currency}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(inv.createdAt).toLocaleDateString()} · {inv.paymentMethod ?? 'Stripe'}
                        {inv.dueDate ? ` · Due: ${new Date(inv.dueDate).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold capitalize px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                      {inv.status}
                    </span>
                    {inv.status !== 'paid' && paymentLink && (
                      <a
                        id={`pay-invoice-${inv.id}`}
                        href={paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Pay Now <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

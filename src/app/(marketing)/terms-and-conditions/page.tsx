import { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | CoderNest',
  description: 'Our Terms and Conditions covering software development, digital solutions, and user responsibilities at CoderNest.',
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-50 overflow-hidden pt-32 pb-24 transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00F2FE]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            Terms and Conditions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="glass dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] prose prose-slate dark:prose-invert prose-blue max-w-none shadow-sm">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing our website and utilizing our software development and digital solutions, you agree to be bound by these Terms and Conditions and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site.
          </p>

          <h2>2. Services and Software Development</h2>
          <p>
            CoderNest provides elite B2B software engineering, web infrastructure management, e-commerce solutions, and digital branding. 
          </p>
          <ul>
            <li>All timelines and deliverables discussed are estimates unless formalized in a binding Statement of Work (SOW) or contract.</li>
            <li>We reserve the right to refuse service, terminate accounts, or cancel projects at our sole discretion if terms are violated.</li>
          </ul>

          <h2>3. Intellectual Property Rights</h2>
          <p>
            Unless otherwise stated in a specific contract, all materials, custom code, architecture, and design created by CoderNest remain our intellectual property until full payment is received. Upon full payment, the specific rights outlined in your contract will be transferred to you.
          </p>

          <h2>4. User Responsibilities</h2>
          <p>
            As a user or client, you agree to:
          </p>
          <ul>
            <li>Provide accurate, complete, and current information when communicating with us.</li>
            <li>Maintain the security of your accounts and passwords related to any deployed infrastructure.</li>
            <li>Not use our services for any illegal or unauthorized purpose.</li>
          </ul>

          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall CoderNest or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials or software on our platform, even if CoderNest or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h2>6. Revisions and Errata</h2>
          <p>
            The materials appearing on our website could include technical, typographical, or photographic errors. CoderNest does not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            For any questions or concerns regarding these Terms and Conditions, please contact us via our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Page</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}

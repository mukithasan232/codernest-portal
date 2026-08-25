import { Metadata } from 'next';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | CoderNest',
  description: 'Our Privacy Policy outlines how CoderNest collects, uses, and protects your data when using our digital services and tech portal.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-50 overflow-hidden pt-32 pb-24 transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="glass dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] prose prose-slate dark:prose-invert prose-blue max-w-none shadow-sm">
          <h2>1. Introduction</h2>
          <p>
            Welcome to CoderNest ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>

          <h2>2. The Data We Collect About You</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul>
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            <li><strong>Usage Data:</strong> includes information about how you use our website, products, and services.</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g. software development services).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
          </p>

          <h2>5. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us via our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Page</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}

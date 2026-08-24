# CoderNest Portal 🚀

An elite, full-stack B2B agency platform built for high-performance marketing, seamless client management, and automated operations. 

Built with a modern stack featuring **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** powered by **MongoDB**.

---

## 🌟 Key Features

### 🏛 B2B Marketing & Growth Engine
- **Programmatic SEO (pSEO):** Dynamically generated, hyper-targeted landing pages for specific high-value cities (e.g., `/agency/new-york`) designed to rank without triggering Doorway Page penalties.
- **Dynamic Case Studies & Blogs:** A robust, SEO-optimized CMS for publishing thought leadership and demonstrating ROI.
- **Live Visitor Tracking:** A custom, privacy-focused tracking engine capturing live active sessions, page views, and time-on-site metrics natively within the platform.

### 💼 Admin & CRM Dashboard
- **Centralized Lead Management:** Track inbound leads, with a robust Papaparse-powered **Bulk CSV Import** tool for Apollo.io/Excel outreach campaigns.
- **Real-Time Traffic Monitor:** Watch live user journeys across the site in a beautifully designed, dark-themed admin interface.
- **Content Management System:** Manage services, blogs, dynamic pages, and case studies directly from the UI.

### 🤝 Client Portal
- **Secure Authentication:** Passwordless OAuth via Google, combined with secure credential logins via **NextAuth.js**.
- **Invoicing & Payments:** Integrated with **Stripe** (via secure Webhooks) to manage packages and automated invoice status updates.
- **Image Processing Studio:** A dedicated workspace for clients to upload, manage, and download processed image orders.

---

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Glassmorphism, Dark-mode optimized)
- **Database:** MongoDB
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Auth.js)
- **Payments:** Stripe
- **Emails:** Resend & Nodemailer
- **Icons:** Lucide React

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/codernest-portal.git
cd codernest-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the example environment file and fill in the required keys.
```bash
cp .env.example .env.local
```
*Crucial variables include: `DATABASE_URL`, `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and your `RESEND_API_KEY`.*

### 4. Database Setup
Push the Prisma schema to your MongoDB cluster to initialize the database:
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🏗 Architecture & Best Practices

- **Strict Null Safety:** Database fetches are meticulously wrapped in `try-catch` blocks with robust fallbacks to prevent `500 Internal Server Errors`.
- **API Resilience:** Webhook routes (like Stripe) gracefully handle unhandled promise rejections to ensure third-party retry loops function correctly.
- **Modern UI/UX:** Built with a premium aesthetic featuring micro-animations, subtle gradients, and consistent typography. No generic placeholder data—only authentic, production-ready content.

---

## 📦 Deployment (Vercel)

The application is highly optimized for deployment on Vercel. 

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add all `[REQUIRED]` environment variables listed in `.env.example` to the Vercel project settings.
4. Deploy! Vercel will automatically run `prisma generate` during the build step.

*(Note: Ensure file uploads are migrated to Vercel Blob or Amazon S3 before scaling, as the Vercel serverless filesystem is ephemeral).*

---

*Designed and engineered by the CoderNest Team.*

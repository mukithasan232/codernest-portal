const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const articles = [
  {
    title: "The Ultimate Guide to Scaling Node.js Microservices in 2026",
    slug: "scaling-nodejs-microservices-2026",
    excerpt: "Discover the most effective strategies and architectural patterns for scaling Node.js microservices in enterprise B2B environments.",
    tags: ["Node.js", "Microservices", "Enterprise", "Scaling"],
    content: `
      <h2>The Evolution of Node.js Microservices</h2>
      <p>As enterprise SaaS architectures grow in complexity, Node.js has solidified its position as the premier runtime for scalable microservices. Moving into 2026, the focus has shifted from mere containerization to highly orchestrated, event-driven architectures that can handle millions of concurrent connections.</p>
      
      <h2>Architectural Patterns for High Throughput</h2>
      <p>Scaling a Node.js microservice requires moving beyond simple horizontal scaling. Modern systems must adopt:</p>
      <ul>
        <li><strong>Event-Driven Communication:</strong> Decoupling services using Kafka or RabbitMQ ensures that spikes in traffic do not cause cascading failures.</li>
        <li><strong>CQRS (Command Query Responsibility Segregation):</strong> Separating read and write workloads allows you to scale databases independently based on usage patterns.</li>
        <li><strong>Stateless Compute:</strong> Ensuring all user sessions and states are managed in distributed caches like Redis Cluster.</li>
      </ul>

      <h2>Code Example: Graceful Shutdown in Node.js</h2>
      <p>When orchestrating microservices in Kubernetes, graceful shutdowns are critical to prevent dropped requests during pod evictions.</p>
      <pre><code class="language-javascript">
const server = app.listen(PORT, () => console.log('Server running'));

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
      </code></pre>
      
      <h2>Monitoring and Observability</h2>
      <p>Without deep observability, scaling is impossible. Implementing OpenTelemetry across all Node.js instances allows engineering teams to trace requests across microservice boundaries, identifying latency bottlenecks before they impact the end-user.</p>
    `
  },
  {
    title: "Next.js App Router vs Pages: Which is Better for Enterprise SaaS?",
    slug: "nextjs-app-router-vs-pages-enterprise-saas",
    excerpt: "An in-depth comparison of Next.js App Router and Pages Router, focusing on performance, caching, and enterprise SaaS scalability.",
    tags: ["Next.js", "React", "SaaS", "Architecture"],
    content: `
      <h2>The Paradigm Shift in React Frameworks</h2>
      <p>The introduction of the Next.js App Router fundamentally changed how developers build React applications. For enterprise SaaS companies deciding between the legacy Pages Router and the new App Router, understanding the underlying architectural differences is paramount.</p>

      <h2>Server Components vs. Client Components</h2>
      <p>The App Router leverages React Server Components (RSC) by default. This is a game-changer for B2B applications:</p>
      <ul>
        <li><strong>Reduced Bundle Sizes:</strong> Heavy dependencies required for data fetching or formatting never reach the client browser.</li>
        <li><strong>Direct Backend Access:</strong> Server components can query databases (like PostgreSQL or MongoDB) securely without building intermediary API routes.</li>
        <li><strong>Streaming and Suspense:</strong> The App Router allows for progressive UI rendering, significantly improving perceived load times for complex dashboard views.</li>
      </ul>

      <h2>Caching Architecture</h2>
      <p>The caching mechanisms in the App Router are significantly more aggressive and granular compared to the Pages Router.</p>
      <pre><code class="language-typescript">
// Example: Revalidating data in the App Router
export async function getEnterpriseData() {
  const res = await fetch('https://api.example.com/data', { 
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  return res.json();
}
      </code></pre>

      <h2>Conclusion: The Enterprise Verdict</h2>
      <p>While the Pages Router remains stable, the App Router is the undisputed future. Enterprise SaaS platforms migrating to the App Router benefit from superior SEO, vastly improved Core Web Vitals, and a simplified mental model for data fetching.</p>
    `
  },
  {
    title: "How to Optimize Core Web Vitals for High-Volume B2B Portals",
    slug: "optimize-core-web-vitals-b2b-portals",
    excerpt: "Learn actionable techniques to dramatically improve Core Web Vitals (LCP, FID, CLS) for data-heavy B2B enterprise portals.",
    tags: ["Performance", "SEO", "Core Web Vitals", "B2B"],
    content: `
      <h2>Why Core Web Vitals Matter for B2B</h2>
      <p>Core Web Vitals (CWV) are not just an SEO ranking factor; they directly impact user retention and conversion rates. In data-heavy B2B portals—where users rely on dashboards for critical business decisions—a sluggish UI translates directly to lost productivity and increased churn.</p>

      <h2>Tackling Largest Contentful Paint (LCP)</h2>
      <p>LCP measures loading performance. For enterprise dashboards, the LCP is often a large data table or chart. To optimize this:</p>
      <ul>
        <li><strong>Preload Critical Assets:</strong> Use <code>&lt;link rel="preload"&gt;</code> for hero images or critical web fonts.</li>
        <li><strong>Server-Side Rendering (SSR):</strong> Deliver pre-rendered HTML to the browser to ensure the main content is visible immediately.</li>
        <li><strong>Optimize API Responses:</strong> Ensure backend APIs supporting the initial view respond in under 200ms using caching layers like Redis.</li>
      </ul>

      <h2>Improving Cumulative Layout Shift (CLS)</h2>
      <p>Visual stability is crucial. A common issue in SPAs is layout shifting as dynamic data loads.</p>
      <pre><code class="language-css">
/* Example: Reserving space for dynamic components */
.dashboard-chart-container {
  aspect-ratio: 16 / 9;
  min-height: 400px;
  background-color: #f3f4f6; /* Skeleton background */
}
      </code></pre>

      <h2>Optimizing First Input Delay (FID) and INP</h2>
      <p>Interaction to Next Paint (INP) is replacing FID. To ensure responsiveness, offload heavy client-side computations (like parsing large JSON datasets) to Web Workers, keeping the main thread free to handle user interactions instantly.</p>
    `
  },
  {
    title: "Integrating OpenAI API with Prisma and MongoDB: A CTO's Guide",
    slug: "integrating-openai-prisma-mongodb-cto-guide",
    excerpt: "A comprehensive guide for technical leaders on integrating OpenAI's generative models with Prisma ORM and MongoDB.",
    tags: ["AI", "OpenAI", "Prisma", "MongoDB"],
    content: `
      <h2>The Intersection of AI and Enterprise Data</h2>
      <p>Generative AI is transforming B2B workflows, from automated customer support routing to predictive data analysis. Integrating the OpenAI API alongside a modern data stack (Prisma and MongoDB) provides a powerful, scalable foundation for these intelligent features.</p>

      <h2>Schema Design for AI Context</h2>
      <p>When working with LLMs, managing conversation context and embeddings is critical. Using MongoDB allows for flexible document structures, while Prisma provides type safety.</p>
      <ul>
        <li><strong>Storing Embeddings:</strong> Utilize MongoDB's Atlas Vector Search capabilities by storing OpenAI embeddings as arrays of floats.</li>
        <li><strong>Context Window Management:</strong> Structure schemas to easily retrieve the last 'N' messages to fit within the model's token limits.</li>
      </ul>

      <h2>Code Example: Generating and Storing Embeddings</h2>
      <pre><code class="language-typescript">
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function storeDocumentEmbedding(text: string, docId: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  
  const embedding = response.data[0].embedding;
  
  // Note: Vector storage implementation depends on specific DB features
  await prisma.document.update({
    where: { id: docId },
    data: { embeddingVector: embedding }
  });
}
      </code></pre>

      <h2>Security and Cost Considerations</h2>
      <p>As a CTO, governing API usage is paramount. Implement strict rate limiting using Upstash/Redis, cache repetitive queries using semantic caching, and never expose OpenAI keys directly in client-side bundles.</p>
    `
  },
  {
    title: "The ROI of Custom Web Applications over Off-the-Shelf Software",
    slug: "roi-custom-web-applications-vs-off-the-shelf",
    excerpt: "Analyze the long-term financial and operational benefits of investing in custom-built web applications compared to generic SaaS solutions.",
    tags: ["Business", "Custom Software", "ROI", "SaaS"],
    content: `
      <h2>Beyond the Initial Price Tag</h2>
      <p>When evaluating software solutions, enterprises frequently default to off-the-shelf (COTS) products due to perceived lower upfront costs. However, a comprehensive Total Cost of Ownership (TCO) analysis often reveals that custom web applications deliver a significantly higher Return on Investment (ROI) over a 3-5 year horizon.</p>

      <h2>Operational Efficiency and Workflow Alignment</h2>
      <p>The primary advantage of custom software is exact alignment with business processes.</p>
      <ul>
        <li><strong>Eliminating Workarounds:</strong> Generic software forces teams to adapt their workflows to the tool. Custom software adapts to the team, eliminating manual data entry and spreadsheet workarounds.</li>
        <li><strong>Integration Capabilities:</strong> Custom apps are built to interface flawlessly with existing legacy systems, preventing data silos.</li>
        <li><strong>No Per-User Licensing Fees:</strong> As the company scales, SaaS subscription costs grow exponentially. Custom software requires only hosting and maintenance costs, resulting in massive savings at scale.</li>
      </ul>

      <h2>Capitalizing on Proprietary IP</h2>
      <p>Investing in custom software means building proprietary Intellectual Property. The application itself becomes a tangible asset on the company's balance sheet, increasing the overall valuation of the business.</p>

      <h2>Strategic Flexibility</h2>
      <p>With an off-the-shelf solution, feature requests are at the mercy of the vendor's roadmap. Custom software ensures that as the market pivots, the enterprise can rapidly deploy new features to maintain a competitive edge without waiting for third-party updates.</p>
    `
  },
  {
    title: "Building Secure Authentication Pipelines in Next.js",
    slug: "secure-authentication-pipelines-nextjs",
    excerpt: "Explore best practices for implementing robust, zero-trust authentication and authorization pipelines in Next.js applications.",
    tags: ["Security", "Next.js", "Authentication", "Zero Trust"],
    content: `
      <h2>The Complexity of Modern Authentication</h2>
      <p>Authentication in single-page applications and SSR frameworks like Next.js has evolved significantly. Enterprise security demands more than simple JWTs in local storage; it requires defense-in-depth, zero-trust principles, and robust session management.</p>

      <h2>Implementing Secure Session Management</h2>
      <p>When building with Next.js, HTTP-only, secure cookies are the gold standard for session storage. They protect against Cross-Site Scripting (XSS) attacks by preventing JavaScript access to the token.</p>
      <ul>
        <li><strong>NextAuth.js (Auth.js):</strong> Utilizing industry-standard libraries ensures that OAuth flows, CSRF protection, and session rotation are handled correctly out of the box.</li>
        <li><strong>Role-Based Access Control (RBAC):</strong> Authorization must occur at the server level, particularly within Next.js Server Actions or API routes, never relying solely on client-side route guards.</li>
      </ul>

      <h2>Code Example: Protecting Server Actions</h2>
      <pre><code class="language-typescript">
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function deleteEnterpriseUser(userId: string) {
  const session = await getServerSession(authOptions);
  
  // Strict server-side authorization check
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized access attempt.");
  }

  // Proceed with deletion
  await db.user.delete({ where: { id: userId } });
}
      </code></pre>

      <h2>Multi-Factor Authentication (MFA)</h2>
      <p>For B2B platforms handling sensitive financial or PII data, MFA is non-negotiable. Integrating Time-based One-Time Passwords (TOTP) or WebAuthn (Passkeys) provides an essential layer of security against credential stuffing and phishing attacks.</p>
    `
  },
  {
    title: "Why High-Contrast UI is Critical for B2B Dashboard Accessibility",
    slug: "high-contrast-ui-b2b-dashboard-accessibility",
    excerpt: "Understand the importance of accessibility and high-contrast UI design in enterprise B2B dashboards for improved user productivity.",
    tags: ["UI/UX", "Accessibility", "Design", "B2B"],
    content: `
      <h2>Accessibility is Not an Afterthought</h2>
      <p>In consumer applications, aesthetics often drive design decisions. However, in B2B enterprise dashboards, function, clarity, and accessibility must take precedence. Employees spend 8+ hours a day interfacing with these tools; poor design directly translates to visual fatigue, increased error rates, and reduced productivity.</p>

      <h2>The Case for High-Contrast Data Visualization</h2>
      <p>Dashboards rely heavily on charts, graphs, and data tables. Ensuring high contrast is vital for several reasons:</p>
      <ul>
        <li><strong>WCAG Compliance:</strong> Legal requirements in many jurisdictions mandate adherence to Web Content Accessibility Guidelines (WCAG) 2.1 AA, requiring a contrast ratio of at least 4.5:1 for normal text.</li>
        <li><strong>Environmental Factors:</strong> Users may access dashboards in poorly lit server rooms, brightly lit offices with screen glare, or via low-quality external monitors. High contrast ensures legibility across all environments.</li>
        <li><strong>Cognitive Load Reduction:</strong> Clear delineation between data points allows users to parse complex information rapidly without straining.</li>
      </ul>

      <h2>Implementing Tailwind CSS for Contrast</h2>
      <p>Modern utility frameworks like Tailwind CSS make implementing accessible themes straightforward.</p>
      <pre><code class="language-html">
<!-- Example: High contrast alert banner -->
<div class="bg-red-900 border-l-4 border-red-500 p-4 text-white font-medium" role="alert">
  <p>Critical System Failure: Immediate action required.</p>
</div>
      </code></pre>

      <h2>The Business Value of Inclusive Design</h2>
      <p>By prioritizing high-contrast UI and comprehensive keyboard navigation, B2B software vendors demonstrate a commitment to inclusive design. This not only mitigates legal risk but broadens the addressable user base and significantly enhances overall user satisfaction and software adoption rates.</p>
    `
  },
  {
    title: "Database Indexing Strategies for MongoDB on Large Datasets",
    slug: "database-indexing-strategies-mongodb-large-datasets",
    excerpt: "Master advanced MongoDB indexing strategies to ensure optimal query performance and scalability when handling massive B2B datasets.",
    tags: ["MongoDB", "Database", "Performance", "Indexing"],
    content: `
      <h2>The Performance Wall</h2>
      <p>MongoDB's flexible schema makes it a favorite for rapid development, but as a B2B platform scales to millions of documents, unstructured querying hits a performance wall. Without a deliberate indexing strategy, full collection scans will paralyze CPU resources and spike latency.</p>

      <h2>Core Indexing Principles in MongoDB</h2>
      <p>Effective indexing requires analyzing query patterns before applying indexes. Unnecessary indexes consume RAM and slow down write operations.</p>
      <ul>
        <li><strong>Compound Indexes:</strong> When queries filter on multiple fields, a compound index (e.g., <code>{ tenantId: 1, status: 1, createdAt: -1 }</code>) is essential. The ESR (Equality, Sort, Range) rule must dictate the field order.</li>
        <li><strong>Covered Queries:</strong> Design indexes that contain all the fields requested in the query projection. When an index covers a query, MongoDB doesn't need to fetch the actual document from disk, resulting in lightning-fast reads.</li>
        <li><strong>Partial Indexes:</strong> If you only query for "active" users, create a partial index to reduce memory footprint.</li>
      </ul>

      <h2>Code Example: Prisma and MongoDB Compound Indexes</h2>
      <pre><code class="language-prisma">
model Order {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  tenantId  String   @db.ObjectId
  status    String
  amount    Float
  createdAt DateTime @default(now())

  // Compound index following the ESR rule
  @@index([tenantId, status, createdAt(sort: Desc)])
}
      </code></pre>

      <h2>Monitoring Index Usage</h2>
      <p>Building indexes is only half the battle. DBAs must regularly utilize the <code>$indexStats</code> aggregation pipeline or MongoDB Atlas Performance Advisor to identify unused indexes and drop them, freeing up critical memory resources.</p>
    `
  },
  {
    title: "Automating Lead Generation Funnels with Serverless Queues",
    slug: "automating-lead-generation-funnels-serverless-queues",
    excerpt: "Learn how to build resilient, automated lead generation pipelines using serverless message queues and background processing.",
    tags: ["Automation", "Serverless", "Marketing", "Architecture"],
    content: `
      <h2>The Problem with Synchronous Webhooks</h2>
      <p>In marketing technology, speed is critical. However, when a new lead submits a form, triggering synchronous API calls to CRMs (like Salesforce), email providers, and Slack can lead to unacceptable delays or complete failures if a third-party API is down. The solution lies in decoupled, serverless message queues.</p>

      <h2>Architecting an Event-Driven Funnel</h2>
      <p>By implementing an event-driven architecture using tools like Upstash QStash, AWS SQS, or Vercel Functions, you guarantee delivery and resilience.</p>
      <ul>
        <li><strong>Immediate Response:</strong> The initial API route simply validates the payload, pushes a message to the queue, and returns a 200 OK to the user instantly.</li>
        <li><strong>Automatic Retries:</strong> If the external CRM API returns a 500 error, the serverless queue automatically applies exponential backoff and retries the webhook without manual intervention.</li>
        <li><strong>Dead Letter Queues (DLQ):</strong> Messages that fail repeatedly are safely stored in a DLQ for engineering review, ensuring zero data loss.</li>
      </ul>

      <h2>Code Example: Publishing to a Serverless Queue</h2>
      <pre><code class="language-typescript">
import { Client } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: Request) {
  const leadData = await req.json();
  
  // Publish event asynchronously
  await qstash.publishJSON({
    url: "https://api.example.com/webhooks/process-lead",
    body: leadData,
    retries: 3,
  });

  return new Response(JSON.stringify({ status: "Lead captured" }), { status: 200 });
}
      </code></pre>

      <h2>Scalability and Cost</h2>
      <p>Serverless queues operate on a pay-per-execution model. During viral marketing campaigns with massive traffic spikes, the queue absorbs the impact, protecting downstream databases and legacy systems from being overwhelmed, all while maintaining absolute cost efficiency.</p>
    `
  },
  {
    title: "Advanced Image Optimization Techniques for Next.js Platforms",
    slug: "advanced-image-optimization-nextjs-platforms",
    excerpt: "Deep dive into advanced image compression, dynamic resizing, and modern formats (WebP/AVIF) for Next.js e-commerce and media platforms.",
    tags: ["Next.js", "Performance", "Images", "Optimization"],
    content: `
      <h2>The Weight of Visual Media</h2>
      <p>In highly visual B2B portfolios and enterprise e-commerce platforms, images frequently account for over 70% of the total page weight. Unoptimized images destroy load times, tank SEO rankings, and drastically increase CDN bandwidth costs. Mastering advanced optimization is a strict necessity.</p>

      <h2>Leveraging the Next.js Image Component</h2>
      <p>The native <code>next/image</code> component handles heavy lifting out of the box, but requires proper configuration for maximum impact.</p>
      <ul>
        <li><strong>Format Negotiation:</strong> Always configure the server to serve AVIF formats to compatible browsers. AVIF provides superior compression to WebP, often reducing file sizes by an additional 20-30% with no quality loss.</li>
        <li><strong>Sizing and Layout Shift:</strong> Always provide explicit <code>width</code> and <code>height</code> attributes. If images are dynamic, utilize the <code>fill</code> property combined with a relative wrapper to prevent Cumulative Layout Shift (CLS).</li>
        <li><strong>Priority Loading:</strong> Utilize the <code>priority={true}</code> flag exclusively for the Largest Contentful Paint (LCP) element (typically the hero image).</li>
      </ul>

      <h2>Code Example: Optimal Next/Image Implementation</h2>
      <pre><code class="language-tsx">
import Image from 'next/image';

export default function HeroSection({ heroImageUrl }) {
  return (
    <div className="relative w-full h-[600px]">
      <Image
        src={heroImageUrl}
        alt="Enterprise Dashboard Preview"
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, 1200px"
        priority
        quality={85}
      />
    </div>
  );
}
      </code></pre>

      <h2>Offloading to Dedicated CDNs</h2>
      <p>While Next.js has a built-in image optimizer, scaling to tens of thousands of dynamic images requires a dedicated image CDN like Cloudinary or Imgix. Utilizing a custom loader in Next.js offloads the CPU-intensive resizing process from your Vercel edge functions, resulting in faster response times and significantly reduced compute bills.</p>
    `
  }
];

async function seed() {
  try {
    // Get or create author
    let author = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!author) {
      author = await prisma.user.create({
        data: {
          name: "System Admin",
          email: "admin@codernest.cloud",
          role: "SUPER_ADMIN",
        }
      });
      console.log("Created default author user.");
    }

    console.log(`Using author ID: ${author.id}`);

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      const daysAgo = 45 - (i * 4); 
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      // Using upsert to ensure we overwrite any generic content from previous attempts
      const blog = await prisma.blog.upsert({
        where: { slug: article.slug },
        update: {
          content: article.content,
          excerpt: article.excerpt,
          metaTitle: article.title,
          metaDesc: article.excerpt,
          tags: article.tags,
          status: "published",
        },
        create: {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          metaTitle: article.title,
          metaDesc: article.excerpt,
          tags: article.tags,
          status: "published",
          authorId: author.id,
          createdAt: createdAt,
          updatedAt: createdAt,
        }
      });

      console.log(`[SUCCESS] Upserted: ${article.title}`);
    }

    console.log("Unique Seeding complete! 10 Distinct AdSense-compliant articles injected.");

  } catch (error) {
    console.error("Error seeding blogs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

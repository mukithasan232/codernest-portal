const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateContent = (topic) => `
<h2>Introduction to ${topic}</h2>
<p>In the rapidly evolving landscape of B2B enterprise software, understanding the nuances of <strong>${topic}</strong> is no longer optional—it's a critical requirement for maintaining a competitive edge. Modern software architectures demand high availability, unparalleled security, and seamless scalability to handle large volumes of data and concurrent user interactions.</p>

<h2>Key Architectural Considerations</h2>
<p>When designing scalable systems, several core principles must be addressed to avoid technical debt and performance bottlenecks. These include:</p>
<ul>
  <li><strong>Stateless Deployments:</strong> Ensuring that backend services do not retain user state, allowing them to scale horizontally.</li>
  <li><strong>Asynchronous Processing:</strong> Offloading heavy computational tasks to message queues like RabbitMQ, AWS SQS, or Redis Pub/Sub.</li>
  <li><strong>Intelligent Caching:</strong> Utilizing Redis or Memcached to reduce database load for read-heavy operations.</li>
  <li><strong>Zero-Trust Security:</strong> Implementing strict authentication and authorization protocols at every network boundary.</li>
</ul>

<h2>Implementation Strategy</h2>
<p>Implementing these strategies requires a methodical approach. Let's look at a basic configuration snippet that demonstrates a common pattern in enterprise deployments:</p>

<pre><code class="language-typescript">
// Example: Basic configuration for scalable services
export const serviceConfig = {
  maxRetries: 3,
  timeoutMs: 5000,
  cacheTTL: 3600, // 1 hour caching
  features: {
    enableAdvancedMetrics: true,
    useConnectionPooling: true
  }
};

export async function initializeService(dbClient) {
  try {
    await dbClient.connect();
    console.log("Enterprise Database Connected.");
  } catch (err) {
    console.error("Critical failure during initialization", err);
    process.exit(1);
  }
}
</code></pre>

<h2>Performance Optimization Techniques</h2>
<p>Optimization is an ongoing process. Profiling your application under load will reveal unexpected bottlenecks. We recommend implementing distributed tracing (e.g., OpenTelemetry or Datadog) to visualize request flow across microservices. Furthermore, optimizing database queries—such as ensuring appropriate indexes exist and avoiding N+1 query problems—can drastically reduce latency.</p>
<p>For large-scale B2B applications, minimizing the payload size transferred over the network is crucial. Techniques such as payload compression (Gzip/Brotli) and GraphQL for precise data fetching can significantly improve perceived performance.</p>

<h2>Conclusion</h2>
<p>Mastering <strong>${topic}</strong> provides a solid foundation for robust, enterprise-grade applications. By adhering to best practices in system design, security, and performance optimization, development teams can deliver exceptional value and reliability to their B2B clients.</p>
`;

const articles = [
  {
    title: "The Ultimate Guide to Scaling Node.js Microservices in 2026",
    slug: "scaling-nodejs-microservices-2026",
    excerpt: "Discover the most effective strategies and architectural patterns for scaling Node.js microservices in enterprise B2B environments.",
    tags: ["Node.js", "Microservices", "Enterprise", "Scaling"],
    topic: "Scaling Node.js Microservices"
  },
  {
    title: "Next.js App Router vs Pages: Which is Better for Enterprise SaaS?",
    slug: "nextjs-app-router-vs-pages-enterprise-saas",
    excerpt: "An in-depth comparison of Next.js App Router and Pages Router, focusing on performance, caching, and enterprise SaaS scalability.",
    tags: ["Next.js", "React", "SaaS", "Architecture"],
    topic: "Next.js App Router Paradigms"
  },
  {
    title: "How to Optimize Core Web Vitals for High-Volume B2B Portals",
    slug: "optimize-core-web-vitals-b2b-portals",
    excerpt: "Learn actionable techniques to dramatically improve Core Web Vitals (LCP, FID, CLS) for data-heavy B2B enterprise portals.",
    tags: ["Performance", "SEO", "Core Web Vitals", "B2B"],
    topic: "Core Web Vitals Optimization"
  },
  {
    title: "Integrating OpenAI API with Prisma and MongoDB: A CTO's Guide",
    slug: "integrating-openai-prisma-mongodb-cto-guide",
    excerpt: "A comprehensive guide for technical leaders on integrating OpenAI's generative models with Prisma ORM and MongoDB.",
    tags: ["AI", "OpenAI", "Prisma", "MongoDB"],
    topic: "AI Integration with Prisma & MongoDB"
  },
  {
    title: "The ROI of Custom Web Applications over Off-the-Shelf Software",
    slug: "roi-custom-web-applications-vs-off-the-shelf",
    excerpt: "Analyze the long-term financial and operational benefits of investing in custom-built web applications compared to generic SaaS solutions.",
    tags: ["Business", "Custom Software", "ROI", "SaaS"],
    topic: "Custom Software ROI"
  },
  {
    title: "Building Secure Authentication Pipelines in Next.js",
    slug: "secure-authentication-pipelines-nextjs",
    excerpt: "Explore best practices for implementing robust, zero-trust authentication and authorization pipelines in Next.js applications.",
    tags: ["Security", "Next.js", "Authentication", "Zero Trust"],
    topic: "Next.js Security & Authentication"
  },
  {
    title: "Why High-Contrast UI is Critical for B2B Dashboard Accessibility",
    slug: "high-contrast-ui-b2b-dashboard-accessibility",
    excerpt: "Understand the importance of accessibility and high-contrast UI design in enterprise B2B dashboards for improved user productivity.",
    tags: ["UI/UX", "Accessibility", "Design", "B2B"],
    topic: "B2B Dashboard Accessibility"
  },
  {
    title: "Database Indexing Strategies for MongoDB on Large Datasets",
    slug: "database-indexing-strategies-mongodb-large-datasets",
    excerpt: "Master advanced MongoDB indexing strategies to ensure optimal query performance and scalability when handling massive B2B datasets.",
    tags: ["MongoDB", "Database", "Performance", "Indexing"],
    topic: "MongoDB Indexing Strategies"
  },
  {
    title: "Automating Lead Generation Funnels with Serverless Queues",
    slug: "automating-lead-generation-funnels-serverless-queues",
    excerpt: "Learn how to build resilient, automated lead generation pipelines using serverless message queues and background processing.",
    tags: ["Automation", "Serverless", "Marketing", "Architecture"],
    topic: "Serverless Lead Generation Automation"
  },
  {
    title: "Advanced Image Optimization Techniques for Next.js Platforms",
    slug: "advanced-image-optimization-nextjs-platforms",
    excerpt: "Deep dive into advanced image compression, dynamic resizing, and modern formats (WebP/AVIF) for Next.js e-commerce and media platforms.",
    tags: ["Next.js", "Performance", "Images", "Optimization"],
    topic: "Next.js Image Optimization"
  }
];

async function seed() {
  try {
    // 1. Get or create a user for authorId
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

    // 2. Iterate and create blogs
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      // Calculate a staggered date (from 45 days ago up to today)
      const daysAgo = 45 - (i * 4); 
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const existingBlog = await prisma.blog.findUnique({
        where: { slug: article.slug }
      });

      if (existingBlog) {
        console.log(`[SKIP] Blog already exists: ${article.slug}`);
        continue;
      }

      await prisma.blog.create({
        data: {
          title: article.title,
          slug: article.slug,
          content: generateContent(article.topic),
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

      console.log(`[SUCCESS] Created: ${article.title}`);
    }

    console.log("Seeding complete! 10 AdSense-compliant articles injected.");

  } catch (error) {
    console.error("Error seeding blogs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

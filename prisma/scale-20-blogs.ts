import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');

  // Get an existing user to use as author
  const author = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!author) {
    console.error('No author found in the database. Please create a user first.');
    process.exit(1);
  }

  // Inject 7 new posts
  const newPosts = [
    {
      title: 'Mastering CI/CD Pipelines with GitHub Actions and Vercel',
      slug: 'mastering-ci-cd-pipelines-with-github-actions-and-vercel',
      excerpt: 'Learn how to automate your deployment workflows seamlessly by integrating GitHub Actions with Vercel for zero-downtime releases.',
      content: '<p>Continuous Integration and Continuous Deployment (CI/CD) form the backbone of modern agile development. By connecting GitHub Actions with Vercel, development teams can run comprehensive test suites before deploying preview environments or pushing code to production.</p><p>This guide covers creating custom workflows, handling environment variables securely, and optimizing build caching to drastically reduce deployment times.</p>',
      tags: ['CI/CD', 'GitHub Actions', 'Vercel', 'DevOps'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Mastering CI/CD Pipelines with GitHub Actions and Vercel',
      metaDesc: 'Automate your deployment workflows by integrating GitHub Actions with Vercel for zero-downtime releases.',
    },
    {
      title: 'Docker Containerization for Modern Node.js APIs',
      slug: 'docker-containerization-for-modern-node-js-apis',
      excerpt: 'A comprehensive approach to containerizing Node.js microservices with Docker, ensuring consistent environments from development to production.',
      content: '<p>Containerizing Node.js APIs solves the "it works on my machine" dilemma while enabling rapid scalability across orchestration platforms like Kubernetes or AWS ECS.</p><p>We will walk through writing an optimized multi-stage Dockerfile, utilizing .dockerignore to keep images lightweight, and managing PM2 inside containers for optimal process management.</p>',
      tags: ['Docker', 'Node.js', 'API', 'Containerization'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Docker Containerization for Modern Node.js APIs',
      metaDesc: 'Learn the best practices for containerizing Node.js microservices with Docker for seamless deployments.',
    },
    {
      title: 'A CTO\'s Guide to Serverless PostgreSQL vs MongoDB',
      slug: 'cto-guide-to-serverless-postgresql-vs-mongodb',
      excerpt: 'Evaluating the trade-offs between serverless relational databases and NoSQL solutions for scaling enterprise SaaS applications.',
      content: '<p>Choosing the right database architecture is critical for SaaS scalability. The rise of serverless PostgreSQL (like Neon or Supabase) challenges the traditional dominance of MongoDB in serverless edge computing.</p><p>This comparison analyzes connection pooling strategies, edge runtime compatibility, JSONB performance in Postgres, and when to leverage MongoDB\'s flexible schema for rapid prototyping versus strict relational integrity.</p>',
      tags: ['PostgreSQL', 'MongoDB', 'Serverless', 'Database', 'CTO'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Serverless PostgreSQL vs MongoDB: A CTO\'s Guide',
      metaDesc: 'Evaluate the trade-offs between serverless relational databases and NoSQL solutions for enterprise SaaS.',
    },
    {
      title: 'Implementing Webhooks Securely in B2B SaaS',
      slug: 'implementing-webhooks-securely-in-b2b-saas',
      excerpt: 'Best practices for designing, authenticating, and scaling webhook architectures for B2B platform integrations.',
      content: '<p>Webhooks are essential for real-time data synchronization between B2B SaaS platforms. However, implementing them securely requires strict signature verification and robust retry mechanisms.</p><p>Learn how to use HMAC signatures to verify payloads, implement exponential backoff for failed deliveries, and build an idempotency key system to prevent duplicate processing on the consumer side.</p>',
      tags: ['Webhooks', 'Security', 'B2B', 'SaaS', 'API'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Implementing Webhooks Securely in B2B SaaS Platforms',
      metaDesc: 'Discover the best practices for designing, authenticating, and scaling webhook architectures securely.',
    },
    {
      title: 'Understanding React Server Components in Next.js 14+',
      slug: 'understanding-react-server-components-in-nextjs-14',
      excerpt: 'Demystifying React Server Components (RSC) and how they drastically improve initial page load performance and SEO.',
      content: '<p>React Server Components (RSC) fundamentally shift how we build React applications. By rendering components on the server without shipping their JavaScript to the client, we significantly reduce bundle sizes.</p><p>This post explores the App Router architecture, when to use the \'use client\' directive, and how server actions simplify data mutations and form handling in Next.js 14+.</p>',
      tags: ['React', 'Next.js', 'Web Performance', 'Frontend'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Understanding React Server Components in Next.js 14+',
      metaDesc: 'Learn how React Server Components in Next.js improve initial page load performance and SEO.',
    },
    {
      title: 'Cybersecurity Essentials for Enterprise Web Applications',
      slug: 'cybersecurity-essentials-for-enterprise-web-applications',
      excerpt: 'Protecting your corporate web assets from common vulnerabilities like XSS, CSRF, and SQL Injection using modern defense frameworks.',
      content: '<p>As enterprise web applications grow in complexity, so does their attack surface. Implementing robust cybersecurity protocols is no longer optional.</p><p>We detail how to enforce strict Content Security Policies (CSP), mitigate Cross-Site Request Forgery (CSRF) via SameSite cookies, and utilize ORMs like Prisma to naturally prevent SQL injection attacks.</p>',
      tags: ['Cybersecurity', 'Security', 'Enterprise', 'Web Development'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Cybersecurity Essentials for Enterprise Web Applications',
      metaDesc: 'Protect your enterprise web applications from common vulnerabilities like XSS, CSRF, and SQL Injection.',
    },
    {
      title: 'Advanced State Management in React: Redux vs Zustand',
      slug: 'advanced-state-management-in-react-redux-vs-zustand',
      excerpt: 'Comparing the heavy-duty boilerplate of Redux against the minimalist, hook-based approach of Zustand for complex React states.',
      content: '<p>While Redux has been the industry standard for React state management, Zustand is rapidly gaining traction due to its minimalist API and elimination of boilerplate code.</p><p>This deep dive compares store setup, selector performance, and middleware integration, helping you decide which library fits your team\'s workflow for your next enterprise dashboard.</p>',
      tags: ['React', 'State Management', 'Redux', 'Zustand'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Advanced State Management in React: Redux vs Zustand',
      metaDesc: 'Compare Redux and Zustand for complex React state management in modern enterprise applications.',
    }
  ];

  for (const postData of newPosts) {
    const existingPost = await prisma.blog.findUnique({ where: { slug: postData.slug } });
    if (!existingPost) {
      await prisma.blog.create({ data: postData });
      console.log(`Created new post: ${postData.title}`);
    } else {
      console.log(`Post already exists: ${postData.title}`);
    }
  }

  // Iterate through ALL blog posts to update views and cover image
  const allPosts = await prisma.blog.findMany();
  console.log(`Updating ${allPosts.length} posts with random views and cover images...`);

  const images = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80',
    'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200&q=80',
  ];

  for (const post of allPosts) {
    const randomViews = Math.floor(Math.random() * (320 - 95 + 1)) + 95;
    const randomImage = images[Math.floor(Math.random() * images.length)];

    await prisma.blog.update({
      where: { id: post.id },
      data: {
        views: randomViews,
        cover_image: post.cover_image || randomImage,
        imageUrl: post.imageUrl || randomImage,
      }
    });
    console.log(`Updated post: ${post.title} (Views: ${randomViews})`);
  }

  console.log('Successfully scaled to 20 blogs and updated metadata!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

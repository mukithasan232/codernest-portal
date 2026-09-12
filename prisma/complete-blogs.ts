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

  // Inject 2 new posts
  const newPosts = [
    {
      title: 'Maximizing ROI with Headless CMS Architecture in 2026',
      slug: 'maximizing-roi-with-headless-cms-architecture-in-2026',
      excerpt: 'Learn how to maximize your return on investment by adopting headless CMS architecture, providing ultimate flexibility for multi-channel content delivery.',
      content: '<p>Headless CMS architecture is revolutionizing how enterprise companies manage and distribute content across multiple platforms. By decoupling the backend content repository from the frontend presentation layer, businesses can deliver content to websites, mobile apps, and IoT devices simultaneously.</p><p>This architectural shift not only improves developer experience but also significantly increases content ROI by reducing duplicate work and enabling faster time-to-market for new digital initiatives.</p>',
      tags: ['Headless CMS', 'Architecture', 'ROI', 'Web Development'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'Maximizing ROI with Headless CMS Architecture in 2026',
      metaDesc: 'Learn how to maximize your return on investment by adopting headless CMS architecture for multi-channel content delivery.',
    },
    {
      title: 'How to Migrate from REST to GraphQL for Enterprise APIs',
      slug: 'how-to-migrate-from-rest-to-graphql-for-enterprise-apis',
      excerpt: 'A comprehensive guide on migrating your enterprise APIs from REST to GraphQL to improve performance, reduce over-fetching, and enhance developer productivity.',
      content: '<p>Migrating from REST to GraphQL can seem daunting for large enterprises, but the benefits in performance and developer experience make it a worthwhile investment. GraphQL allows clients to request exactly the data they need, eliminating over-fetching and under-fetching issues common in REST APIs.</p><p>In this guide, we cover the strategic steps for a smooth transition, including schema design, resolving legacy endpoints, and implementing Apollo Server for a robust enterprise solution.</p>',
      tags: ['GraphQL', 'REST', 'API', 'Enterprise', 'Migration'],
      status: 'published',
      authorId: author.id,
      metaTitle: 'How to Migrate from REST to GraphQL for Enterprise APIs',
      metaDesc: 'A comprehensive guide on migrating your enterprise APIs from REST to GraphQL to improve performance and developer productivity.',
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
    const randomViews = Math.floor(Math.random() * (185 - 55 + 1)) + 55;
    const randomImage = images[Math.floor(Math.random() * images.length)];

    await prisma.blog.update({
      where: { id: post.id },
      data: {
        views: randomViews,
        cover_image: randomImage,
        imageUrl: randomImage, // Updating both just in case
      }
    });
    console.log(`Updated post: ${post.title} (Views: ${randomViews})`);
  }

  console.log('Successfully completed blog seeding update!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

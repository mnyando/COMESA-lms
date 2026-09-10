import { PrismaClient, Role, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding COMESA LMS database...');

  // 1. Create Default Users
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const learnerPasswordHash = await bcrypt.hash('Learner123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@comesa.int' },
    update: {},
    create: {
      name: 'CCCC Admin',
      email: 'admin@comesa.int',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      selfRegistered: false,
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: 'consumer@comesa.int' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'consumer@comesa.int',
      passwordHash: learnerPasswordHash,
      role: Role.LEARNER,
      selfRegistered: true,
    },
  });

  console.log(`Users seeded: Admin (${admin.email}), Learner (${learner.email})`);

  // 2. Create Sample Advocacy Course: "Understanding Your Consumer Rights in COMESA"
  const course1 = await prisma.course.upsert({
    where: { slug: 'understanding-consumer-rights' },
    update: {
      coverImage: '/consumer.jpg',
    },
    create: {
      title: 'Understanding Your Consumer Rights in the COMESA Common Market',
      slug: 'understanding-consumer-rights',
      description: 'Learn the core principles of cross-border consumer protection, fair trade practices, and how to assert your rights as a consumer across COMESA Member States.',
      coverImage: '/consumer.jpg',
      published: true,
      modules: {
        create: [
          {
            title: 'Module 1: Introduction to Consumer Rights & COMESA Framework',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'What is the COMESA Competition Commission?',
                  order: 1,
                  type: LessonType.TEXT,
                  published: true,
                  contentBlocks: [
                    {
                      type: 'heading',
                      level: 1,
                      text: 'What is the COMESA Competition Commission (CCCC)?'
                    },
                    {
                      type: 'paragraph',
                      text: 'The COMESA Competition Commission (CCCC) was established under Article 6 of the COMESA Competition Regulations to promote and encourage competition by preventing restrictive business practices and protecting consumers against unfair commercial conduct across the 21 Member States.'
                    },
                    {
                      type: 'callout',
                      calloutType: 'tip',
                      text: 'Key Takeaway: The Commission protects consumers when buying goods or services from businesses operating across COMESA borders.'
                    },
                    {
                      type: 'heading',
                      level: 2,
                      text: 'Core Consumer Rights Guarded by CCCC'
                    },
                    {
                      type: 'list',
                      items: [
                        'Right to accurate product descriptions and non-misleading marketing',
                        'Right to safety and quality standard guarantees',
                        'Right to redress and clear dispute resolution processes',
                        'Right to transparent pricing without hidden anti-competitive markups'
                      ]
                    }
                  ]
                },
                {
                  title: 'How to Identify Unfair Trade Practices',
                  order: 2,
                  type: LessonType.TEXT,
                  published: true,
                  contentBlocks: [
                    {
                      type: 'heading',
                      level: 1,
                      text: 'Spotting Unfair & Deceptive Trade Practices'
                    },
                    {
                      type: 'paragraph',
                      text: 'Deceptive trade practices include false representations about product origin, quality, ingredients, or warranty terms. Under Article 27 of the COMESA Regulations, businesses are prohibited from engaging in unconscionable conduct.'
                    },
                    {
                      type: 'callout',
                      calloutType: 'warning',
                      text: 'Warning: Beware of false "original quality" claims and hidden mandatory surcharges not disclosed before payment.'
                    }
                  ]
                }
              ]
            }
          },
          {
            title: 'Module 2: How to File a Consumer Complaint',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Step-by-Step Complaint Filing Guide',
                  order: 1,
                  type: LessonType.TEXT,
                  published: true,
                  contentBlocks: [
                    {
                      type: 'heading',
                      level: 1,
                      text: 'Filing a Complaint with the Consumer Welfare Division'
                    },
                    {
                      type: 'paragraph',
                      text: 'If you have purchased a product or service from a regional enterprise and experienced unfair treatment, misleading advertising, or unsafe goods, you can submit a formal complaint directly to the Commission.'
                    },
                    {
                      type: 'heading',
                      level: 2,
                      text: 'Required Documentation Checklist'
                    },
                    {
                      type: 'list',
                      items: [
                        'Proof of purchase (Receipt, invoice, or digital payment record)',
                        'Copies of correspondence with the trader or vendor',
                        'Clear photos or evidence of defective or misleading goods',
                        'Summary of financial loss or harm incurred'
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    }
  });

  // 3. Create Second Course: "Competition Law Essentials for Small Businesses"
  await prisma.course.upsert({
    where: { slug: 'competition-law-for-smes' },
    update: {
      coverImage: '/competition.jpg',
    },
    create: {
      title: 'Competition Law Essentials for Small & Medium Enterprises (SMEs)',
      slug: 'competition-law-for-smes',
      description: 'A practical guide for business owners on avoiding anti-competitive agreements, understanding merger controls, and building fair trade compliance programs.',
      coverImage: '/competition.jpg',
      published: true,
      modules: {
        create: [
          {
            title: 'Module 1: Anti-Competitive Agreements & Price Fixing',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Understanding Restrictive Business Practices',
                  order: 1,
                  type: LessonType.TEXT,
                  published: true,
                  contentBlocks: [
                    {
                      type: 'heading',
                      level: 1,
                      text: 'What are Restrictive Business Practices?'
                    },
                    {
                      type: 'paragraph',
                      text: 'Agreements between competing businesses to fix prices, divide markets, or restrict production damage economic growth and harm consumers. Such cartels are strictly prohibited under COMESA Competition Law.'
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Sample Advocacy courses seeded with official cover images!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, ProjectStatus, RequestSource, ScopeClassification, RequestStatus, ProposalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ===========================================
// SEED DATA FOR DEVELOPMENT
// ===========================================

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.proposal.deleteMany();
  await prisma.clientRequest.deleteMany();
  await prisma.scopeItem.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // ===========================================
  // CREATE USERS
  // ===========================================
  
  const passwordHash = await bcrypt.hash('Password123', 12);

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@freelancer-shield.com',
      passwordHash,
      name: 'Demo Freelancer',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
    },
  });

  console.log(`✅ Created ${2} users`);

  // ===========================================
  // CREATE CLIENTS
  // ===========================================

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        userId: user1.id,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        company: 'Acme Corp',
        notes: 'Long-term client, usually good with payments',
      },
    }),
    prisma.client.create({
      data: {
        userId: user1.id,
        name: 'StartupXYZ',
        email: 'founder@startupxyz.io',
        company: 'StartupXYZ Inc',
        notes: 'Fast-moving startup, sometimes changes requirements',
      },
    }),
    prisma.client.create({
      data: {
        userId: user1.id,
        name: 'Local Coffee Shop',
        email: 'owner@localcoffee.com',
        company: null,
        notes: 'Small business, budget conscious',
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // ===========================================
  // CREATE PROJECTS
  // ===========================================

  const project1 = await prisma.project.create({
    data: {
      userId: user1.id,
      clientId: clients[0].id,
      name: 'Corporate Website Redesign',
      description: 'Complete redesign of the corporate website with new branding',
      status: ProjectStatus.ACTIVE,
      budget: 15000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user1.id,
      clientId: clients[1].id,
      name: 'MVP Development',
      description: 'Build MVP for their SaaS product',
      status: ProjectStatus.ACTIVE,
      budget: 25000,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      userId: user1.id,
      clientId: clients[2].id,
      name: 'Simple Landing Page',
      description: 'One-page website with contact form',
      status: ProjectStatus.COMPLETED,
      budget: 2000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-15'),
    },
  });

  console.log(`✅ Created 3 projects`);

  // ===========================================
  // CREATE SCOPE ITEMS
  // ===========================================

  // Project 1 scope items
  const scopeItems1 = await Promise.all([
    prisma.scopeItem.create({
      data: {
        projectId: project1.id,
        title: 'Homepage Design',
        description: 'Modern homepage with hero section, features, and testimonials',
        category: 'design',
        estimatedHours: 16,
        order: 0,
      },
    }),
    prisma.scopeItem.create({
      data: {
        projectId: project1.id,
        title: 'About Page',
        description: 'Company history, team bios, and mission statement',
        category: 'design',
        estimatedHours: 8,
        order: 1,
      },
    }),
    prisma.scopeItem.create({
      data: {
        projectId: project1.id,
        title: 'Services Page',
        description: 'List of 5 service offerings with descriptions',
        category: 'design',
        estimatedHours: 10,
        order: 2,
      },
    }),
    prisma.scopeItem.create({
      data: {
        projectId: project1.id,
        title: 'Contact Form',
        description: 'Contact form with name, email, phone, and message fields',
        category: 'development',
        estimatedHours: 6,
        order: 3,
        isCompleted: true,
      },
    }),
    prisma.scopeItem.create({
      data: {
        projectId: project1.id,
        title: 'Responsive Implementation',
        description: 'Make all pages mobile-responsive',
        category: 'development',
        estimatedHours: 12,
        order: 4,
      },
    }),
  ]);

  // Project 2 scope items
  const scopeItems2 = await Promise.all([
    prisma.scopeItem.create({
      data: {
        projectId: project2.id,
        title: 'User Authentication',
        description: 'Email/password login, registration, password reset',
        category: 'development',
        estimatedHours: 20,
        order: 0,
        isCompleted: true,
      },
    }),
    prisma.scopeItem.create({
      data: {
        projectId: project2.id,
        title: 'Dashboard',
        description: 'Main dashboard with key metrics and navigation',
        category: 'development',
        estimatedHours: 24,
        order: 1,
      },
    }),
    prisma.scopeItem.create({
      data: {
        projectId: project2.id,
        title: 'Data Import',
        description: 'CSV upload and processing for bulk data import',
        category: 'development',
        estimatedHours: 16,
        order: 2,
      },
    }),
    prisma.scopeItem.create({
      data: {
        projectId: project2.id,
        title: 'Reports',
        description: 'Generate PDF reports from user data',
        category: 'development',
        estimatedHours: 20,
        order: 3,
      },
    }),
  ]);

  console.log(`✅ Created ${scopeItems1.length + scopeItems2.length} scope items`);

  // ===========================================
  // CREATE CLIENT REQUESTS
  // ===========================================

  const requests = await Promise.all([
    // In-scope requests
    prisma.clientRequest.create({
      data: {
        projectId: project1.id,
        content: 'Can you add our team photos to the about page?',
        source: RequestSource.EMAIL,
        classification: ScopeClassification.IN_SCOPE,
        confidence: 0.92,
        reasoning: 'This request falls within the "About Page" scope item which includes team bios.',
        status: RequestStatus.ACCEPTED,
        linkedScopeId: scopeItems1[1].id,
      },
    }),
    prisma.clientRequest.create({
      data: {
        projectId: project1.id,
        content: 'The contact form needs validation for email format',
        source: RequestSource.SLACK,
        classification: ScopeClassification.IN_SCOPE,
        confidence: 0.88,
        reasoning: 'Form validation is part of standard contact form implementation.',
        status: RequestStatus.ACCEPTED,
        linkedScopeId: scopeItems1[3].id,
      },
    }),

    // Out-of-scope requests (SCOPE CREEP!)
    prisma.clientRequest.create({
      data: {
        projectId: project1.id,
        content: 'Can you also build us a customer portal where clients can log in?',
        source: RequestSource.EMAIL,
        classification: ScopeClassification.OUT_OF_SCOPE,
        confidence: 0.95,
        reasoning: 'A customer portal with authentication is a significant new feature not included in the original scope.',
        status: RequestStatus.NEW,
      },
    }),
    prisma.clientRequest.create({
      data: {
        projectId: project1.id,
        content: 'Quick addition - we need a blog section. Shouldnt take long right?',
        source: RequestSource.SLACK,
        classification: ScopeClassification.OUT_OF_SCOPE,
        confidence: 0.97,
        reasoning: 'Detected scope creep indicators: "Quick addition", "shouldn\'t take long". A blog requires CMS, posts management, and significant development.',
        status: RequestStatus.CONVERTED_TO_PROPOSAL,
      },
    }),
    prisma.clientRequest.create({
      data: {
        projectId: project2.id,
        content: 'While youre at it, can you add a mobile app too?',
        source: RequestSource.EMAIL,
        classification: ScopeClassification.OUT_OF_SCOPE,
        confidence: 0.99,
        reasoning: 'Detected scope creep indicator: "While you\'re at it". A mobile app is an entirely separate project.',
        status: RequestStatus.NEW,
      },
    }),

    // Clarification needed
    prisma.clientRequest.create({
      data: {
        projectId: project1.id,
        content: 'Does the homepage include animations?',
        source: RequestSource.EMAIL,
        classification: ScopeClassification.CLARIFICATION_NEEDED,
        confidence: 0.75,
        reasoning: 'Animations were not explicitly included or excluded in the scope. Need to clarify expectations.',
        status: RequestStatus.NEW,
      },
    }),

    // Revision
    prisma.clientRequest.create({
      data: {
        projectId: project1.id,
        content: 'Can we change the color scheme from blue to green?',
        source: RequestSource.EMAIL,
        classification: ScopeClassification.REVISION,
        confidence: 0.85,
        reasoning: 'This is a revision to the existing design work.',
        status: RequestStatus.REVIEWED,
        linkedScopeId: scopeItems1[0].id,
      },
    }),

    // Pending analysis
    prisma.clientRequest.create({
      data: {
        projectId: project2.id,
        content: 'We need to add Stripe payment processing',
        source: RequestSource.MANUAL,
        classification: ScopeClassification.PENDING,
        status: RequestStatus.NEW,
      },
    }),
  ]);

  console.log(`✅ Created ${requests.length} client requests`);

  // ===========================================
  // CREATE PROPOSALS
  // ===========================================

  const proposals = await Promise.all([
    prisma.proposal.create({
      data: {
        projectId: project1.id,
        requestId: requests[3].id, // The blog request
        title: 'Blog Section Development',
        description: 'Development of a blog section including:\n- Blog post listing page\n- Individual post pages\n- Categories and tags\n- Admin interface for creating/editing posts\n- Basic SEO optimization',
        price: 3500,
        estimatedHours: 40,
        status: ProposalStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.proposal.create({
      data: {
        projectId: project1.id,
        title: 'Customer Portal',
        description: 'Secure customer login area with:\n- User registration and authentication\n- Dashboard with account information\n- Document download area\n- Support ticket submission',
        price: 8000,
        estimatedHours: 80,
        status: ProposalStatus.DRAFT,
      },
    }),
    prisma.proposal.create({
      data: {
        projectId: project3.id,
        title: 'Social Media Integration',
        description: 'Add social media feeds and sharing buttons',
        price: 500,
        estimatedHours: 5,
        status: ProposalStatus.ACCEPTED,
        sentAt: new Date('2024-01-10'),
        respondedAt: new Date('2024-01-12'),
      },
    }),
  ]);

  console.log(`✅ Created ${proposals.length} proposals`);

  // ===========================================
  // SUMMARY
  // ===========================================

  console.log('\n🎉 Seed completed successfully!');
  console.log('─'.repeat(40));
  console.log('Demo login credentials:');
  console.log('  Email: demo@freelancer-shield.com');
  console.log('  Password: Password123');
  console.log('─'.repeat(40));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

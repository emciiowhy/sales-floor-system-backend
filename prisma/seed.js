import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to preserve existing data)
  console.log('🧹 Clearing existing data...');
  await prisma.passUp.deleteMany();
  await prisma.break.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.globalScript.deleteMany();

  // Create agents
  console.log('👥 Creating agents...');
  const neonAgent = await prisma.agent.create({
    data: {
      name: 'Neon',
      customScript: null
    }
  });

  const agent2 = await prisma.agent.create({
    data: {
      name: 'Alex',
      customScript: null
    }
  });

  const agent3 = await prisma.agent.create({
    data: {
      name: 'Jordan',
      customScript: null
    }
  });

  console.log(`✅ Created ${3} agents`);

  // Create GlobalScript
  console.log('📝 Creating global script...');
  const globalScript = await prisma.globalScript.create({
    data: {
      content: 'Welcome to the Sales Floor System. This is the default global script.',
      version: 1
    }
  });
  console.log('✅ Created global script');

  // Create sample PassUps for Neon agent
  console.log('📊 Creating sample pass-ups...');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const passUps = await Promise.all([
    prisma.passUp.create({
      data: {
        agentId: neonAgent.id,
        ticker: 'AAPL',
        tickerPrice: '150.25',
        leadName: 'John Doe',
        interestedIn: 'Technology stocks',
        agreedToSMS: true,
        disposition: 'HOT',
        rebuttals: {},
        notes: 'Very interested, follow up tomorrow',
        date: today
      }
    }),
    prisma.passUp.create({
      data: {
        agentId: neonAgent.id,
        ticker: 'MSFT',
        tickerPrice: '380.50',
        leadName: 'Jane Smith',
        interestedIn: 'Cloud computing',
        agreedToSMS: false,
        disposition: 'WARM',
        rebuttals: {},
        notes: 'Considering options',
        date: today
      }
    }),
    prisma.passUp.create({
      data: {
        agentId: neonAgent.id,
        ticker: 'GOOGL',
        tickerPrice: '140.75',
        leadName: 'Bob Johnson',
        interestedIn: 'AI and ML',
        agreedToSMS: true,
        disposition: 'INT',
        rebuttals: {},
        notes: 'Initial interest',
        date: yesterday
      }
    }),
    prisma.passUp.create({
      data: {
        agentId: agent2.id,
        ticker: 'TSLA',
        tickerPrice: '250.00',
        leadName: 'Alice Williams',
        interestedIn: 'Electric vehicles',
        agreedToSMS: true,
        disposition: 'HOT',
        rebuttals: {},
        date: today
      }
    })
  ]);

  console.log(`✅ Created ${passUps.length} pass-ups`);

  // Create sample Breaks for Neon agent
  console.log('☕ Creating sample breaks...');
  const startTime = new Date();
  startTime.setHours(10, 0, 0, 0);
  const endTime = new Date(startTime);
  endTime.setHours(10, 15, 0, 0);

  const breaks = await Promise.all([
    prisma.break.create({
      data: {
        agentId: neonAgent.id,
        type: 'FIRST',
        startTime: startTime,
        endTime: endTime,
        missed: false
      }
    }),
    prisma.break.create({
      data: {
        agentId: neonAgent.id,
        type: 'LUNCH',
        startTime: new Date(startTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        missed: false
      }
    })
  ]);

  console.log(`✅ Created ${breaks.length} breaks`);

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - ${3} agents created (Neon, Alex, Jordan)`);
  console.log(`   - ${1} global script created`);
  console.log(`   - ${passUps.length} pass-ups created`);
  console.log(`   - ${breaks.length} breaks created`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


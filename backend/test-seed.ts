import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  console.log('Test clearing...');
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.clubJoinRequest.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  console.log('Test seeding...');
  const coach = await prisma.user.create({
    data: {
      email: 'test@test.com',
      passwordHash: 'xxx',
      firstName: 'Test',
      lastName: 'Coach',
      role: 'COACH'
    }
  });

  const club = await prisma.club.create({
    data: {
      name: 'Test Club',
      city: 'Paris',
      region: 'Île-de-France',
      department: '75',
      website: 'http://test.com',
      sports: ['Running'],
      address: 'Test Address',
      ownerId: coach.id,
      lat: 48.8,
      lng: 2.3,
      schedule: 'Mon',
      channels: {
        create: [
          { name: 'general' },
          { name: 'entrainement' },
          { name: 'nutrition' },
          { name: 'elite-pro' }
        ]
      },
      sessions: {
        create: [
          { 
            date: new Date(),
            type: 'VMA', 
            description: "Test desc",
            duration: 60
          }
        ]
      },
      events: {
        create: [
          {
            name: 'Test Event',
            description: 'Test desc',
            date: new Date(),
            location: 'Test Loc'
          }
        ]
      }
    } as any
  });
  console.log('Success:', club.id);
}

test().catch(console.error).finally(() => prisma.$disconnect());

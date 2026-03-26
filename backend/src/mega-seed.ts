import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password', 10);

  console.log('Clearing database...');
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.event.deleteMany();
  await prisma.sessionResult.deleteMany();
  await prisma.sessionInvite.deleteMany();
  await prisma.session.deleteMany();
  await prisma.clubJoinRequest.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating Main Coach & Athlete for easy access...');
  const mainCoach = await prisma.user.create({
    data: {
      email: 'coach@test.com',
      passwordHash,
      firstName: 'Main',
      lastName: 'Coach',
      role: 'COACH',
    }
  });

  const mainAthlete = await prisma.user.create({
    data: {
      email: 'athlete@test.com',
      passwordHash,
      firstName: 'Main',
      lastName: 'Athlete',
      role: 'ATHLETE',
    }
  });

  const clubsData = [
    { name: 'Paris Running Club', city: 'Paris', region: 'Île-de-France', dept: '75', lat: 48.8566, lng: 2.3522 },
    { name: 'Lyon Athlétisme', city: 'Lyon', region: 'Auvergne-Rhône-Alpes', dept: '69', lat: 45.7640, lng: 4.8357 },
    { name: 'Marseille Sport', city: 'Marseille', region: 'PACA', dept: '13', lat: 43.2965, lng: 5.3698 },
  ];

  console.log('Seeding Clubs, Teams, Sessions and Users...');
  for (const c of clubsData) {
    // Create a specific coach for this club
    const clubCoach = c.city === 'Paris' ? mainCoach : await prisma.user.create({
      data: {
        email: `coach.${c.city.toLowerCase()}@test.com`,
        passwordHash,
        firstName: 'Coach',
        lastName: c.city,
        role: 'COACH',
      }
    });

    const club = await prisma.club.create({
      data: {
        name: c.name,
        city: c.city,
        region: c.region,
        department: c.dept,
        ownerId: clubCoach.id,
        lat: c.lat,
        lng: c.lng,
        sports: ['Running', 'Trail', 'Sprint'],
        channels: {
          create: [{ name: 'general' }, { name: 'entrainement' }]
        }
      }
    });

    // Add coach as member
    await prisma.user.update({
      where: { id: clubCoach.id },
      data: { clubs: { connect: { id: club.id } } } as any
    });

    // Create Teams
    const teamPro = await prisma.team.create({
      data: {
        name: 'Élite Pro',
        clubId: club.id,
        coachId: clubCoach.id,
      }
    });

    const teamJunior = await prisma.team.create({
      data: {
        name: 'Espoirs / Juniors',
        clubId: club.id,
        coachId: clubCoach.id,
      }
    });

    // Create Athletes for these teams
    for (let i = 1; i <= 5; i++) {
      const isMain = (c.city === 'Paris' && i === 1);
      const athlete = isMain ? mainAthlete : await prisma.user.create({
        data: {
          email: `athlete.${c.city.toLowerCase()}.${i}@test.com`,
          passwordHash,
          firstName: `Athlete${i}`,
          lastName: c.city,
          role: 'ATHLETE',
        }
      });

      // Connect athlete to club and team
      await prisma.user.update({
        where: { id: athlete.id },
        data: { clubs: { connect: { id: club.id } } } as any
      });

      await prisma.teamMember.create({
        data: {
          teamId: i % 2 === 0 ? teamPro.id : teamJunior.id,
          userId: athlete.id
        }
      });

      // Create some session results for the athlete
      const session = await prisma.session.create({
        data: {
          date: new Date(Date.now() - 86400000 * i),
          type: 'Entraînement Individuel',
          description: 'Sortie longue en endurance fondamentale',
          userId: athlete.id,
          clubId: club.id,
          targetDistance: 10,
          duration: 60,
          result: {
            create: {
              actualDistance: 10.5 + Math.random(),
              time: 55 + Math.floor(Math.random() * 10),
              rpe: 6,
              comment: 'Bonnes sensations'
            }
          }
        }
      });
    }

    // Create Team Sessions
    const sessionTypes = ['VMA', 'Seuil', 'PPG', 'Repos Actif'];
    for (let i = 0; i < 4; i++) {
        await prisma.session.create({
            data: {
                date: new Date(Date.now() + 86400000 * i),
                type: sessionTypes[i],
                description: `Séance collective de ${sessionTypes[i]} préparée par le coach.`,
                teamId: teamPro.id,
                clubId: club.id,
                coachId: clubCoach.id,
                duration: 90
            }
        });
    }

    // Create some messages in the general channel
    const generalChannel = await prisma.channel.findFirst({
        where: { clubId: club.id, name: 'general' }
    });

    if (generalChannel) {
        await prisma.message.createMany({
            data: [
                { content: 'Bonjour à tous ! Bienvenue dans le club.', senderId: clubCoach.id, clubId: club.id, channelId: generalChannel.id },
                { content: 'N’oubliez pas l’entraînement de demain soir.', senderId: clubCoach.id, clubId: club.id, channelId: generalChannel.id },
            ]
        });
    }

    // Create an Event
    await prisma.event.create({
        data: {
            name: `Grand Prix de ${c.city}`,
            description: 'Compétition régionale ouverte à tous les licenciés.',
            date: new Date(Date.now() + 86400000 * 15),
            location: `Stade Central de ${c.city}`,
            clubId: club.id
        }
    });
  }

  console.log('Seeding complete!');
  console.log('Credentials:');
  console.log('- Coach: coach@test.com / password');
  console.log('- Athlete: athlete@test.com / password');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

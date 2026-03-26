import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const sportsList = ['Sprint', 'Demi-fond', 'Trail', 'Saut en hauteur', 'Lancer de poids', 'Marche athlétique', 'Cross-country'];
const clubsData = [
  { name: 'Racing Club de France', city: 'Paris', region: 'Île-de-France', dept: '75', website: 'https://racingclub.fr', sports: ['Sprint', 'Saut en hauteur'], lat: 48.8566, lng: 2.3522, schedule: 'Lun: 18h-20h, Mer: 14h-16h, Sam: 10h-12h' },
  { name: 'Stade Bordelais', city: 'Bordeaux', region: 'Nouvelle-Aquitaine', dept: '33', website: 'https://stadebordelais.com', sports: ['Demi-fond', 'Trail'], lat: 44.8378, lng: -0.5792, schedule: 'Mar: 18h-20h, Jeu: 18h-20h, Dim: 9h-11h' },
  { name: 'ASPTT Lyon', city: 'Lyon', region: 'Auvergne-Rhône-Alpes', dept: '69', website: 'https://lyon.asptt.com', sports: ['Sprint', 'Marche athlétique'], lat: 45.7640, lng: 4.8357, schedule: 'Lun: 17h-19h, Mer: 15h-17h, Ven: 18h-20h' },
  { name: 'OM Athlétisme', city: 'Marseille', region: 'Provence-Alpes-Côte d\'Azur', dept: '13', website: 'https://om.fr/athle', sports: ['Lancer de poids', 'Sprint'], lat: 43.2965, lng: 5.3698, schedule: 'Mar: 18h30-20h30, Jeu: 18h30-20h30' },
  { name: 'Lille Métropole Athlé', city: 'Lille', region: 'Hauts-de-France', dept: '59', website: 'https://lillemetropoleathle.fr', sports: ['Cross-country', 'Demi-fond'], lat: 50.6292, lng: 3.0573, schedule: 'Mer: 14h-16h, Sam: 10h-12h' },
  { name: 'Nantes Métropole Athlétisme', city: 'Nantes', region: 'Pays de la Loire', dept: '44', website: 'https://nmathle.fr', sports: ['Saut en hauteur', 'Sprint'], lat: 47.2184, lng: -1.5536, schedule: 'Lun: 18h-20h, Jeu: 18h-20h' },
  { name: 'Toulouse UC', city: 'Toulouse', region: 'Occitanie', dept: '31', website: 'https://tuc-athle.fr', sports: ['Trail', 'Demi-fond'], lat: 43.6047, lng: 1.4442, schedule: 'Mar: 18h-20h, Sam: 15h-17h' },
  { name: 'Strasbourg Agglo Athlé', city: 'Strasbourg', region: 'Grand Est', dept: '67', website: 'https://strasbourg-athle.fr', sports: ['Marche athlétique', 'Cross-country'], lat: 48.5734, lng: 7.7521, schedule: 'Mer: 17h-19h, Ven: 17h-19h' },
  { name: 'Nice Côte d\'Azur Athlétisme', city: 'Nice', region: 'Provence-Alpes-Côte d\'Azur', dept: '06', website: 'https://ncaa-athle.fr', sports: ['Sprint', 'Saut en hauteur'], lat: 43.7102, lng: 7.2620, schedule: 'Lun: 18h-20h, Jeu: 18h-20h, Sam: 9h-11h' },
  { name: 'Montpellier Athletic', city: 'Montpellier', region: 'Occitanie', dept: '34', website: 'https://montpellier-athle.com', sports: ['Lancer de poids', 'Trail'], lat: 43.6108, lng: 3.8767, schedule: 'Mar: 18h-20h, Jeu: 18h-20h' },
  { name: 'Rennes Étudiants Club', city: 'Rennes', region: 'Bretagne', dept: '35', website: 'https://rec-athle.fr', sports: ['Cross-country', 'Demi-fond'], lat: 48.1173, lng: -1.6778, schedule: 'Mer: 16h-18h, Sam: 14h-16h' },
  { name: 'Clermont Athlétisme Auvergne', city: 'Clermont-Ferrand', region: 'Auvergne-Rhône-Alpes', dept: '63', website: 'https://clermont-athle.fr', sports: ['Saut en hauteur', 'Sprint'], lat: 45.7772, lng: 3.0870, schedule: 'Lun: 18h-20h, Mer: 14h-16h' },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Clearing database...');
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.clubJoinRequest.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Clubs & Coaches...');
  for (const c of clubsData) {
    const coach = await prisma.user.create({
      data: {
        email: `coach.${c.city.toLowerCase().replace(/\s/g, '')}@athletix.fr`,
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
        website: c.website,
        sports: c.sports,
        address: `Stade Municipal de ${c.city}`,
        ownerId: coach.id,
        lat: c.lat,
        lng: c.lng,
        schedule: c.schedule,
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
              date: new Date(Date.now() + 86400000 * 2),
              type: 'Séance VMA Courte', 
              description: "Échauffement 20 min progressif. Corps de séance : 2 séries de 10x30\"-30\" à 105% VMA. Récupération 3 min entre les séries. Retour au calme 10 min.",
              duration: 60
            },
            { 
              date: new Date(Date.now() + 86400000 * 4),
              type: 'Seuil / Allure Semi', 
              description: "Échauffement 25 min + 4 lignes droites. 3 x 2000m allure semi-marathon (R=2 min trotté). Retour au calme 15 min.",
              duration: 75
            },
            { 
              date: new Date(Date.now() + 86400000 * 6),
              type: 'Sortie Longue Vallonnée', 
              description: "1h30 en endurance fondamentale (70-75% FCM). Inclure 3 côtes de 2 min à haute intensité. Travail de foulée en descente.",
              duration: 90
            }
          ]
        },
        events: {
          create: [
            {
              name: 'Grand Prix National',
              description: 'Compétition majeure sur piste. Inscription obligatoire avant jeudi soir.',
              date: new Date(Date.now() + 86400000 * 10),
              location: 'Stade de France, Saint-Denis'
            }
          ]
        }
      } as any
    });
    
    // Add coach to their own club as member
    await prisma.user.update({
        where: { id: coach.id },
        data: { clubs: { connect: { id: club.id } } } as any
    });

    console.log(`Created ${c.name} in ${c.city}`);
  }

  console.log('Seeding Athletes...');
  const allClubs = await prisma.club.findMany();
  for (let i = 1; i <= 50; i++) {
    const athlete = await prisma.user.create({
      data: {
        email: `athlete${i}@gmail.com`,
        passwordHash,
        firstName: `Prénom${i}`,
        lastName: `Nom${i}`,
        role: 'ATHLETE',
      }
    });

    // Join 1 to 3 random clubs
    const randomClubs = allClubs.sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 3));
    await prisma.user.update({
      where: { id: athlete.id },
      data: { clubs: { connect: randomClubs.map(c => ({ id: c.id })) } } as any
    });
  }

  console.log('Seeding complete! Admin access: coach.paris@athletix.fr / password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

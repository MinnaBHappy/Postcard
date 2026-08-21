import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { name: "MIN" },
    update: {},
    create: {
      name: "MIN",
      pin: "0322",
      defaultLocationLat: 37.5665,
      defaultLocationLng: 126.978,
      preferredLocale: "ko",
    },
  });

  await prisma.user.upsert({
    where: { name: "MOMOKA" },
    update: {},
    create: {
      name: "MOMOKA",
      pin: "0707",
      defaultLocationLat: 35.6762,
      defaultLocationLng: 139.6503,
      preferredLocale: "ja",
    },
  });

  const pigeons = [
    { name: "Biscuit", baseSpeed: 62.0 },
    { name: "Nimbus", baseSpeed: 71.5 },
    { name: "Pepper", baseSpeed: 55.0 },
    { name: "Turbo", baseSpeed: 80.0 },
  ];

  for (const pigeon of pigeons) {
    const existing = await prisma.pigeon.findFirst({ where: { name: pigeon.name } });
    if (!existing) {
      await prisma.pigeon.create({ data: pigeon });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

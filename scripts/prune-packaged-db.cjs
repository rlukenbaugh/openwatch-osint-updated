const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.webcamCheck.deleteMany();
  await prisma.webcamSource.deleteMany();
  await prisma.appSetting.deleteMany({
    where: {
      key: {
        not: "defaultDashboardName"
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Packaged DB prune failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

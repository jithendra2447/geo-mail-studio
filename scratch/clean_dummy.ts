import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Cleaning dummy @example.com subscribers and email logs...");
  
  // Delete logs containing @example.com
  const deletedLogs = await prisma.emailLog.deleteMany({
    where: {
      toEmail: {
        contains: "@example.com",
      },
    },
  });

  // Delete subscribers containing @example.com
  const deletedSubscribers = await prisma.subscriber.deleteMany({
    where: {
      email: {
        contains: "@example.com",
      },
    },
  });

  console.log(`✓ Deleted ${deletedLogs.count} dummy email logs.`);
  console.log(`✓ Deleted ${deletedSubscribers.count} dummy subscribers.`);

  // Ensure real email jithendravarma.l@gmail.com exists
  await prisma.subscriber.upsert({
    where: {
      workspaceId_email: { workspaceId: "ws_geonixa", email: "jithendravarma.l@gmail.com" },
    },
    update: { status: "SUBSCRIBED" },
    create: {
      workspaceId: "ws_geonixa",
      email: "jithendravarma.l@gmail.com",
      firstName: "Jithendra",
      status: "SUBSCRIBED",
    },
  });
  console.log("✓ Real subscriber 'jithendravarma.l@gmail.com' active in workspace!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

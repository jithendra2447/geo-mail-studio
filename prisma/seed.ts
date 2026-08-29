import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed for GEO Mail SaaS...");

  // 1. Create Default Tenant Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "geonixa" },
    update: {},
    create: {
      id: "ws_geonixa",
      name: "Geonixa Technologies",
      slug: "geonixa",
      authenticatedDomain: "geonixa.com",
      physicalAddress: "100 Innovation Way, Suite 400, San Francisco CA 94107",
    },
  });

  console.log(`✅ Tenant Workspace created: ${workspace.name} (${workspace.id})`);

  // 2. Create Owner User
  const user = await prisma.user.upsert({
    where: { email: "admin@geonixa.com" },
    update: {},
    create: {
      workspaceId: workspace.id,
      email: "admin@geonixa.com",
      name: "Alex Vance",
      role: "OWNER",
    },
  });

  console.log(`✅ Admin User created: ${user.name} (${user.email})`);

  // 3. Seed Domain Verification
  await prisma.domainVerification.upsert({
    where: {
      workspaceId_domain: { workspaceId: workspace.id, domain: "geonixa.com" },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      domain: "geonixa.com",
      dkimSelector: "geo1",
      dkimPublicKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3s6e...",
      spfVerified: true,
      dkimVerified: true,
      dmarcVerified: true,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  console.log("✅ Seeded Domain Verification for geonixa.com");

  // 4. Create Sample Subscribers
  const subscribers = [
    { email: "sarah.connor@example.com", firstName: "Sarah", lastName: "Connor", status: "SUBSCRIBED" },
    { email: "john.doe@example.com", firstName: "John", lastName: "Doe", status: "SUBSCRIBED" },
    { email: "dev.user@example.com", firstName: "Dev", lastName: "Tester", status: "SUBSCRIBED" },
    { email: "unsub.user@example.com", firstName: "Unsubscribed", lastName: "User", status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  ];

  for (const sub of subscribers) {
    await prisma.subscriber.upsert({
      where: {
        workspaceId_email: {
          workspaceId: workspace.id,
          email: sub.email,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        email: sub.email,
        firstName: sub.firstName,
        lastName: sub.lastName,
        status: sub.status,
        unsubscribedAt: sub.unsubscribedAt || null,
        attributes: JSON.stringify({ plan: "pro", signupSource: "web_app" }),
      },
    });
  }

  console.log(`✅ ${subscribers.length} Subscribers seeded into tenant ${workspace.id}`);

  // 5. Create Sample Campaign
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: "Product Update Q3",
      subject: "Exciting new features in GEO Mail!",
      bodyHtml: "<p>Hi {{subscriber.firstName}}, check out our new self-hosted features!</p><p>Address: {{workspace.physicalAddress}}</p><a href='{{unsubscribeUrl}}'>Unsubscribe</a>",
      fromEmail: "newsletter@geonixa.com",
      fromName: "Geonixa Team",
      status: "SENT",
      sentAt: new Date(),
    },
  });

  console.log(`✅ Sample Campaign created: ${campaign.name}`);

  // 6. Seed Analytics Logs
  await prisma.emailLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        messageId: `seed_msg_1_${Date.now()}`,
        campaignId: campaign.id,
        toEmail: "sarah.connor@example.com",
        fromEmail: "newsletter@geonixa.com",
        subject: campaign.subject,
        openedAt: new Date(),
        clickedAt: new Date(),
      },
      {
        workspaceId: workspace.id,
        messageId: `seed_msg_2_${Date.now()}`,
        campaignId: campaign.id,
        toEmail: "john.doe@example.com",
        fromEmail: "newsletter@geonixa.com",
        subject: campaign.subject,
        openedAt: new Date(),
      },
      {
        workspaceId: workspace.id,
        messageId: `seed_msg_3_${Date.now()}`,
        campaignId: campaign.id,
        toEmail: "dev.user@example.com",
        fromEmail: "newsletter@geonixa.com",
        subject: campaign.subject,
      },
    ],
  });

  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

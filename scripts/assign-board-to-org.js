/**
 * Database Utility: Fix boards with null orgId
 * Run with: node scripts/assign-board-to-org.js <boardId> <orgId>
 */

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function assignBoardToOrg() {
  const boardSlug = process.argv[2];
  const targetOrgId = process.argv[3];

  if (!boardSlug || !targetOrgId) {
    console.log("❌ Missing arguments!");
    console.log("\nUsage: node scripts/assign-board-to-org.js <boardSlug> <orgId>");
    console.log("\nExample:");
    console.log("  node scripts/assign-board-to-org.js zaifi-crrzc org_3Cyjr0Gm0tbLPIB5jrqxJMbpiYm");
    process.exit(1);
  }

  try {
    console.log(`🔄 Finding board with slug: ${boardSlug}...`);
    
    const board = await db.board.findUnique({
      where: { slug: boardSlug },
    });

    if (!board) {
      console.log(`❌ Board not found: ${boardSlug}`);
      process.exit(1);
    }

    console.log(`📋 Found board: "${board.title}"`);
    console.log(`   Current orgId: ${board.orgId || "null (personal)"}`);
    console.log(`   Assigning to: ${targetOrgId}`);

    const updatedBoard = await db.board.update({
      where: { slug: boardSlug },
      data: {
        orgId: targetOrgId,
      },
    });

    console.log(`\n✅ Board successfully updated!`);
    console.log(`   Title: "${updatedBoard.title}"`);
    console.log(`   Organization ID: ${updatedBoard.orgId}`);
    console.log(`\n👥 Team members can now see this board when they select the organization!`);

  } catch (error) {
    console.error("❌ Update failed:", error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

assignBoardToOrg();

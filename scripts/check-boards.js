/**
 * Database Utility: Check board organization IDs
 * Run with: node scripts/check-boards.js
 */

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function checkBoardOrgIds() {
  console.log("🔍 Analyzing board organization IDs...\n");

  try {
    // Get all boards
    const allBoards = await db.board.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`📊 Total boards: ${allBoards.length}\n`);

    // Categorize boards
    const personalBoards = allBoards.filter((b) => b.orgId === null);
    const orgBoards = allBoards.filter((b) => b.orgId !== null);

    console.log(`📌 Personal boards (orgId: null): ${personalBoards.length}`);
    personalBoards.forEach((board) => {
      console.log(
        `   • "${board.title}" (${board.slug}) - Owner: ${board.user?.name || board.userId}`
      );
    });

    console.log(`\n🏢 Organization boards: ${orgBoards.length}`);
    orgBoards.forEach((board) => {
      console.log(
        `   • "${board.title}" (${board.slug}) - Org: ${board.orgId} - Owner: ${board.user?.name || board.userId}`
      );
    });

    console.log("\n✅ Analysis complete!");
    console.log("\nℹ️  Problem diagnosis:");
    if (orgBoards.length === 0) {
      console.log("⚠️  No organization boards found! Boards may not have orgId set.");
      console.log("   → When creating a board in org context, orgId should be saved");
      console.log("   → Check that Clerk auth().orgId is being passed to create-board action");
    } else {
      console.log(`✅ Found ${orgBoards.length} organization board(s)`);
      console.log("\nOrganization IDs with boards:");
      const orgIds = [...new Set(orgBoards.map(b => b.orgId))];
      orgIds.forEach(id => {
        const count = orgBoards.filter(b => b.orgId === id).length;
        console.log(`   • ${id}: ${count} board(s)`);
      });
    }

  } catch (error) {
    console.error("❌ Check failed:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

checkBoardOrgIds()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

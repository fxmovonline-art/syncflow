/**
 * Database Utility: Check board organization IDs
 * 
 * This script helps diagnose issues with boards and organization IDs.
 * Run with: npx ts-node --project tsconfig.json -O '{"module":"commonjs"}' scripts/fix-board-org-ids.ts
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
    const personalBoards = allBoards.filter((b: any) => b.orgId === null);
    const orgBoards = allBoards.filter((b: any) => b.orgId !== null);

    console.log(`📌 Personal boards (orgId: null): ${personalBoards.length}`);
    personalBoards.forEach((board: any) => {
      console.log(
        `   • "${board.title}" (${board.slug}) - Owner: ${board.user?.name || board.userId}`
      );
    });

    console.log(`\n🏢 Organization boards: ${orgBoards.length}`);
    orgBoards.forEach((board: any) => {
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

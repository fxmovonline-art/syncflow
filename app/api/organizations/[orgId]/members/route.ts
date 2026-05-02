import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * GET /api/organizations/[orgId]/members
 * Returns all members of an organization from Clerk
 * Only returns: id, firstName, lastName, imageUrl, email
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { orgId } = await params;

  try {
    // Fetch all organization members from Clerk
    const clerk = await clerkClient();
    const members = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    // Map Clerk members to our format
    const memberUsers = members.data
      .filter((membership) => membership.publicUserData)
      .map((membership) => {
        const user = membership.publicUserData!;
        return {
          id: user.userId,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || "",
          email: user.identifier || "",
        };
      });

    return Response.json(memberUsers);
  } catch (error) {
    console.error("[GET_ORG_MEMBERS_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch organization members" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

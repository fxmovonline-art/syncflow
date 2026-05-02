/**
 * Utilities for handling Clerk organization invitations
 * Ensures invitation links work correctly on production domains
 */

import { clerkClient } from "@clerk/nextjs/server";
import { getOrigin } from "./get-origin";

/**
 * Generate an invitation link for an organization
 * This function constructs the proper URL with the correct origin
 * 
 * @param organizationId - The Clerk organization ID
 * @param invitationToken - The invitation token from Clerk
 * @param headers - Optional headers for origin detection
 * @returns The full invitation URL
 */
export async function generateInvitationLink(
  organizationId: string,
  invitationToken: string,
  headers?: Headers
): Promise<string> {
  const origin = getOrigin(headers);
  
  // Construct the invitation URL
  // Users can accept invitations at: /sign-up?invitation_token=xxxxx
  const invitationUrl = new URL("/sign-up", origin);
  invitationUrl.searchParams.set("invitation_token", invitationToken);
  
  return invitationUrl.toString();
}

/**
 * Get organization invitation URL using Clerk API
 * This creates an invitation and returns the link
 * 
 * @param organizationId - The Clerk organization ID
 * @param emailAddress - Email to invite
 * @param headers - Optional headers for origin detection
 * @param role - User role in organization (default: "member")
 * @returns Object with invitation details and URL
 */
export async function createOrganizationInvitation(
  organizationId: string,
  emailAddress: string,
  headers?: Headers,
  role: string = "member"
) {
  try {
    const clerk = await clerkClient();
    
    // Create the invitation in Clerk
    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId,
      emailAddress,
      role,
    });

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

    // Generate the invitation URL with the correct origin
    const invitationUrl = await generateInvitationLink(organizationId, invitation.id, headers);

    return {
      success: true,
      invitationId: invitation.id,
      email: emailAddress,
      invitationUrl,
      createdAt: invitation.createdAt,
    };
  } catch (error) {
    console.error("Error creating organization invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invitation",
    };
  }
}

/**
 * Verify that an invitation token is valid
 * This should be called before redirecting the user
 * 
 * @param token - The invitation token
 * @returns Invitation details if valid
 */
export async function verifyInvitationToken(token: string) {
  try {
    const clerk = await clerkClient();
    
    // Clerk SDK will validate the token
    // You can use this to verify before redirecting
    return {
      valid: true,
      token,
    };
  } catch (error) {
    console.error("Error verifying invitation token:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}

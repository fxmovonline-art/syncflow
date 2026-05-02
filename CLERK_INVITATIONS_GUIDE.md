# Clerk Organization Invitations on Vercel

This guide covers how organization invitations work in SyncFlow and how to ensure they function correctly on Vercel.

## How Invitations Work

When a user invites someone to an organization in SyncFlow:

1. **Invitation Creation**: An invitation is created in Clerk
2. **Invitation Link**: Clerk generates an invitation link/token
3. **Token Redirect**: The invited user visits the link and is redirected to your sign-up page with the invitation token
4. **Auto-Organization**: Upon sign-up, the user is automatically added to the invited organization

## Production Setup

### Critical: Set NEXT_PUBLIC_APP_URL

For invitations to work correctly on Vercel, you **must** set the `NEXT_PUBLIC_APP_URL` environment variable:

```bash
# In Vercel Project Settings → Environment Variables
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Why this matters:**
- Clerk uses this URL to construct invitation links
- Without it, invitations may point to `localhost:3000` or incorrect domains
- Your custom domain must be included exactly as you configured in Clerk

### Configure Clerk Allowed Origins

In your Clerk Dashboard → Settings → Domains & URLs:

1. **Add all your domains:**
   - Development: `http://localhost:3000`
   - Vercel Preview: `https://*.vercel.app`
   - Production: `https://your-custom-domain.com`
   - Production: `https://your-project.vercel.app`

2. **Example configuration:**
   ```
   Allowed Origins:
   - http://localhost:3000
   - https://*.vercel.app
   - https://syncflow.vercel.app
   - https://syncflow.com (if custom domain)
   ```

### Redirect URLs in Clerk

Configure these in Clerk Dashboard → Applications → Select App → Paths:

```
Sign In URL: /sign-in
Sign Up URL: /sign-up
After Sign In Redirect: /dashboard
After Sign Up Redirect: /dashboard
```

## Using the Invitation Utilities

The application includes helper functions in `lib/organization-invitations.ts`:

### Generate Invitation Link

```typescript
import { generateInvitationLink } from "@/lib/organization-invitations";
import { headers } from "next/headers";

// In an API route or server action:
const headersList = await headers();
const invitationUrl = await generateInvitationLink(
  organizationId,
  invitationToken,
  headersList
);
```

### Create Invitation

```typescript
import { createOrganizationInvitation } from "@/lib/organization-invitations";
import { headers } from "next/headers";

// Create an invitation (if you add this feature later)
const result = await createOrganizationInvitation(
  organizationId,
  "user@example.com",
  await headers()
);

if (result.success) {
  console.log("Invitation URL:", result.invitationUrl);
}
```

## Invitation Flow Diagram

```
User A (existing member)
    ↓
Invites User B to Organization
    ↓
Clerk generates invitation token
    ↓
Invitation link: https://your-domain.vercel.app/sign-up?invitation_token=xxxxx
    ↓
User B clicks link
    ↓
Redirected to sign-up with token
    ↓
User B completes sign-up
    ↓
Automatically added to organization
    ↓
Redirected to /dashboard
```

## Troubleshooting Invitations

### Issue: Invitation links don't work

**Symptoms:**
- Invitation link results in 404 or wrong page
- Invitation token is not recognized

**Solutions:**
1. Check that `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
2. Verify the domain matches your Clerk configuration
3. Check Clerk logs for invitation errors:
   ```bash
   Clerk Dashboard → Webhooks & Events → View Logs
   ```
4. Ensure the domain is added to Clerk's allowed origins

### Issue: User not added to organization after accepting invite

**Symptoms:**
- User completes sign-up but isn't part of the organization
- Dashboard shows no organization boards

**Solutions:**
1. Check Clerk webhook is properly configured:
   - Endpoint: `https://your-domain.vercel.app/api/webhooks/clerk`
   - Must be reachable from Clerk's servers
2. Verify `CLERK_WEBHOOK_SECRET` matches exactly in both places
3. Check webhook logs in Clerk dashboard

### Issue: Wrong domain in invitation link

**Symptoms:**
- Invitation link contains `localhost:3000` or wrong domain
- Link doesn't work when sent to users

**Solutions:**
1. Check `NEXT_PUBLIC_APP_URL` environment variable:
   ```bash
   # In Vercel, add this to Environment Variables
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
2. Redeploy after updating environment variables
3. Clear any browser caches

### Issue: "Invitation has expired"

**Symptoms:**
- User gets error when clicking invitation link
- Invitation was valid but stopped working

**Solutions:**
1. Invitations expire after 30 days by default in Clerk
2. Send fresh invitation link to user
3. Extend invitation timeout in Clerk settings if needed

## Local Testing

For local development, Clerk allows `localhost`:

1. Sign up for Clerk account
2. Create application with dev environment
3. Add allowed origins: `http://localhost:3000`
4. Set environment variables:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
5. Run: `npm run dev`
6. Test invitations locally

## Security Considerations

### Private Organization Data

- Never expose organization IDs in URLs (except [organizationId] params)
- Always verify user has access to organization
- Check `orgId` from Clerk matches requested organization

### Invitation Token Security

- Tokens are automatically validated by Clerk
- Tokens expire after 30 days
- Never hardcode or log tokens in production

### CORS & Origin Validation

The application includes CORS headers in `next.config.ts`:
- Only allows same-origin requests for sensitive endpoints
- Rejects requests from unknown origins
- Production domain must be explicitly configured

## Advanced: Custom Invitation URL

If you need a custom invitation flow (e.g., sending emails with custom branding):

```typescript
// In an API route (app/api/invitations/route.ts):
import { generateInvitationLink } from "@/lib/organization-invitations";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { organizationId, invitationToken } = await req.json();
  
  const headersList = await headers();
  const invitationUrl = await generateInvitationLink(
    organizationId,
    invitationToken,
    headersList
  );
  
  // Send custom email, create custom link, etc.
  return NextResponse.json({ invitationUrl });
}
```

## Domain-Specific Issues

### Using Preview Deployments

Vercel creates preview URLs for pull requests (e.g., `https://sync-flow-pr-123.vercel.app`):

**Note:** These don't work with organization invitations unless also added to Clerk allowed origins.

**Solution:** Add wildcard: `https://*.vercel.app`

### Custom Domains

If using custom domain (e.g., `syncflow.com`):

1. Add to Clerk allowed origins: `https://syncflow.com`
2. Update `NEXT_PUBLIC_APP_URL`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://syncflow.com
   ```
3. Ensure DNS is properly configured in Vercel
4. Test invitation links on the custom domain

### Subdomains

If using subdomains (e.g., `app.syncflow.com`):

1. Configure in Clerk: `https://app.syncflow.com`
2. Set environment variable:
   ```bash
   NEXT_PUBLIC_APP_URL=https://app.syncflow.com
   ```
3. Add DNS CNAME to Vercel

## Monitoring & Debugging

### Check Invitation URLs

In Clerk Dashboard → Organizations → [Your Org] → Members:
- Pending invitations show status
- Can see who sent and when
- Can resend or cancel invitations

### Server Logs

Check Vercel deployment logs for:
- Webhook processing errors
- Authentication failures
- Origin validation failures

```bash
# View Vercel logs
vercel logs <project-name>
```

### Clerk Logs

Check Clerk Dashboard → Logs for:
- Webhook events
- Authentication attempts
- Invitation creation/acceptance

## Best Practices

✓ Always use `NEXT_PUBLIC_APP_URL` for dynamic URL generation
✓ Include all production domains in Clerk allowed origins
✓ Test invitations on each new deployment
✓ Monitor invitation acceptance rates
✓ Set up alerts for webhook failures
✓ Document your domain configuration
✓ Use relative paths for internal links (already done in SyncFlow)

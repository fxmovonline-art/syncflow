# SyncFlow - Vercel Deployment Guide

This guide covers all steps needed to deploy SyncFlow to Vercel with proper production configuration.

## Prerequisites

- Vercel account (https://vercel.com)
- Clerk account with production environment (https://clerk.com)
- PostgreSQL database (managed via Prisma)
- GitHub repository with your SyncFlow code

## Step 1: Prepare Your Repository

### 1.1 Environment Variables
Before deploying, ensure your local `.env` file has the correct production values. Use `.env.example` as a template:

```bash
cp .env.example .env
```

**Important**: Never commit `.env` to version control. Ensure `.gitignore` includes `.env`.

## Step 2: Configure Clerk for Production

### 2.1 Create Production Instance in Clerk

1. Go to Clerk Dashboard → Applications
2. Create a new application for production or use an existing one
3. Note these keys (you'll add them to Vercel):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public)
   - `CLERK_SECRET_KEY` (secret)
   - `CLERK_WEBHOOK_SECRET` (secret)

### 2.2 Configure Allowed Origins

In Clerk Dashboard → Settings → Domains & URLs:

1. Add your Vercel domain(s):
   - Production: `https://your-domain.vercel.app`
   - Custom domain: `https://your-domain.com`

2. Configure Redirect URLs:
   - Sign in: `/sign-in`
   - Sign up: `/sign-up`
   - After sign in fallback: `/dashboard`
   - After sign up fallback: `/dashboard`

### 2.3 Set Up Webhooks

1. In Clerk Dashboard → Webhooks
2. Create a new endpoint:
   - Endpoint URL: `https://your-domain.vercel.app/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret to `CLERK_WEBHOOK_SECRET`

## Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select Next.js as the framework (auto-detected)
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

### 3.2 Add Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
UNSPLASH_ACCESS_KEY=xxxxx
```

**Important Variables Explained:**

- `NEXT_PUBLIC_APP_URL`: Used for generating invitation links and dynamic redirects. Must match your deployment domain.
- `CLERK_SECRET_KEY`: Keep this secret - never expose to frontend
- `CLERK_WEBHOOK_SECRET`: Must match the webhook secret in Clerk dashboard

### 3.3 Configure Domain (Optional)

If using a custom domain:

1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Update DNS records according to Vercel's instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Step 4: Post-Deployment Verification

### 4.1 Test Authentication Flow

1. Visit your deployed application
2. Click "Sign In"
3. Complete the Clerk authentication flow
4. Verify redirect to `/dashboard`

### 4.2 Test Organization Features

1. Create an organization
2. Add members to the organization
3. Verify invitation links work correctly with your domain

### 4.3 Monitor Logs

In Vercel Dashboard → Deployments → your deployment → Logs:
- Check for any authentication errors
- Verify webhook payloads are being processed

## Step 5: Middleware Configuration

The middleware (`middleware.ts`) is configured to:

✓ Protect all routes except public routes (/, /sign-in, /sign-up, webhooks)
✓ Handle organization context redirects
✓ Work with Clerk's `clerkMiddleware`

**Protected Routes:**
- All routes under `/dashboard` require authentication
- Routes under `/organization/:id` require organization membership
- API routes require authentication (except `/api/webhooks/*`)

## Step 6: Production Optimizations

### 6.1 Origin Detection

The application uses dynamic origin detection via:
- `getOrigin()` function in `lib/get-origin.ts`
- Automatic detection from `VERCEL_URL` in Vercel environment
- Fallback to `NEXT_PUBLIC_APP_URL` environment variable

### 6.2 CORS Configuration

API routes are configured in `next.config.ts` with:
- Proper `Access-Control-Allow-*` headers
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)

### 6.3 Image Optimization

Configured to serve images from:
- Unsplash (for board covers)
- Clerk (for user avatars)
- Google (for social sign-in avatars)

## Troubleshooting

### Issue: Invitation links not working

**Solution:** Ensure `NEXT_PUBLIC_APP_URL` matches your deployment domain exactly.

```bash
# Check your domain
https://your-project.vercel.app

# Verify in Clerk dashboard that this domain is added
```

### Issue: "Unauthorized" on dashboard routes

**Solution:** 
1. Check that Clerk webhook is properly configured
2. Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
3. Check Vercel logs for webhook errors

### Issue: Organization redirects not working

**Solution:**
1. Middleware requires both authentication and organization context
2. Users must be invited to organization in Clerk
3. Check that `orgId` is properly passed from Clerk auth

### Issue: Static files (CSS, JS) not loading

**Solution:** This is usually a path issue.
1. Verify `NEXT_PUBLIC_APP_URL` is correct
2. Check Vercel deployment logs
3. Ensure all environment variables are set

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
- [Prisma Production Deployment](https://www.prisma.io/docs/guides/deployment/deployment)

## Security Checklist

Before going live:

- [ ] All secrets are in Vercel environment variables (not in code)
- [ ] CORS is properly configured
- [ ] Clerk webhook is verified and working
- [ ] Database backups are configured
- [ ] Custom domain SSL is active
- [ ] Monitoring/alerts are set up
- [ ] Rate limiting is in place
- [ ] Error logging is configured

## Support

For issues specific to:
- **Clerk**: https://support.clerk.com
- **Vercel**: https://vercel.com/support
- **Next.js**: https://github.com/vercel/next.js/discussions

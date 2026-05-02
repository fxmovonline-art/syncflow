# SyncFlow Production Deployment Checklist

Use this checklist to ensure your SyncFlow application is properly configured for production deployment on Vercel.

## Pre-Deployment Verification

### Code Configuration

- [ ] **Middleware Check**
  - [ ] `middleware.ts` uses `clerkMiddleware` correctly
  - [ ] Protected routes require authentication
  - [ ] Organization routes properly validate org membership
  - [ ] Public routes (/, /sign-in, /sign-up) are excluded from auth

- [ ] **URL Handling**
  - [ ] No hardcoded `localhost:3000` in source code
  - [ ] All API calls use relative paths (e.g., `/api/boards`)
  - [ ] All internal links use Next.js `<Link>` component
  - [ ] `revalidatePath` used instead of `redirect()` where appropriate

- [ ] **Environment Variables**
  - [ ] All secret keys in `.env` (never in code)
  - [ ] `.env` is in `.gitignore`
  - [ ] `.env.example` exists and is up to date
  - [ ] No `NEXT_PUBLIC_` prefix on secret keys

- [ ] **Error Handling**
  - [ ] Try-catch blocks in server actions
  - [ ] Proper error messages in API routes
  - [ ] Sensitive errors not exposed to client

### Configuration Files

- [ ] **next.config.ts**
  - [ ] Image optimization configured for external domains
  - [ ] CORS headers properly set
  - [ ] Security headers included (X-Content-Type-Options, etc.)

- [ ] **tsconfig.json**
  - [ ] Paths aliases configured (e.g., @/*)
  - [ ] Strict mode enabled

- [ ] **package.json**
  - [ ] All dependencies pinned to specific versions
  - [ ] No development dependencies in production
  - [ ] Build scripts configured correctly

## Clerk Configuration

### Clerk Production Setup

- [ ] **Organization Created**
  - [ ] Production Clerk organization/app created
  - [ ] Separate from development environment

- [ ] **Keys Generated**
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` obtained
  - [ ] `CLERK_SECRET_KEY` obtained
  - [ ] `CLERK_WEBHOOK_SECRET` obtained

- [ ] **Allowed Origins**
  - [ ] Vercel production domain added: `https://project.vercel.app`
  - [ ] Custom domain added (if applicable): `https://your-domain.com`
  - [ ] Wildcard for preview deployments: `https://*.vercel.app`
  - [ ] Development localhost removed from production environment

- [ ] **Redirect URLs**
  - [ ] Sign in redirect: `/sign-in`
  - [ ] Sign up redirect: `/sign-up`
  - [ ] After sign in fallback: `/dashboard`
  - [ ] After sign up fallback: `/dashboard`

- [ ] **Webhook Setup**
  - [ ] Webhook endpoint: `https://your-domain.vercel.app/api/webhooks/clerk`
  - [ ] Events subscribed: `user.created`, `user.updated`, `user.deleted`
  - [ ] Webhook secret matches `CLERK_WEBHOOK_SECRET` in app

### Session & Security

- [ ] **JWT Configuration**
  - [ ] JWT expires properly configured
  - [ ] Session timeouts reasonable
  - [ ] Refresh tokens configured

- [ ] **MFA/Security**
  - [ ] Consider enabling multi-factor authentication
  - [ ] Session security settings reviewed

## Database Configuration

### PostgreSQL Setup

- [ ] **Database Created**
  - [ ] Production database provisioned (e.g., Vercel Postgres, Railway, Heroku)
  - [ ] Backups configured
  - [ ] SSL enabled for connections

- [ ] **Connection String**
  - [ ] `DATABASE_URL` uses production credentials
  - [ ] Connection pooling enabled if necessary
  - [ ] SSL mode set to `require`

- [ ] **Migrations**
  - [ ] All Prisma migrations run: `npx prisma migrate deploy`
  - [ ] Schema matches production database
  - [ ] Indexes created on frequently queried fields

- [ ] **Data**
  - [ ] No test/development data in production
  - [ ] Initial data properly seeded if needed

## Vercel Deployment

### Project Setup

- [ ] **Repository Connected**
  - [ ] GitHub repository connected to Vercel
  - [ ] Correct branch selected (main, master, etc.)
  - [ ] Auto-deployments enabled

- [ ] **Build Configuration**
  - [ ] Build command: `npm run build`
  - [ ] Install command: `npm ci`
  - [ ] Output directory: `.next`

- [ ] **Environment Variables Set**
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `CLERK_WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
  - [ ] `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app` (CRITICAL!)
  - [ ] `UNSPLASH_ACCESS_KEY` (if applicable)

- [ ] **Custom Domain** (if applicable)
  - [ ] Domain configured in Vercel
  - [ ] DNS records properly set
  - [ ] SSL certificate active
  - [ ] Redirect from non-www to www configured

### Analytics & Monitoring

- [ ] **Error Tracking**
  - [ ] Error logging configured (Sentry, DataDog, etc.)
  - [ ] Error notifications set up

- [ ] **Performance Monitoring**
  - [ ] Core Web Vitals monitored
  - [ ] Page load times tracked

- [ ] **Vercel Analytics** (optional)
  - [ ] Web Analytics enabled
  - [ ] Speed Insights enabled

## Testing & Validation

### Manual Testing

- [ ] **Authentication Flow**
  - [ ] Sign up works with email
  - [ ] Sign in works
  - [ ] Sign out clears session
  - [ ] Protected routes redirect to sign in
  - [ ] Clerk user created in database

- [ ] **Organization Flow**
  - [ ] Create organization works
  - [ ] Switch between organizations works
  - [ ] Organization dashboard loads correct data
  - [ ] Organization members visible

- [ ] **Board Operations**
  - [ ] Create board works
  - [ ] Create list works
  - [ ] Create card works
  - [ ] Update card works
  - [ ] Delete operations work
  - [ ] Revalidation updates data correctly

- [ ] **Real-time Features**
  - [ ] Board presence shows active users
  - [ ] Real-time updates work (if implemented)
  - [ ] Drag & drop operations sync

### Deployment Verification

- [ ] **URL Tests**
  - [ ] Root domain works: `https://your-domain.vercel.app`
  - [ ] Public pages load: `/`, `/sign-in`, `/sign-up`
  - [ ] Protected pages redirect: `/dashboard` → sign in
  - [ ] 404 pages display properly

- [ ] **API Tests**
  - [ ] API endpoints respond correctly
  - [ ] CORS headers present
  - [ ] Error responses formatted properly
  - [ ] Webhooks processing correctly

- [ ] **Static Assets**
  - [ ] CSS loads and applies correctly
  - [ ] JavaScript functions properly
  - [ ] Images load from external sources
  - [ ] Fonts display correctly

- [ ] **Database Connectivity**
  - [ ] Database queries work
  - [ ] Data persists across requests
  - [ ] Migrations applied successfully

### Security Testing

- [ ] **HTTPS**
  - [ ] All requests redirect to HTTPS
  - [ ] SSL certificate valid
  - [ ] No mixed content warnings

- [ ] **Authentication**
  - [ ] Unauthorized users can't access protected routes
  - [ ] Cross-user access is blocked
  - [ ] Cross-organization access is blocked
  - [ ] Tokens not exposed in URLs (use httpOnly cookies)

- [ ] **API Security**
  - [ ] API validates user permissions
  - [ ] Rate limiting in place (consider adding)
  - [ ] Sensitive data not logged

- [ ] **Environment**
  - [ ] Secrets not exposed in error messages
  - [ ] Debug mode disabled
  - [ ] Source maps in build (optional, controlled)

## Post-Deployment

### Monitoring Setup

- [ ] **Logs Monitoring**
  - [ ] Set up log aggregation
  - [ ] Error alerts configured
  - [ ] Performance alerts configured

- [ ] **Uptime Monitoring**
  - [ ] Uptime monitoring service configured
  - [ ] Page load time monitoring active
  - [ ] Alerts for downtime configured

- [ ] **User Behavior**
  - [ ] Analytics tracking working
  - [ ] Critical user journeys monitored

### Documentation

- [ ] **Runbooks Created**
  - [ ] How to respond to errors
  - [ ] How to scale the application
  - [ ] Rollback procedures documented

- [ ] **Deployment Notes**
  - [ ] Document what was deployed and when
  - [ ] Note any manual steps taken
  - [ ] Record configuration details

### Maintenance

- [ ] **Automated Backups**
  - [ ] Database backups scheduled
  - [ ] Backup retention policy set
  - [ ] Restore procedure tested

- [ ] **Dependency Updates**
  - [ ] Plan for regular security updates
  - [ ] Monitor for deprecated dependencies
  - [ ] Test updates in staging first

- [ ] **Performance Optimization**
  - [ ] Monitor and optimize Core Web Vitals
  - [ ] Review expensive database queries
  - [ ] Optimize images and assets

## Troubleshooting Reference

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on deployed domain | Check environment variables, rebuild, verify routes |
| Authentication not working | Verify Clerk keys, webhook configuration, allowed origins |
| Database connection failed | Check DATABASE_URL, SSL mode, firewall rules |
| Invitation links broken | Verify NEXT_PUBLIC_APP_URL is correct, matches Clerk config |
| Images not loading | Check next.config.ts remotePatterns, Vercel image optimization |
| CORS errors | Verify CORS headers in next.config.ts, origin validation |
| Slow page loads | Check database indexes, implement caching, optimize images |

## Quick Reference: Critical Environment Variables

```bash
# MUST BE SET - without these, app won't work
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Should be set - for proper redirects after auth
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Optional - for image features
UNSPLASH_ACCESS_KEY=...
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Clerk Production Guide](https://clerk.com/docs/deployments/clerk-production)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

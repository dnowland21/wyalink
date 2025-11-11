# Coolify Deployment Setup

Complete guide for deploying WyaLink applications to Coolify.

## Prerequisites

- Coolify instance running and accessible
- Git repository pushed to GitHub/GitLab/Gitea
- Domain names configured (DNS A records pointing to your server)
- SSH access to your Coolify server (for troubleshooting)

## Overview

You'll be deploying two separate services:
1. **WyaLink Website** - Customer-facing marketing site
2. **LinkOS** - Internal business management system

Each service runs independently with its own Docker container and domain.

---

## Part 1: WyaLink Website Deployment

### Step 1: Create New Service

1. Log into your Coolify dashboard
2. Navigate to your project (or create a new one)
3. Click **"+ New Resource"**
4. Select **"Service"**
5. Choose **"Public Repository"** or connect your Git provider

### Step 2: Repository Configuration

**Repository Settings:**
- **Git Repository URL:** `https://github.com/yourusername/wyalink.git` (or your repo URL)
- **Branch:** `main` (or `dev` for development)
- **Auto Deploy:** ✅ Enable (optional - deploys on git push)

### Step 3: Build Configuration

**Build Settings:**
- **Build Pack:** `Dockerfile`
- **Dockerfile Location:** `apps/website/Dockerfile`
- **Docker Context:** `.` (root directory)
- **Build Arguments:** None required

### Step 4: Port & Health Check

**Port Configuration:**
- **Port:** `80`
- **Health Check Path:** `/health`
- **Health Check Interval:** `30s` (default)

### Step 5: Domain Configuration

**Domain Settings:**
- **Domain:** `www.wyalink.com` (or your domain)
- **SSL/TLS:** ✅ Enable automatic HTTPS
- **Force HTTPS:** ✅ Enable

### Step 6: Deploy

1. Click **"Deploy"**
2. Monitor the build logs
3. Wait for build to complete (~2-3 minutes first time)
4. Verify health check passes

### Step 7: Verify Deployment

Visit your domain: `https://www.wyalink.com`

**Expected Result:**
- WyaLink homepage loads
- All pages accessible (Home, Plans, Coverage, Support, About)
- Logo displays correctly
- Responsive design works on mobile

---

## Part 2: LinkOS Deployment

### Step 1: Create Second Service

1. Return to Coolify dashboard
2. Click **"+ New Resource"** again
3. Select **"Service"**
4. Choose **"Public Repository"** or use existing Git connection

### Step 2: Repository Configuration

**Repository Settings:**
- **Git Repository URL:** Same repository as website
- **Branch:** `main` (or `dev`)
- **Auto Deploy:** ✅ Enable (optional)

### Step 3: Build Configuration

**Build Settings:**
- **Build Pack:** `Dockerfile`
- **Dockerfile Location:** `apps/linkos/Dockerfile`
- **Docker Context:** `.` (root directory)
- **Build Arguments:** None required

### Step 4: Port & Health Check

**Port Configuration:**
- **Port:** `80`
- **Health Check Path:** `/health`
- **Health Check Interval:** `30s`

### Step 5: Domain Configuration

**Domain Settings:**
- **Domain:** `linkos.wyalink.com` (subdomain recommended)
- **SSL/TLS:** ✅ Enable automatic HTTPS
- **Force HTTPS:** ✅ Enable

### Step 6: Deploy

1. Click **"Deploy"**
2. Monitor the build logs
3. Wait for build to complete
4. Verify health check passes

### Step 7: Verify Deployment

Visit your subdomain: `https://linkos.wyalink.com`

**Expected Result:**
- LinkOS redirects to `/dashboard`
- Dashboard loads with statistics and charts
- Sidebar navigation works (collapsible)
- All pages accessible (Dashboard, Leads, Customers)
- Logo and icons display correctly

---

## Environment Variables (Future)

Currently, both applications are static sites with no backend, so no environment variables are required.

### When Adding Backend API:

**For Website:**
```bash
VITE_API_URL=https://api.wyalink.com
VITE_ENABLE_ANALYTICS=true
```

**For LinkOS:**
```bash
VITE_API_URL=https://api.wyalink.com
VITE_AUTH_DOMAIN=auth.wyalink.com
VITE_ENABLE_DEBUG=false
```

**To Add Environment Variables in Coolify:**
1. Open your service
2. Navigate to **"Environment Variables"** tab
3. Click **"+ Add"**
4. Enter variable name and value
5. Click **"Save"**
6. Redeploy the service

---

## Build Time Expectations

| Stage | Duration | Description |
|-------|----------|-------------|
| Git Clone | 5-10s | Downloading repository |
| Dependencies Install | 30-60s | npm install (first build) |
| Build (Website) | ~0.6s | Vite production build |
| Build (LinkOS) | ~0.7s | Vite production build |
| Docker Image | 20-30s | Creating container image |
| **Total First Deploy** | **2-3 min** | Complete deployment |
| **Subsequent Deploys** | **1-2 min** | With cached layers |

---

## Monitoring & Logs

### View Build Logs

1. Open service in Coolify
2. Click **"Deployments"** tab
3. Select latest deployment
4. View real-time build logs

### View Application Logs

1. Open service in Coolify
2. Click **"Logs"** tab
3. View Nginx access/error logs

### Health Check Status

1. Open service in Coolify
2. Check status indicator (green = healthy)
3. View **"Health Checks"** tab for history

---

## Troubleshooting

### Build Fails

**Issue:** "Cannot find Dockerfile"
- **Solution:** Verify `Dockerfile Location` is correct:
  - Website: `apps/website/Dockerfile`
  - LinkOS: `apps/linkos/Dockerfile`

**Issue:** "npm install fails"
- **Solution:** Ensure package-lock.json is committed to git
- Check build logs for specific error

**Issue:** "Build succeeds but health check fails"
- **Solution:**
  - Verify port is set to `80`
  - Check health check path is `/health`
  - Review Nginx logs for errors

### Deployment Issues

**Issue:** "502 Bad Gateway"
- **Solution:**
  - Check if container is running
  - Verify health check passes
  - Review application logs
  - Restart service

**Issue:** "SSL Certificate Error"
- **Solution:**
  - Wait 5-10 minutes for certificate provisioning
  - Verify DNS is pointing to Coolify server
  - Check domain configuration in Coolify

**Issue:** "Assets not loading (404 errors)"
- **Solution:**
  - Verify Nginx configuration includes all asset types
  - Check browser console for specific 404s
  - Ensure all assets are in `public/` directory

### Domain Issues

**Issue:** "Domain not resolving"
- **Solution:**
  1. Verify DNS A record: `dig www.wyalink.com`
  2. Should point to Coolify server IP
  3. DNS propagation can take up to 48 hours

**Issue:** "www vs non-www redirect issues"
- **Solution:**
  - Add both domains to Coolify
  - Set up redirect from one to the other

---

## Resource Requirements

### Minimum Server Specs

**For Both Applications:**
- **CPU:** 2 cores
- **RAM:** 2GB
- **Disk:** 20GB
- **Network:** 100 Mbps

### Expected Resource Usage

**Per Application:**
- **CPU:** <5% (idle)
- **RAM:** ~50MB (Nginx + static files)
- **Disk:** ~200MB (Docker image)

**Both Applications Total:**
- **CPU:** <10%
- **RAM:** ~100MB
- **Disk:** ~400MB

---

## Scaling Considerations

### Horizontal Scaling (Multiple Instances)

For high availability, you can run multiple instances behind a load balancer:

1. Deploy to multiple Coolify servers
2. Set up load balancer (HAProxy, Nginx, Caddy)
3. Point DNS to load balancer
4. Configure health checks on load balancer

### CDN Integration

For better global performance:

1. **Cloudflare:**
   - Point DNS to Cloudflare
   - Enable CDN caching
   - Configure cache rules for static assets

2. **Other CDNs:**
   - AWS CloudFront
   - Fastly
   - BunnyCDN

---

## Backup & Rollback

### Manual Backup

1. Tag your git commit before major changes:
   ```bash
   git tag -a v1.0.0 -m "Production release"
   git push origin v1.0.0
   ```

2. In Coolify, note the working deployment ID

### Rollback Procedure

1. Open service in Coolify
2. Navigate to **"Deployments"** tab
3. Find previous working deployment
4. Click **"Redeploy"** on that version

**Or via Git:**
1. Revert to previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. Coolify auto-deploys (if enabled)

---

## Automated Deployments

### GitHub Actions Integration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Coolify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Deployment
        run: |
          curl -X POST https://your-coolify-instance.com/api/v1/deploy \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"service_id": "${{ secrets.SERVICE_ID }}"}'
```

### GitLab CI/CD Integration

Create `.gitlab-ci.yml`:

```yaml
deploy:
  stage: deploy
  only:
    - main
  script:
    - curl -X POST https://your-coolify-instance.com/api/v1/deploy
      -H "Authorization: Bearer $COOLIFY_TOKEN"
      -H "Content-Type: application/json"
      -d '{"service_id": "$SERVICE_ID"}'
```

---

## Security Best Practices

### 1. Access Control

**LinkOS (Internal System):**
- **Recommended:** Deploy on VPN or private network
- **Alternative:** IP whitelist in Nginx
- **Future:** Implement authentication before public deployment

### 2. SSL/TLS

- ✅ Always use HTTPS (automatic with Coolify)
- ✅ Enable HSTS headers (configured in nginx.conf)
- ✅ Use strong cipher suites (default in Nginx)

### 3. Security Headers

Already configured in both `nginx.conf` files:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### 4. Regular Updates

1. Update dependencies monthly:
   ```bash
   npm update
   npm audit fix
   ```

2. Rebuild and redeploy

---

## Cost Optimization

### Shared Server

Both applications can run on a **single $5-10/month VPS**:
- Hetzner CX21: 2 vCPU, 4GB RAM (~$5/month)
- DigitalOcean Basic: 2 vCPU, 2GB RAM (~$12/month)
- Linode Nanode: 1 vCPU, 1GB RAM (~$5/month)

### Multiple Servers (Recommended for Production)

- **Website:** Public-facing server ($5-10/month)
- **LinkOS:** Private server or VPN ($5-10/month)
- **Total:** $10-20/month

---

## Monitoring & Alerts

### Set Up Uptime Monitoring

**Recommended Services:**
1. **UptimeRobot** (Free)
   - Monitor both domains
   - Alert via email/SMS
   - 5-minute checks

2. **Pingdom** (Paid)
   - Detailed performance metrics
   - Global monitoring locations

3. **Self-Hosted:**
   - Uptime Kuma (open source)
   - Deploy alongside applications

### Configure Alerts

**In Coolify:**
1. Navigate to **Settings** → **Notifications**
2. Add email or Discord webhook
3. Enable alerts for:
   - Deployment failures
   - Health check failures
   - High resource usage

---

## Testing Deployment

### Pre-Deployment Checklist

- [ ] All code committed and pushed to git
- [ ] Local build successful: `npm run build`
- [ ] No TypeScript errors
- [ ] All pages load correctly locally
- [ ] Docker build tested locally (optional)
- [ ] DNS records configured
- [ ] Coolify service created

### Post-Deployment Verification

**Website:**
- [ ] Homepage loads (`https://www.wyalink.com`)
- [ ] All navigation links work
- [ ] Plans page displays correctly
- [ ] Footer logo displays (white version)
- [ ] Mobile responsive design works
- [ ] SSL certificate valid

**LinkOS:**
- [ ] Redirects to dashboard (`https://linkos.wyalink.com/dashboard`)
- [ ] Sidebar navigation works
- [ ] Sidebar collapse/expand functions
- [ ] All three pages load (Dashboard, Leads, Customers)
- [ ] Tables display data
- [ ] Search and filters present
- [ ] Header user menu works
- [ ] Mobile view functional

---

## Maintenance Windows

### Recommended Schedule

**Minor Updates:** Rolling deploys (no downtime)
**Major Updates:** 2-3 AM local time, 5-minute window

### Communication

Before major updates:
1. Notify team via email/Slack
2. Post notice in LinkOS dashboard (future feature)
3. Update status page (if using one)

---

## Support & Resources

### Coolify Documentation
- [Coolify Docs](https://coolify.io/docs)
- [Coolify Discord](https://discord.gg/coolify)

### Deployment Issues
- Check Coolify dashboard logs first
- Review build logs for errors
- Check health check status
- Verify DNS configuration

### Emergency Contact
- **DevOps/Deployment:** [Add contact]
- **Development Team:** [Add contact]

---

## Quick Reference

### Coolify Service URLs

**Website Service:**
- Dashboard: `https://your-coolify.com/project/website`
- Logs: `https://your-coolify.com/project/website/logs`
- Deployments: `https://your-coolify.com/project/website/deployments`

**LinkOS Service:**
- Dashboard: `https://your-coolify.com/project/linkos`
- Logs: `https://your-coolify.com/project/linkos/logs`
- Deployments: `https://your-coolify.com/project/linkos/deployments`

### Common Commands

**Trigger Manual Deploy:**
```bash
# Via Coolify UI: Click "Deploy" button

# Via API (if configured):
curl -X POST https://your-coolify.com/api/v1/deploy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"service_id": "SERVICE_ID"}'
```

**View Logs:**
```bash
# SSH to server
ssh user@your-server.com

# Docker logs for website
docker logs -f <container-name>

# Docker logs for linkos
docker logs -f <container-name>
```

---

**Setup Complete!** 🎉

Both WyaLink applications are now deployed and accessible via their respective domains.

---

**Last Updated:** January 2025
**Maintained by:** WyaCore, LLC

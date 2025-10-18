# Deployment Guide

This project can be deployed to Railway and GitHub Pages. Follow the steps below.

## Prerequisites

- GitHub account
- Railway account (https://railway.app)
- Node.js 18+ installed locally

## Step 1: Push to GitHub

### Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `game-app`)
3. Do NOT initialize with README, .gitignore, or license

### Push Your Code

\`\`\`bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to main branch
git branch -M main
git push -u origin main
\`\`\`

## Step 2: Deploy to Railway

### Option A: Using Railway CLI (Recommended)

1. **Install Railway CLI**
   \`\`\`bash
   npm i -g @railway/cli
   \`\`\`

2. **Login to Railway**
   \`\`\`bash
   railway login
   \`\`\`

3. **Initialize Railway Project**
   \`\`\`bash
   railway init
   \`\`\`
   - Select "Create a new project"
   - Name your project (e.g., "game-app")

4. **Link GitHub Repository**
   \`\`\`bash
   railway link
   \`\`\`

5. **Deploy**
   \`\`\`bash
   railway up
   \`\`\`

### Option B: Using Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway to access your GitHub account
5. Select your repository
6. Railway will automatically detect the Node.js project
7. Configure environment variables if needed
8. Click "Deploy"

### Option C: Using GitHub Actions (Automatic)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:
   - `RAILWAY_TOKEN`: Get from Railway Dashboard → Account → API Tokens
   - `RAILWAY_SERVICE_NAME`: Your Railway service name

4. The GitHub Actions workflow will automatically deploy on push to main

## Step 3: Configure Environment Variables (if needed)

In Railway Dashboard:

1. Go to your project
2. Click on the service
3. Go to **Variables** tab
4. Add any required environment variables:
   \`\`\`
   NODE_ENV=production
   \`\`\`

## Step 4: Access Your Deployed App

After deployment completes:

1. Go to Railway Dashboard
2. Click on your service
3. Find the **Deployments** tab
4. Click the deployment URL to view your live app

## Monitoring & Logs

### View Logs in Railway

\`\`\`bash
railway logs
\`\`\`

### View Logs in Dashboard

1. Go to Railway Dashboard
2. Select your service
3. Click **Logs** tab

## Redeployment

### Automatic (via GitHub)
- Push changes to `main` branch
- GitHub Actions will automatically build and deploy

### Manual (via CLI)
\`\`\`bash
railway up
\`\`\`

### Manual (via Dashboard)
1. Go to Railway Dashboard
2. Click your service
3. Click **Redeploy** button

## Troubleshooting

### Build Fails
- Check logs: `railway logs`
- Ensure `npm run build` works locally
- Verify all dependencies are in `package.json`

### App Crashes After Deploy
- Check environment variables are set correctly
- Review logs for error messages
- Ensure port 3000 is not hardcoded

### Port Issues
- Railway automatically assigns a port via `PORT` environment variable
- Update your start command if needed

## Rollback

To rollback to a previous deployment:

1. Go to Railway Dashboard
2. Select your service
3. Go to **Deployments** tab
4. Click the three dots on a previous deployment
5. Select **Redeploy**

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

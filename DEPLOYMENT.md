# Deployment Guide

## Deploy to Vercel

Follow these steps to deploy the proxy server to Vercel:

### 1. Install Vercel CLI (if you haven't already)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy the Project

From this directory, run:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → Choose a name (e.g., `figma-claude-proxy`)
- **Directory?** → `.` (current directory)
- **Override settings?** → No

### 4. Get Your Deployment URL

After deployment, Vercel will give you a URL like:
```
https://figma-claude-proxy.vercel.app
```

### 5. Update the Plugin Code

1. Open `code.ts`
2. Find line 87 where it says:
   ```typescript
   const PROXY_URL = 'https://your-vercel-app.vercel.app/api/proxy';
   ```
3. Replace with your actual Vercel URL:
   ```typescript
   const PROXY_URL = 'https://figma-claude-proxy.vercel.app/api/proxy';
   ```

### 6. Rebuild the Plugin

```bash
npm run build
```

### 7. Test the Plugin

1. Reload the plugin in Figma
2. Select a frame
3. Click "Generate HTML"

## Deploy Updates

To deploy updates to your proxy server:

```bash
vercel --prod
```

## Environment Variables (Optional)

If you want to add any environment variables in the future:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add your variables

## Troubleshooting

### CORS Errors
- Make sure the proxy URL in `code.ts` matches your Vercel deployment URL exactly
- Check that the `api/proxy.js` file is properly deployed

### Timeout Errors
- The proxy has a 60-second timeout (configured in `vercel.json`)
- If Claude's response takes longer, you may need to increase this limit

### 404 Errors
- Verify the URL path is `/api/proxy` (not `/proxy` or `api/proxy/`)
- Check that the `api` folder exists and contains `proxy.js`

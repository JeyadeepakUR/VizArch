# VizArch Deployment Guide

## Backend Deployment (Render)

### Prerequisites
- Render account (https://render.com)
- GitHub repository with VizArch code
- OpenRouter API key

### Step 1: Connect GitHub to Render
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Select "Deploy an existing repository"
4. Authorize GitHub and select `VizArch` repo

### Step 2: Configure Backend Service
- **Name**: `vizarch-backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: Free (or paid for production)

### Step 3: Add Environment Variables
Click "Environment" and add:
```
OPENROUTER_API_KEY = sk-or-v1-your-actual-key-here
OPENROUTER_SITE = https://vizarch.onrender.com (or your frontend URL)
OPENROUTER_TITLE = VizArch
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment (2-5 minutes)
- Your backend URL will be: `https://vizarch-backend.onrender.com`

### Step 5: Verify
```bash
curl https://vizarch-backend.onrender.com/health
```
Should return: `{"status":"operational","service":"VizArch"}`

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository
- Backend URL from Render

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Select `VizArch` repo

### Step 2: Configure Project
- **Project Name**: `vizarch`
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `frontend`

### Step 3: Add Environment Variables
Click "Environment Variables" and add:
```
NEXT_PUBLIC_API_URL = https://vizarch-backend.onrender.com
```

### Step 4: Deploy
- Click "Deploy"
- Wait for build (2-3 minutes)
- Your frontend URL will be: `https://vizarch.vercel.app` (or custom domain)

### Step 5: Verify
- Visit https://vizarch.vercel.app
- Should load the 3D interface
- Simulate a topology to verify backend connectivity

---

## Production Checklist

### Backend (Render)
- [ ] Health endpoint responds: `/health`
- [ ] API documentation available: `/docs`
- [ ] CORS allows frontend domain
- [ ] OpenRouter API key is valid (has credits)
- [ ] Environment variables are set
- [ ] Monitor logs for errors

### Frontend (Vercel)
- [ ] Page loads without 404 errors
- [ ] 3D scene renders (check browser console)
- [ ] API calls reach backend (check Network tab)
- [ ] Simulation button triggers backend
- [ ] PDF export works
- [ ] All interactive features functional

### Ongoing Maintenance
1. **Monitor Render logs**: https://dashboard.render.com → Service → Logs
2. **Monitor Vercel logs**: https://vercel.com/dashboard → Project → Deployments
3. **Check OpenRouter credits**: https://openrouter.ai/account/billing
4. **Set up alerts**: Both platforms support email notifications

---

## Troubleshooting

### "Connection refused to backend"
- Check backend URL in frontend `.env`
- Verify backend is deployed and running
- Check CORS settings in `backend/main.py`

### "Invalid API key"
- Verify OPENROUTER_API_KEY is correct
- Check OpenRouter account has remaining credits
- Regenerate key if needed

### "3D scene not rendering"
- Check browser console for WebGL errors
- Verify browser supports WebGL 2.0
- Check Network tab for failed requests

### "Slow responses from Render"
- Free tier Render services spin down after inactivity
- Consider upgrading to paid tier for production
- Or implement wake-up script

---

## Custom Domain Setup (Optional)

### Vercel Custom Domain
1. Settings → Domains → Add
2. Enter your domain (e.g., vizarch.com)
3. Update DNS records per Vercel instructions
4. SSL certificate auto-generated

### Render Custom Domain
1. Settings → Custom Domains → Add
2. Enter your backend domain (e.g., api.vizarch.com)
3. Update DNS CNAME record
4. SSL certificate auto-generated

---

## Environment Variables Reference

### Backend (.env or Render dashboard)
```
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_SITE=https://your-frontend-url.com
OPENROUTER_TITLE=VizArch
```

### Frontend (.env.local or Vercel dashboard)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## Performance Optimization

### Backend (Render)
- Use paid tier for production (prevents cold starts)
- Enable auto-scaling if available
- Monitor response times

### Frontend (Vercel)
- Vercel automatically optimizes Next.js builds
- Images are auto-optimized
- Static pages are cached globally

---

## Rollback Procedure

### Render
1. Go to Dashboard → Service → Deploys
2. Find previous working deployment
3. Click "Redeploy"

### Vercel
1. Go to Project → Deployments
2. Find previous working deployment
3. Click "Promote to Production"

---

*Last updated: January 20, 2026*

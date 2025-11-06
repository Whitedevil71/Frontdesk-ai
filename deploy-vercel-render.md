# 🚀 DEPLOY TO VERCEL + RENDER

## 🎯 DEPLOYMENT STRATEGY

- **Frontend** → Vercel (React app)
- **Backend** → Render (Node.js API)

## 📋 STEP-BY-STEP DEPLOYMENT

### 1️⃣ DEPLOY BACKEND TO RENDER

1. **Go to**: https://render.com
2. **Sign up/Login** with GitHub
3. **Connect Repository**: Link your GitHub repo
4. **Create Web Service**:

   - **Name**: `frontdesk-ai-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (for demo)

5. **Set Environment Variables**:

```
NODE_ENV=production
PORT=10000
MONGODB_URL=YOUR_MONGODB_ATLAS_URL
LIVEKIT_URL=YOUR_LIVEKIT_URL
LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY
LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
FRONTEND_URL=https://frontdesk-ai-supervisor.vercel.app
```

6. **Deploy**: Click "Create Web Service"
7. **Get URL**: Copy your Render URL (e.g., `https://frontdesk-ai-backend.onrender.com`)

### 2️⃣ DEPLOY FRONTEND TO VERCEL

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Import Project**: Select your GitHub repo
4. **Configure**:

   - **Framework**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Set Environment Variables**:

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-render-backend-url.onrender.com
```

6. **Deploy**: Click "Deploy"
7. **Get URL**: Copy your Vercel URL (e.g., `https://frontdesk-ai-supervisor.vercel.app`)

### 3️⃣ UPDATE CORS SETTINGS

After getting both URLs, update the backend CORS settings on Render:

1. **Go to Render Dashboard**
2. **Edit Environment Variables**
3. **Update FRONTEND_URL**: `https://your-vercel-url.vercel.app`
4. **Redeploy Backend**

## 🎯 FINAL URLS

After deployment, you'll have:

- **Frontend**: `https://frontdesk-ai-supervisor.vercel.app`
- **Backend**: `https://frontdesk-ai-backend.onrender.com`

## 🧪 TEST DEPLOYMENT

1. **Open Frontend URL**
2. **Go to Voice Simulator**
3. **Enable Voice Mode**
4. **Test Voice Conversation**
5. **Test Admin Panel**

## ⚠️ IMPORTANT NOTES

### Free Tier Limitations:

- **Render Free**: Sleeps after 15min inactivity (30sec wake-up)
- **Vercel Free**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage limit

### Production Considerations:

- **Render**: Upgrade to paid plan for 24/7 uptime
- **HTTPS Required**: For voice features to work properly
- **API Costs**: Monitor OpenAI/LiveKit usage

## 🚀 DEPLOYMENT STATUS

✅ **Ready for Production Deployment**
✅ **All APIs Configured**
✅ **Voice Features Working**
✅ **Real-time Updates Enabled**

Your AI Supervisor will be live and accessible worldwide! 🌍

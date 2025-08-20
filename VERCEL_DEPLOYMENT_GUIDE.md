# Deploy Your Wordle Game to Vercel

Your project is now ready for Vercel deployment! Here's how to deploy it:

## Prerequisites
1. A [Vercel account](https://vercel.com) (free)
2. Your Gemini API key from [Google AI Studio](https://ai.google.dev/)

## Deployment Steps

### 1. Connect Your Repository
- Push your code to GitHub, GitLab, or Bitbucket
- Go to [vercel.com](https://vercel.com) and sign in
- Click "New Project" and import your repository

### 2. Configure Environment Variables
In your Vercel project dashboard, go to Settings → Environment Variables and add:

- `GEMINI_API_KEY` = Your Google Gemini API key
- `DATABASE_URL` = Your PostgreSQL database URL (Neon recommended)

### 3. Deploy
- Vercel will automatically detect your configuration from `vercel.json`
- Click "Deploy" and wait for the build to complete
- Your Wordle game will be live at `https://your-project.vercel.app`

## Database Setup

### Option 1: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new database
3. Copy the connection string to your Vercel environment variables as `DATABASE_URL`

### Option 2: Vercel Postgres
1. In your Vercel project, go to Storage → Create Database
2. Choose Postgres and create it
3. The `DATABASE_URL` will be automatically added to your environment variables

## What's Included in Your Deployment

✅ **Frontend**: React app with Vite build  
✅ **API Routes**: All your game endpoints as Vercel functions  
✅ **Database**: PostgreSQL support via Neon or Vercel Postgres  
✅ **AI Integration**: Google Gemini for word generation  

## API Endpoints Available
- `/api/daily-word` - Get today's word
- `/api/validate-word` - Validate player guesses
- `/api/users` - Create user accounts
- `/api/users/[username]` - Get user info
- `/api/generate-username` - Generate AI usernames
- `/api/game-stats` - Submit game results
- `/api/leaderboard` - Get leaderboard
- `/api/users/[userId]/stats` - Get user statistics
- `/api/users/[userId]/completed-today` - Check daily completion
- `/api/today-top-patterns/[date]` - Get top player patterns
- `/api/generate-word` - Manual word generation

## Next Steps After Deployment

1. **Test your deployment** - Make sure all features work
2. **Set up your database** - Run migrations if needed
3. **Monitor usage** - Check Vercel analytics
4. **Custom domain** (optional) - Add your own domain in Vercel settings

Your Wordle game is ready for the world! 🎯
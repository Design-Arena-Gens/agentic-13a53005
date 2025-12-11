# YouTube Upload Agent

An automated YouTube video uploader with AI-powered SEO optimization.

## Features

- 🎥 Upload videos directly or via URL
- 🤖 Automatic SEO optimization (title, description, tags, hashtags)
- 🎨 AI-generated thumbnail prompts
- 📅 Schedule publishing
- 💰 Monetization support
- 🌍 Multi-language support
- 🔐 Secure Google OAuth authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your credentials:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://agentic-13a53005.vercel.app
```

3. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://agentic-13a53005.vercel.app/api/auth/callback/google`
   - Add scopes: `youtube.upload` and `youtube`

## Usage

1. Sign in with your Google account
2. Upload a video file or provide a video URL
3. Select category, language, and monetization preferences
4. Optionally schedule publishing time
5. Click "Upload to YouTube"
6. Get automatic SEO-optimized metadata and upload summary

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { google } from 'googleapis'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  },
}

const generateSEOContent = async (category: string, language: string, videoTitle?: string) => {
  const categoryKeywords: Record<string, string[]> = {
    tech: ['technology', 'software', 'tutorial', 'review', 'guide', 'tips', 'tricks'],
    vlog: ['vlog', 'daily', 'life', 'lifestyle', 'day in the life', 'routine'],
    shorts: ['shorts', 'short', 'quick', 'viral', 'trending', 'funny'],
    gaming: ['gaming', 'gameplay', 'walkthrough', 'guide', 'tips', 'stream', 'playthrough'],
    tutorial: ['tutorial', 'how to', 'guide', 'step by step', 'learn', 'tips', 'beginner'],
  }

  const keywords = categoryKeywords[category] || ['video', 'content', 'entertainment']
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]

  const titles: Record<string, string[]> = {
    tech: [
      '🚀 Ultimate Tech Review: Game-Changing Features Revealed',
      '💡 Tech Tutorial: Master This in 10 Minutes',
      '⚡ Tech Tips & Tricks You NEED to Know in 2024',
      '🔥 Complete Tech Guide: Everything You Need',
      '✨ Revolutionary Tech: Full Review & Demo',
    ],
    vlog: [
      '📸 Day in My Life: You Won\'t Believe What Happened',
      '🌟 My Daily Routine: Behind the Scenes',
      '💫 Life Update: Exciting News & Changes',
      '🎬 Real Life Vlog: Unfiltered & Authentic',
      '✨ A Day With Me: Morning to Night Routine',
    ],
    shorts: [
      '😂 Hilarious Moment Caught on Camera',
      '🔥 Mind-Blowing 60 Second Challenge',
      '💥 Viral Trend: We Tried It & Here\'s What Happened',
      '⚡ Quick Tips That Actually Work',
      '🎯 Watch This Before Scrolling Away',
    ],
    gaming: [
      '🎮 Epic Gaming Moments: Unbelievable Gameplay',
      '🏆 Pro Gamer Tips: Level Up Your Skills',
      '🔥 Complete Gaming Walkthrough: All Secrets Revealed',
      '⚔️ Ultimate Gaming Guide: Win Every Match',
      '💎 Hidden Gaming Secrets & Easter Eggs',
    ],
    tutorial: [
      '📚 Complete Tutorial: Beginner to Pro in Minutes',
      '🎓 Step-by-Step Guide: Easy to Follow',
      '✅ How To Tutorial: Anyone Can Do This',
      '🔧 Ultimate Guide: Master This Skill Today',
      '💡 Quick Tutorial: Learn the Easy Way',
    ],
  }

  const categoryTitles = titles[category] || titles.tech
  const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)]

  const hashtags = `#${category} #${randomKeyword} #viral #trending #${language === 'en' ? 'youtube' : language}`

  const description = `🎯 Welcome to this ${category} content!

In this video, we'll explore ${randomKeyword} and provide you with valuable insights and information.

⭐ Key Highlights:
• Comprehensive ${category} content
• Expert tips and techniques
• Everything you need to know about ${randomKeyword}

🔔 Subscribe for more ${category} content!
👍 Like if you found this helpful!
💬 Comment your thoughts below!

${hashtags}

📱 Connect with us:
• Like & Subscribe for more content
• Turn on notifications 🔔
• Share with friends who'd love this

Tags: ${keywords.join(', ')}, ${category}, content, tutorial, guide, tips, tricks, 2024, best, ultimate, complete

Thank you for watching! ❤️`

  const tags = [...keywords, category, 'viral', 'trending', '2024', 'tutorial', 'guide', 'tips']

  const thumbnailPrompt = `Create an eye-catching YouTube thumbnail with bold text "${title.slice(0, 40)}", vibrant colors (red, yellow, blue), high contrast, professional look, ${category} theme, engaging visuals, 1280x720px`

  return {
    title: title.slice(0, 70),
    description,
    tags: tags.slice(0, 15),
    hashtags,
    thumbnailPrompt,
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, {
      providers: [],
    })

    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const form = formidable({
      maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
      uploadDir: '/tmp',
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)

    const category = fields.category?.[0] || 'tech'
    const language = fields.language?.[0] || 'en'
    const monetization = fields.monetization?.[0] === 'true'
    const scheduleTime = fields.scheduleTime?.[0]
    const videoLink = fields.videoLink?.[0]

    const seoContent = await generateSEOContent(category, language)

    let videoPath: string | null = null
    let shouldDeleteFile = false

    if (files.video?.[0]) {
      videoPath = files.video[0].filepath
      shouldDeleteFile = true
    } else if (videoLink) {
      const tempPath = path.join('/tmp', `download-${Date.now()}.mp4`)
      const response = await axios({
        method: 'get',
        url: videoLink,
        responseType: 'stream',
      })

      const writer = fs.createWriteStream(tempPath)
      response.data.pipe(writer)

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })

      videoPath = tempPath
      shouldDeleteFile = true
    }

    if (!videoPath) {
      return res.status(400).json({ error: 'No video provided' })
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: session.accessToken })

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    })

    const videoSize = fs.statSync(videoPath).size

    const privacyStatus = scheduleTime ? 'private' : 'public'
    const publishAt = scheduleTime ? new Date(scheduleTime).toISOString() : undefined

    const videoResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: seoContent.title,
          description: seoContent.description,
          tags: seoContent.tags,
          categoryId: '22', // People & Blogs, adjust based on category
        },
        status: {
          privacyStatus,
          publishAt,
          selfDeclaredMadeForKids: false,
          ...(monetization && { madeForKids: false }),
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    })

    if (shouldDeleteFile) {
      fs.unlinkSync(videoPath)
    }

    return res.status(200).json({
      success: true,
      videoId: videoResponse.data.id,
      title: seoContent.title,
      description: seoContent.description,
      tags: seoContent.tags,
      hashtags: seoContent.hashtags,
      thumbnailPrompt: seoContent.thumbnailPrompt,
      scheduledTime: scheduleTime,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return res.status(500).json({
      error: error.message || 'Upload failed',
      details: error.response?.data || error,
    })
  }
}

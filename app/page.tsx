'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoLink, setVideoLink] = useState('')
  const [category, setCategory] = useState('tech')
  const [language, setLanguage] = useState('en')
  const [monetization, setMonetization] = useState(true)
  const [scheduleTime, setScheduleTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      if (videoFile) {
        formData.append('video', videoFile)
      } else if (videoLink) {
        formData.append('videoLink', videoLink)
      }
      formData.append('category', category)
      formData.append('language', language)
      formData.append('monetization', String(monetization))
      if (scheduleTime) {
        formData.append('scheduleTime', scheduleTime)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">YouTube Upload Agent</h1>
            </div>
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Sign in with Google
              </button>
            )}
          </div>

          {!session ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-6">
                Sign in with your Google account to start uploading videos to YouTube
              </p>
              <button
                onClick={() => signIn('google')}
                className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-lg shadow-lg"
              >
                Connect YouTube Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-500 transition">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    setVideoFile(e.target.files?.[0] || null)
                    setVideoLink('')
                  }}
                  className="hidden"
                  id="videoFile"
                />
                <label htmlFor="videoFile" className="cursor-pointer">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {videoFile ? videoFile.name : 'Click to upload video'}
                  </p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                </label>
              </div>

              <div className="text-center text-gray-500 font-semibold">OR</div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video Link (YouTube, Vimeo, etc.)
                </label>
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => {
                    setVideoLink(e.target.value)
                    setVideoFile(null)
                  }}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="tech">Tech</option>
                    <option value="vlog">Vlog</option>
                    <option value="shorts">Shorts</option>
                    <option value="gaming">Gaming</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monetization}
                    onChange={(e) => setMonetization(e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Enable Monetization
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Schedule Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!videoFile && !videoLink)}
                className="w-full py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold text-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing Upload...
                  </span>
                ) : (
                  '🚀 Upload to YouTube'
                )}
              </button>
            </form>
          )}

          {result && (
            <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">✅ Upload Summary</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Video Title:</h3>
                  <p className="text-gray-900">{result.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Description:</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{result.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Hashtags:</h3>
                  <p className="text-gray-900">{result.hashtags}</p>
                </div>

                {result.thumbnailPrompt && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Thumbnail Prompt:</h3>
                    <p className="text-gray-900 italic">{result.thumbnailPrompt}</p>
                  </div>
                )}

                {result.scheduledTime && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Scheduled Publish:</h3>
                    <p className="text-gray-900">{new Date(result.scheduledTime).toLocaleString()}</p>
                  </div>
                )}

                {result.videoId && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Video URL:</h3>
                    <a
                      href={`https://www.youtube.com/watch?v=${result.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 underline"
                    >
                      https://www.youtube.com/watch?v={result.videoId}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

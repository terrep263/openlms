'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [setupKey, setSetupKey] = useState('setup-demo-data')

  const checkStatus = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/setup/seed')
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const seedDatabase = async () => {
    if (!confirm('This will create demo data in your database. Continue?')) {
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/setup/seed', {
        method: 'POST',
        headers: {
          'x-setup-key': setupKey,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to seed database')
        return
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-gray-900">
            🚀 Database Setup
          </h1>
          <p className="mt-2 text-gray-600">
            Initialize your OpenLMS database with demo data
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Setup Key
              </label>
              <input
                type="text"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="setup-demo-data"
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: setup-demo-data (or set SETUP_SECRET_KEY env var)
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={checkStatus}
                disabled={loading}
                className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>

              <button
                onClick={seedDatabase}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Seeding...' : 'Seed Database'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">
                {result.success ? '✅ Success!' : 'ℹ️ Status'}
              </h3>
              <p className="mt-1 text-sm text-green-700">{result.message}</p>

              {result.credentials && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-white p-4">
                    <h4 className="font-semibold text-gray-900">
                      👨‍💼 Admin Access
                    </h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        <code className="rounded bg-gray-100 px-2 py-1">
                          {result.credentials.admin.email}
                        </code>
                      </p>
                      <p>
                        <span className="font-medium">Password:</span>{' '}
                        <code className="rounded bg-gray-100 px-2 py-1">
                          {result.credentials.admin.password}
                        </code>
                      </p>
                      <p>
                        <span className="font-medium">Dashboard:</span>{' '}
                        <a
                          href={result.credentials.admin.dashboardUrl}
                          className="text-indigo-600 hover:underline"
                        >
                          {result.credentials.admin.dashboardUrl}
                        </a>
                      </p>
                    </div>
                    <a
                      href="/login"
                      className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Login as Admin
                    </a>
                  </div>

                  <div className="rounded-lg bg-white p-4">
                    <h4 className="font-semibold text-gray-900">
                      👨‍🎓 Student Access
                    </h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        <code className="rounded bg-gray-100 px-2 py-1">
                          {result.credentials.student.email}
                        </code>
                      </p>
                      <p>
                        <span className="font-medium">Password:</span>{' '}
                        <code className="rounded bg-gray-100 px-2 py-1">
                          {result.credentials.student.password}
                        </code>
                      </p>
                      <p>
                        <span className="font-medium">School:</span>{' '}
                        <a
                          href={result.credentials.student.schoolUrl}
                          className="text-indigo-600 hover:underline"
                        >
                          {result.credentials.student.schoolUrl}
                        </a>
                      </p>
                    </div>
                    <a
                      href="/school/demo-school"
                      className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Visit School
                    </a>
                  </div>
                </div>
              )}

              {result.data && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-green-900">
                    View Details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-gray-900 p-3 text-xs text-green-400">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">📝 What This Does</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• Creates a demo tenant: "Demo School" (slug: demo-school)</li>
              <li>• Creates admin user: admin@demo-school.com</li>
              <li>• Creates student user: student@demo-school.com</li>
              <li>• Creates 3 sample courses (free, paid, draft)</li>
              <li>• Enrolls student in free course</li>
            </ul>
          </div>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900">⚠️ Important</h3>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700">
              <li>• Make sure DATABASE_URL is set in Vercel env vars</li>
              <li>• This creates demo data - safe to run multiple times</li>
              <li>• For production, disable this endpoint or use strong setup key</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

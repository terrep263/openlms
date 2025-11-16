'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CoursePlayerProps {
  course: {
    id: string
    title: string
    description: string | null
    embedUrl: string | null
  }
  enrollment: {
    id: string
    status: string
    completedAt: Date | null
  }
  tenantSlug: string
}

export default function CoursePlayer({ course, enrollment, tenantSlug }: CoursePlayerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(enrollment.status)

  useEffect(() => {
    // Update progress on first access
    if (enrollment.status === 'NOT_STARTED') {
      updateProgress('IN_PROGRESS')
    }

    // Update last accessed time
    fetch('/api/enrollments/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId: enrollment.id }),
    })
  }, [enrollment.id, enrollment.status])

  const updateProgress = async (status: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/enrollments/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          status,
        }),
      })

      if (response.ok) {
        setProgress(status)
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = () => {
    if (confirm('Mark this course as completed?')) {
      updateProgress('COMPLETED')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          {course.description && (
            <p className="mt-2 text-gray-600">{course.description}</p>
          )}
        </div>
        {progress === 'COMPLETED' ? (
          <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-800">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">Completed</span>
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={loading}
            className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Mark Complete'}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>
            {progress === 'NOT_STARTED'
              ? '0%'
              : progress === 'IN_PROGRESS'
              ? '50%'
              : '100%'}
          </span>
        </div>
        <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{
              width:
                progress === 'NOT_STARTED'
                  ? '0%'
                  : progress === 'IN_PROGRESS'
                  ? '50%'
                  : '100%',
            }}
          />
        </div>
      </div>

      {/* Course Content */}
      {course.embedUrl ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <iframe
            src={course.embedUrl}
            className="h-[600px] w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">No content available for this course yet.</p>
        </div>
      )}
    </div>
  )
}

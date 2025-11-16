'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/utils/slug'

interface CourseFormProps {
  tenantSlug: string
  course?: {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnailUrl: string | null
    embedUrl: string | null
    accessType: string
    priceCents: number | null
    currency: string
    status: string
    visibility: string
  }
}

export default function CourseForm({ tenantSlug, course }: CourseFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: course?.title || '',
    slug: course?.slug || '',
    description: course?.description || '',
    thumbnailUrl: course?.thumbnailUrl || '',
    embedUrl: course?.embedUrl || '',
    accessType: course?.accessType || 'FREE',
    priceCents: course?.priceCents ? course.priceCents / 100 : 0,
    currency: course?.currency || 'usd',
    status: course?.status || 'DRAFT',
    visibility: course?.visibility || 'PRIVATE',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: course ? formData.slug : generateSlug(value),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        priceCents: Math.round(formData.priceCents * 100),
        ...(course && { courseId: course.id }),
      }

      const response = await fetch('/api/courses', {
        method: course ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save course')
        setLoading(false)
        return
      }

      router.push(`/t/${tenantSlug}/courses`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Course Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Introduction to Web Development"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            URL Slug *
          </label>
          <input
            id="slug"
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="intro-to-web-dev"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Course description..."
          />
        </div>

        <div>
          <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">
            Thumbnail URL
          </label>
          <input
            id="thumbnailUrl"
            type="url"
            value={formData.thumbnailUrl}
            onChange={(e) =>
              setFormData({ ...formData, thumbnailUrl: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label htmlFor="embedUrl" className="block text-sm font-medium text-gray-700">
            Embed URL (Video/Content)
          </label>
          <input
            id="embedUrl"
            type="url"
            value={formData.embedUrl}
            onChange={(e) =>
              setFormData({ ...formData, embedUrl: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://youtube.com/embed/..."
          />
        </div>

        <div>
          <label htmlFor="accessType" className="block text-sm font-medium text-gray-700">
            Access Type *
          </label>
          <select
            id="accessType"
            required
            value={formData.accessType}
            onChange={(e) =>
              setFormData({ ...formData, accessType: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {formData.accessType === 'PAID' && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (USD) *
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              required={formData.accessType === 'PAID'}
              value={formData.priceCents}
              onChange={(e) =>
                setFormData({ ...formData, priceCents: parseFloat(e.target.value) })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="29.99"
            />
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            id="status"
            required
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
            Visibility *
          </label>
          <select
            id="visibility"
            required
            value={formData.visibility}
            onChange={(e) =>
              setFormData({ ...formData, visibility: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

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
    thumbnail: string | null
    price: number
    status: string
    featured: boolean
  }
}

export default function CourseForm({ tenantSlug, course }: CourseFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: course?.title || '',
    slug: course?.slug || '',
    description: course?.description || '',
    thumbnail: course?.thumbnail || '',
    price: course?.price || 0,
    status: course?.status || 'DRAFT',
    featured: course?.featured || false,
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

        <div className="md:col-span-2">
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
            Thumbnail URL
          </label>
          <input
            id="thumbnail"
            type="url"
            value={formData.thumbnail}
            onChange={(e) =>
              setFormData({ ...formData, thumbnail: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="0.00"
          />
          <p className="mt-1 text-sm text-gray-500">Set to 0 for free courses</p>
        </div>

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
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Featured Course
            </span>
          </label>
          <p className="mt-1 ml-6 text-sm text-gray-500">
            Featured courses appear prominently on the homepage
          </p>
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

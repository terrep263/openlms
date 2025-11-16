'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteCourseButton({
  courseId,
  courseName,
  tenantSlug,
}: {
  courseId: string
  courseName: string
  tenantSlug: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${courseName}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete course')
      }
    } catch (error) {
      alert('Failed to delete course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}

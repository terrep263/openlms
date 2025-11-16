import { getTenantBySlug } from '@/lib/access-control'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import CoursePlayer from '@/components/CoursePlayer'
import PurchaseButton from '@/components/PurchaseButton'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; courseSlug: string }>
}) {
  const { tenantSlug, courseSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  const session = await getSession()

  const course = await prisma.course.findFirst({
    where: {
      tenantId: tenant.id,
      slug: courseSlug,
    },
  })

  if (!course) {
    notFound()
  }

  // Check if course is accessible
  if (course.status !== 'PUBLISHED') {
    // Only allow tenant admins to view
    if (!session || session.tenantId !== tenant.id || session.role !== 'TENANT_ADMIN') {
      notFound()
    }
  }

  // Check if user is logged in
  if (!session) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-64 w-full object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            {course.description && (
              <p className="mt-4 text-gray-600">{course.description}</p>
            )}
            <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-6 text-center">
              <p className="text-lg font-semibold text-gray-900">
                Please log in to access this course
              </p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <a
                  href="/login"
                  className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is enrolled
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.userId,
        courseId: course.id,
      },
    },
  })

  const isFree = Number(course.price) === 0

  // Auto-enroll in free courses
  if (!enrollment && isFree) {
    enrollment = await prisma.enrollment.create({
      data: {
        userId: session.userId,
        courseId: course.id,
        tenantId: tenant.id,
        status: 'NOT_STARTED',
      },
    })
  }

  // If not enrolled and course is paid, show purchase page
  if (!enrollment && !isFree) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-64 w-full object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            {course.description && (
              <p className="mt-4 text-gray-600">{course.description}</p>
            )}
            <div className="mt-8 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-8 text-center">
              <p className="text-4xl font-bold text-gray-900">
                ${Number(course.price).toFixed(2)}
              </p>
              <p className="mt-2 text-gray-600">One-time payment for lifetime access</p>
              <div className="mt-6">
                <PurchaseButton
                  courseId={course.id}
                  courseName={course.title}
                  tenantSlug={tenant.slug}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User is enrolled - show course player
  if (enrollment) {
    return (
      <CoursePlayer
        course={course}
        enrollment={enrollment}
        tenantSlug={tenant.slug}
      />
    )
  }

  notFound()
}

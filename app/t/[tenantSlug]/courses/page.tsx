import Link from 'next/link'
import { validateTenantAdmin } from '@/lib/access-control'
import { prisma } from '@/lib/prisma'
import DeleteCourseButton from '@/components/DeleteCourseButton'

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant } = await validateTenantAdmin(tenantSlug)

  const courses = await prisma.course.findMany({
    where: { tenantId: tenant.id },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">
            Manage your courses and content
          </p>
        </div>
        <Link
          href={`/t/${tenant.slug}/courses/new`}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
            📚
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No courses yet
          </h3>
          <p className="mt-2 text-gray-600">
            Get started by creating your first course
          </p>
          <Link
            href={`/t/${tenant.slug}/courses/new`}
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {course.title}
                    </div>
                    <div className="text-sm text-gray-500">{course.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        course.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(course.price) > 0
                      ? `$${Number(course.price).toFixed(2)}`
                      : 'Free'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course._count.enrollments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/t/${tenant.slug}/courses/${course.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <DeleteCourseButton
                        courseId={course.id}
                        courseName={course.title}
                        tenantSlug={tenant.slug}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

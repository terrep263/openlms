import Link from 'next/link'
import { getTenantBySlug } from '@/lib/access-control'
import { prisma } from '@/lib/prisma'

export default async function SchoolCatalogPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)

  const courses = await prisma.course.findMany({
    where: {
      tenantId: tenant.id,
      status: 'PUBLISHED',
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">{tenant.name}</h1>
        <p className="mt-2 text-lg text-gray-600">
          Browse our course catalog
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
            📚
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No courses available yet
          </h3>
          <p className="mt-2 text-gray-600">
            Check back soon for new courses
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/school/${tenant.slug}/courses/${course.slug}`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-6xl">
                  📚
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {course.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-600">
                    {Number(course.price) > 0
                      ? `$${Number(course.price).toFixed(2)}`
                      : 'Free'}
                  </span>
                  <span className="text-sm text-indigo-600 group-hover:underline">
                    View Course →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

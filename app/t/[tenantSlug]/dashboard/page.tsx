import { validateTenantAdmin } from '@/lib/access-control'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils/format'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant } = await validateTenantAdmin(tenantSlug)

  // Get metrics
  const [
    totalLearners,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    thisMonthEnrollments,
    totalRevenue,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count({
      where: { tenantId: tenant.id, role: 'LEARNER' },
    }),
    prisma.course.count({
      where: { tenantId: tenant.id },
    }),
    prisma.course.count({
      where: { tenantId: tenant.id, status: 'PUBLISHED' },
    }),
    prisma.enrollment.count({
      where: { tenantId: tenant.id },
    }),
    prisma.enrollment.count({
      where: {
        tenantId: tenant.id,
        enrolledAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.order.aggregate({
      where: { tenantId: tenant.id, status: 'COMPLETED' },
      _sum: { amountCents: true },
    }),
    prisma.enrollment.findMany({
      where: { tenantId: tenant.id },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 10,
    }),
  ])

  const stats = [
    {
      name: 'Active Learners',
      value: totalLearners,
      icon: '👥',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Total Courses',
      value: `${publishedCourses}/${totalCourses}`,
      description: 'Published / Total',
      icon: '📚',
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Enrollments',
      value: totalEnrollments,
      description: `${thisMonthEnrollments} this month`,
      icon: '📈',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(totalRevenue._sum.amountCents || 0),
      icon: '💰',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your school&apos;s performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
                )}
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enrollments */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900">Recent Enrollments</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No enrollments yet
                  </td>
                </tr>
              ) : (
                recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {enrollment.course.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          enrollment.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : enrollment.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {enrollment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(enrollment.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

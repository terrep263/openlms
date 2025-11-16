import { validateTenantAdmin } from '@/lib/access-control'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils/format'

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant } = await validateTenantAdmin(tenantSlug)

  // Get course completion and revenue data
  const courses = await prisma.course.findMany({
    where: { tenantId: tenant.id },
    include: {
      enrollments: {
        select: {
          status: true,
        },
      },
      orders: {
        where: { status: 'PAID' },
        select: {
          amountCents: true,
        },
      },
    },
  })

  const reportData = courses.map((course) => {
    const totalEnrollments = course.enrollments.length
    const completedEnrollments = course.enrollments.filter(
      (e) => e.status === 'COMPLETED'
    ).length
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0

    const revenue = course.orders.reduce(
      (sum, order) => sum + order.amountCents,
      0
    )

    return {
      id: course.id,
      title: course.title,
      totalEnrollments,
      completedEnrollments,
      completionRate,
      revenue,
    }
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">
          Course completion and revenue analytics
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Enrollments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Completion Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {reportData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No course data available
                </td>
              </tr>
            ) : (
              reportData.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {row.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.totalEnrollments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.completedEnrollments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 text-sm text-gray-900">
                        {row.completionRate}%
                      </div>
                      <div className="ml-2 w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${row.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

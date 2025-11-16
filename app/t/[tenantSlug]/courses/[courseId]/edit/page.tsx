import { validateTenantAdmin } from '@/lib/access-control'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CourseForm from '@/components/CourseForm'

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; courseId: string }>
}) {
  const { tenantSlug, courseId } = await params
  const { tenant } = await validateTenantAdmin(tenantSlug)

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      tenantId: tenant.id,
    },
  })

  if (!course) {
    notFound()
  }

  // Convert Decimal to number for the form
  const courseData = {
    ...course,
    price: Number(course.price),
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
        <p className="mt-2 text-gray-600">Update course details</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <CourseForm tenantSlug={tenantSlug} course={courseData} />
      </div>
    </div>
  )
}

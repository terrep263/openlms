import { validateTenantAdmin } from '@/lib/access-control'
import CourseForm from '@/components/CourseForm'

export default async function NewCoursePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  await validateTenantAdmin(tenantSlug)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
        <p className="mt-2 text-gray-600">Add a new course to your school</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <CourseForm tenantSlug={tenantSlug} />
      </div>
    </div>
  )
}

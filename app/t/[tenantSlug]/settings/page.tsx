import { validateTenantAdmin } from '@/lib/access-control'
import Link from 'next/link'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant } = await validateTenantAdmin(tenantSlug)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your school settings</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href={`/t/${tenant.slug}/settings/payments`}
          className="group rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-2xl">
            💳
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
            Payment Settings
          </h3>
          <p className="mt-2 text-gray-600">
            Connect Stripe to accept payments from learners
          </p>
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6 opacity-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 text-2xl">
            🎨
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Branding
          </h3>
          <p className="mt-2 text-gray-600">
            Customize logo, colors, and domain (Coming soon)
          </p>
        </div>
      </div>
    </div>
  )
}

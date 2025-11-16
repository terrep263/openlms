import { validateTenantAdmin } from '@/lib/access-control'

export default async function BillingPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant } = await validateTenantAdmin(tenantSlug)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <p className="mt-2 text-gray-600">Manage your subscription and billing</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{tenant.plan}</span>
            <span className="text-gray-600">
              {tenant.plan === 'STARTER'
                ? '$29/month'
                : tenant.plan === 'PRO'
                ? '$99/month'
                : '$299/month'}
            </span>
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                tenant.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {tenant.status === 'ACTIVE' ? 'Active' : 'Suspended'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <h2 className="text-xl font-semibold text-gray-900">Manage Billing</h2>
          <p className="mt-2 text-gray-600">
            Update your payment method, view invoices, and manage your subscription
          </p>
          <div className="mt-6">
            <form action="/api/stripe/create-portal-session" method="POST">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                Manage Subscription
              </button>
            </form>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            You will be redirected to Stripe&apos;s secure billing portal
          </p>
        </div>

        {tenant.status === 'SUSPENDED' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-900">
              Subscription Suspended
            </h3>
            <p className="mt-2 text-red-700">
              Your subscription is currently suspended. Please update your billing information
              to restore access to all features.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

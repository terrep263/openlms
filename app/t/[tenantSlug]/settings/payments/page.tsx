import { validateTenantAdmin } from '@/lib/access-control'
import ConnectStripeButton from '@/components/ConnectStripeButton'

export default async function PaymentsSettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant } = await validateTenantAdmin(tenantSlug)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        <p className="mt-2 text-gray-600">
          Connect your Stripe account to receive payments from learners
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        {tenant.stripeConnectAccountId ? (
          <div>
            <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
              <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold text-green-900">Stripe Connected</p>
                <p className="text-sm text-green-700">
                  Account ID: {tenant.stripeConnectAccountId}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-gray-600">
                Your Stripe account is connected. You can now accept payments for paid courses.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                To manage your Stripe account settings, visit your{' '}
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Stripe Dashboard
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Connect with Stripe
              </h3>
              <p className="mt-2 text-gray-600">
                To sell paid courses, you need to connect your Stripe account. This allows you to:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Accept credit card payments from learners
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Receive payouts directly to your bank account
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure payment processing with industry-leading security
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <ConnectStripeButton />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              By connecting Stripe, you agree to Stripe&apos;s{' '}
              <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Connected Account Agreement
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

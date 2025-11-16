import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for individual creators starting out',
      features: [
        'Up to 100 students',
        'Unlimited courses',
        'Basic analytics',
        'Email support',
        'Stripe Connect integration',
        'Your own branding',
      ],
    },
    {
      name: 'Pro',
      price: 99,
      description: 'For growing schools and academies',
      features: [
        'Up to 1,000 students',
        'Unlimited courses',
        'Advanced analytics',
        'Priority support',
        'Stripe Connect integration',
        'Your own branding',
        'Custom domain',
        'Remove platform branding',
      ],
      popular: true,
    },
    {
      name: 'Agency',
      price: 299,
      description: 'For large organizations and agencies',
      features: [
        'Unlimited students',
        'Unlimited courses',
        'Advanced analytics & reports',
        'Dedicated support',
        'Stripe Connect integration',
        'Your own branding',
        'Custom domain',
        'White-label solution',
        'API access',
        'SSO integration',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xl">
                L
              </div>
              <span className="text-xl font-bold text-gray-900">OpenLMS</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl bg-white p-8 shadow-xl ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-lg text-gray-600">/month</span>
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-6 w-6 flex-shrink-0 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 block w-full rounded-lg px-6 py-3 text-center font-semibold ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                }`}
              >
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include unlimited courses and Stripe Connect integration.
            <br />
            No setup fees. Cancel anytime.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 OpenLMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

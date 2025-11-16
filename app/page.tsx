import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xl">
                L
              </div>
              <span className="text-xl font-bold text-gray-900">OpenLMS</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900"
              >
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

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Build Your Own
            <span className="block text-indigo-600">Online School</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Create and sell courses with your own branded learning platform.
            Accept payments, track student progress, and grow your business.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigo-700"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border-2 border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-gray-900 hover:border-gray-400"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Unlimited Courses</h3>
            <p className="mt-2 text-gray-600">
              Create and host unlimited courses with video embeds from YouTube, Vimeo, or any platform.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Accept Payments</h3>
            <p className="mt-2 text-gray-600">
              Get paid directly via Stripe Connect. Set your own prices and keep most of the revenue.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Your Branding</h3>
            <p className="mt-2 text-gray-600">
              Customize with your logo, colors, and domain. Build your brand, not ours.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Student Analytics</h3>
            <p className="mt-2 text-gray-600">
              Track enrollments, completion rates, and revenue across all your courses.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Secure & Reliable</h3>
            <p className="mt-2 text-gray-600">
              Built on modern tech with enterprise-grade security and 99.9% uptime.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Quick Setup</h3>
            <p className="mt-2 text-gray-600">
              Launch your school in minutes. No coding required. Just add your content and go live.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 rounded-3xl bg-indigo-600 px-6 py-16 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white">
            Ready to launch your online school?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join hundreds of educators and creators building their business with OpenLMS.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-indigo-600 shadow-lg hover:bg-gray-100"
          >
            Start Your Free Trial
          </Link>
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

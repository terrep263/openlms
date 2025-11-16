import { ReactNode } from 'react'
import Link from 'next/link'
import { getTenantBySlug } from '@/lib/access-control'
import { getSession } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'

export default async function SchoolLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  const session = await getSession()

  const primaryColor = tenant.primaryColor || '#4F46E5'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href={`/school/${tenant.slug}`} className="flex items-center gap-3">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white text-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">{tenant.name}</span>
            </Link>

            <nav className="flex items-center gap-4">
              {session ? (
                <>
                  <Link
                    href={`/school/${tenant.slug}`}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Browse Courses
                  </Link>
                  <span className="text-sm text-gray-600">
                    Hi, {session.email.split('@')[0]}
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg px-4 py-2 font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <style jsx>{`
        :root {
          --primary-color: ${primaryColor};
        }
      `}</style>
    </div>
  )
}

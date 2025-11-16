import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { validateTenantAdmin } from '@/lib/access-control'
import LogoutButton from '@/components/LogoutButton'

export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  let tenant
  try {
    const result = await validateTenantAdmin(tenantSlug)
    tenant = result.tenant
  } catch (error) {
    redirect('/login')
  }

  const primaryColor = tenant.primaryColor || '#4F46E5' // Default indigo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
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
            <div>
              <h1 className="font-semibold text-gray-900">{tenant.name}</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/school/${tenant.slug}`}
              target="_blank"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View School
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-white min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            <NavLink href={`/t/${tenant.slug}/dashboard`} icon="📊">
              Dashboard
            </NavLink>
            <NavLink href={`/t/${tenant.slug}/courses`} icon="📚">
              Courses
            </NavLink>
            <NavLink href={`/t/${tenant.slug}/learners`} icon="👥">
              Learners
            </NavLink>
            <NavLink href={`/t/${tenant.slug}/reports`} icon="📈">
              Reports
            </NavLink>

            <div className="pt-4 mt-4 border-t">
              <NavLink href={`/t/${tenant.slug}/settings`} icon="⚙️">
                Settings
              </NavLink>
              <NavLink href={`/t/${tenant.slug}/settings/payments`} icon="💳">
                Payments
              </NavLink>
              <NavLink href={`/t/${tenant.slug}/billing`} icon="💰">
                Billing
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>

      <style jsx>{`
        :root {
          --primary-color: ${primaryColor};
        }
      `}</style>
    </div>
  )
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  )
}

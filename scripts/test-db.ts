// Quick database connection test
// Run: DATABASE_URL="your-url" npx tsx scripts/test-db.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Count users
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)

    // Count tenants
    const tenantCount = await prisma.tenant.count()
    console.log(`🏢 Tenants in database: ${tenantCount}`)

    // Check for demo admin
    const demoAdmin = await prisma.user.findFirst({
      where: { email: 'admin@demo-school.com' },
      include: { tenant: true }
    })

    if (demoAdmin) {
      console.log('✅ Demo admin exists!')
      console.log(`   Email: ${demoAdmin.email}`)
      console.log(`   Tenant: ${demoAdmin.tenant.name} (${demoAdmin.tenant.slug})`)
    } else {
      console.log('❌ Demo admin NOT found - database needs seeding')
      console.log('   Run: npm run db:seed')
    }

  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    console.log('\nPossible issues:')
    console.log('1. DATABASE_URL not set or incorrect')
    console.log('2. Database doesn\'t exist')
    console.log('3. Network/firewall blocking connection')
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

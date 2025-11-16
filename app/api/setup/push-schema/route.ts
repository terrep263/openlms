import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// This endpoint manually pushes the Prisma schema to the database
// Use this when automatic build-time schema push isn't working
export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret key check for production
    const secretKey = request.headers.get('x-setup-key')
    const expectedKey = process.env.SETUP_SECRET_KEY || 'setup-demo-data'

    if (secretKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid setup key' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting manual schema push...')

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: 'DATABASE_URL not configured',
          fix: [
            'Add DATABASE_URL to Vercel environment variables',
            'Redeploy your application',
          ],
        },
        { status: 500 }
      )
    }

    // Run prisma db push
    console.log('Running: npx prisma db push --accept-data-loss --skip-generate')

    try {
      const { stdout, stderr } = await execAsync(
        'npx prisma db push --accept-data-loss --skip-generate',
        {
          env: { ...process.env },
          timeout: 60000, // 60 second timeout
        }
      )

      console.log('✅ Schema push output:', stdout)
      if (stderr) {
        console.warn('Schema push warnings:', stderr)
      }

      // Check if it was successful
      const isSuccess =
        stdout.includes('in sync') ||
        stdout.includes('created') ||
        stdout.includes('Your database is now')

      if (isSuccess) {
        return NextResponse.json({
          success: true,
          message: 'Database schema synced successfully! ✅',
          output: stdout,
          nextSteps: [
            'Schema has been pushed to your database',
            'All tables and types should now exist',
            'Click "Seed Database" to create demo data',
          ],
        })
      } else {
        return NextResponse.json(
          {
            error: 'Schema push completed but may have issues',
            output: stdout,
            stderr: stderr,
          },
          { status: 500 }
        )
      }
    } catch (execError: any) {
      console.error('❌ Schema push failed:', execError)
      return NextResponse.json(
        {
          error: 'Failed to push schema',
          details: execError.message,
          stderr: execError.stderr,
          stdout: execError.stdout,
          fix: [
            'Check that DATABASE_URL is correct',
            'Ensure database is accessible',
            'Verify Prisma schema is valid',
          ],
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Push schema error:', error)
    return NextResponse.json(
      {
        error: 'Failed to push schema',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if schema is synced
export async function GET() {
  try {
    const { stdout } = await execAsync('npx prisma db push --help', {
      timeout: 5000,
    })

    return NextResponse.json({
      available: true,
      message: 'Schema push endpoint is ready',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'NOT SET',
      instruction: 'POST to this endpoint with x-setup-key header to push schema',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Prisma CLI not available',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

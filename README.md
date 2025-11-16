# OpenLMS - Multi-Tenant SaaS Learning Management System

A production-ready, multi-tenant LMS built with Next.js 14, TypeScript, Prisma, and Stripe. Each tenant gets their own branded school where they can create courses, manage learners, and accept payments.

## Features

### ✅ Multi-Tenancy
- **Single Database, Logical Separation**: All tenants share one database with `tenantId` filtering
- **Tenant Isolation**: Every query automatically filters by `tenantId` to prevent data leakage
- **Branded Schools**: Each tenant has custom logo, colors, and unique URL slug

### ✅ Authentication & Authorization
- **JWT-based Auth**: Secure token authentication with `httpOnly` cookies
- **Role-based Access**: `TENANT_ADMIN` and `LEARNER` roles
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: 7-day session expiry

### ✅ Course Management
- **Unlimited Courses**: Create courses with rich metadata
- **Free or Paid**: Set access type and pricing per course
- **Video Embeds**: Support for YouTube, Vimeo, or any embeddable content
- **Draft/Published Status**: Control course visibility
- **Public/Private**: Choose who can see your courses

### ✅ Student Management
- **Add Learners**: Create learner accounts with email/password
- **Track Enrollments**: Monitor student progress across courses
- **Progress Tracking**: NOT_STARTED → IN_PROGRESS → COMPLETED
- **Auto-enroll**: Free courses auto-enroll on access

### ✅ Payment Processing

**Platform Billing** (You charge tenants):
- Stripe customer creation on signup
- Subscription plans: STARTER ($29), PRO ($99), AGENCY ($299)
- Billing portal for subscription management

**Stripe Connect** (Tenants charge learners):
- Stripe Connect onboarding for each tenant
- Paid course checkout with Stripe Checkout
- 10% platform fee on transactions
- Direct payouts to tenant bank accounts

### ✅ Analytics & Reporting
- **Dashboard Metrics**: Learners, courses, enrollments, revenue
- **Course Reports**: Completion rates, enrollment counts
- **Revenue Tracking**: Total revenue per course

### ✅ Course Player
- **Iframe Embed**: Full-screen video player
- **Progress Tracking**: Auto-track first access, last access, completion
- **Mark Complete**: Manual completion button
- **Access Control**: Verify enrollment before showing content

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon Postgres (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Payments**: Stripe + Stripe Connect
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon Postgres database
- Stripe account (for payments)

### 1. Clone and Install

```bash
git clone <your-repo>
cd openlms
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Get after setting up webhook

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Set Up Stripe Webhooks

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook secret (`whsec_...`) to your `.env.local`

## Project Structure

```
openlms/
├── app/
│   ├── api/                    # API routes
│   │   ├── register/           # Tenant + admin user creation
│   │   ├── login/              # Authentication
│   │   ├── logout/             # Session clearing
│   │   ├── courses/            # Course CRUD
│   │   ├── learners/           # Add learners
│   │   ├── enrollments/        # Progress tracking
│   │   └── stripe/             # Payment processing
│   │       ├── webhook/        # Stripe events
│   │       ├── create-checkout/    # Course purchases
│   │       ├── create-portal-session/  # Billing management
│   │       └── connect/        # Stripe Connect onboarding
│   ├── t/[tenantSlug]/         # Tenant admin pages
│   │   ├── dashboard/          # Metrics and overview
│   │   ├── courses/            # Course management
│   │   ├── learners/           # Student management
│   │   ├── reports/            # Analytics
│   │   ├── settings/           # Settings & payments
│   │   └── billing/            # Subscription management
│   ├── school/[tenantSlug]/    # Learner-facing pages
│   │   ├── page.tsx            # Course catalog
│   │   └── courses/[courseSlug]/   # Course detail + player
│   ├── register/               # Tenant signup
│   ├── login/                  # User login
│   ├── pricing/                # Public pricing page
│   └── page.tsx                # Marketing homepage
├── components/                 # Reusable components
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── stripe.ts               # Stripe client
│   ├── auth.ts                 # JWT + bcrypt utilities
│   ├── access-control.ts       # Authorization helpers
│   ├── utils/                  # Formatting, slugs, etc.
│   └── validations/            # Zod schemas
├── prisma/
│   └── schema.prisma           # Database schema
└── .env.local                  # Environment variables
```

## Database Schema

### Models

- **Tenant**: Schools/academies (has logo, slug, Stripe IDs, plan, status)
- **User**: Admins and learners (role: TENANT_ADMIN | LEARNER)
- **Course**: Content with pricing, embeds, visibility
- **Enrollment**: Tracks learner progress per course
- **Order**: Payment records linked to Stripe

### Key Relationships

- One Tenant → Many Users, Courses, Enrollments, Orders
- One User → Many Enrollments, Orders
- One Course → Many Enrollments, Orders
- Unique constraint: User can only enroll once per course

## Usage

### Create Your First School

1. Go to `/register`
2. Enter school name (e.g., "Code Academy")
3. Choose a URL slug (e.g., "code-academy")
4. Create your admin account
5. You'll be redirected to your dashboard at `/t/code-academy/dashboard`

### Set Up Payments

1. Go to **Settings → Payments**
2. Click **"Connect with Stripe"**
3. Complete Stripe onboarding
4. Your `stripeConnectAccountId` is saved

### Create a Course

1. Go to **Courses → Create Course**
2. Enter title, description, embed URL (YouTube, Vimeo, etc.)
3. Choose **Free** or **Paid** (set price if paid)
4. Set status to **Published** and visibility to **Public**
5. Save

### Add Learners

1. Go to **Learners → Add Learner**
2. Enter name, email, password
3. Learner can now login and access courses at `/school/[your-slug]`

### Sell a Course

1. Learner visits `/school/[your-slug]/courses/[course-slug]`
2. Clicks **"Buy Course"**
3. Stripe Checkout opens (powered by your Connect account)
4. After payment, webhook creates enrollment
5. Learner can now access the course player

## API Routes

### Authentication
- `POST /api/register` - Create tenant + admin user
- `POST /api/login` - Authenticate user
- `POST /api/logout` - Clear session

### Courses
- `POST /api/courses` - Create course
- `PUT /api/courses` - Update course (requires `courseId` in body)
- `DELETE /api/courses/[courseId]` - Delete course

### Learners
- `POST /api/learners` - Add learner to tenant

### Enrollments
- `POST /api/enrollments/progress` - Update completion status
- `POST /api/enrollments/access` - Track last accessed time

### Stripe
- `POST /api/stripe/create-checkout` - Create checkout session for course purchase
- `POST /api/stripe/webhook` - Handle Stripe events (checkout completion, payment failures)
- `POST /api/stripe/create-portal-session` - Billing portal for subscription management
- `POST /api/stripe/connect/create-link` - Stripe Connect onboarding
- `GET /api/stripe/connect/callback` - Stripe Connect return URL

## Security

✅ **Tenant Isolation**: Every database query filters by `tenantId`
✅ **Role-based Access**: Admin routes check for `TENANT_ADMIN` role
✅ **Password Hashing**: bcrypt with 10 salt rounds
✅ **JWT Expiry**: 7-day token expiration
✅ **HTTP-Only Cookies**: Tokens not accessible via JavaScript
✅ **Stripe Webhook Validation**: Signature verification on all webhook events

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Set Up Production Webhook

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in Vercel

## Roadmap

Future enhancements:

- 📧 Email notifications (welcome, enrollment, completion)
- 🎓 Certificates on course completion
- 🌐 Multi-language support
- 🔗 Custom domains per tenant
- 📊 Advanced analytics (time spent, video watch percentage)
- 💬 Discussion forums per course
- 📝 Quizzes and assessments
- 🔔 Real-time notifications

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

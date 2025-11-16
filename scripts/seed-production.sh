#!/bin/bash

# Production Database Seeding Script
# This script helps you seed your Vercel/production database

echo "🌱 OpenLMS Production Database Seed Script"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please run this script with your production DATABASE_URL:"
    echo ""
    echo "  DATABASE_URL='your-connection-string' ./scripts/seed-production.sh"
    echo ""
    echo "Or export it first:"
    echo "  export DATABASE_URL='your-connection-string'"
    echo "  ./scripts/seed-production.sh"
    echo ""
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo ""

# Confirm with user
echo "⚠️  WARNING: This will add demo data to your database"
echo ""
echo "Demo accounts that will be created:"
echo "  - Admin: admin@demo-school.com (password: admin123)"
echo "  - Student: student@demo-school.com (password: student123)"
echo "  - Demo School: demo-school"
echo "  - 3 test courses"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🗄️  Pushing schema to database..."
npx prisma db push

echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Done!"
echo ""
echo "🎉 Your production database is now seeded!"
echo ""
echo "Access your site:"
echo "  Homepage: https://your-project.vercel.app"
echo "  Admin Login: https://your-project.vercel.app/login"
echo ""
echo "Admin credentials:"
echo "  Email: admin@demo-school.com"
echo "  Password: admin123"
echo ""
echo "Dashboard:"
echo "  https://your-project.vercel.app/t/demo-school/dashboard"
echo ""

-- OpenLMS Database Schema Setup
-- This file creates all required enum types for the Prisma schema
-- Run this in your Neon SQL console to fix "type does not exist" errors

-- Create TenantStatus enum
DO $$ BEGIN
    CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'TenantStatus enum already exists, skipping';
END $$;

-- Create TenantPlan enum
DO $$ BEGIN
    CREATE TYPE "TenantPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'TenantPlan enum already exists, skipping';
END $$;

-- Create UserRole enum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('TENANT_ADMIN', 'LEARNER');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'UserRole enum already exists, skipping';
END $$;

-- Create CourseAccessType enum
DO $$ BEGIN
    CREATE TYPE "CourseAccessType" AS ENUM ('FREE', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'CourseAccessType enum already exists, skipping';
END $$;

-- Create CourseStatus enum
DO $$ BEGIN
    CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'CourseStatus enum already exists, skipping';
END $$;

-- Create EnrollmentStatus enum
DO $$ BEGIN
    CREATE TYPE "EnrollmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'EnrollmentStatus enum already exists, skipping';
END $$;

-- Create PaymentStatus enum
DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'PaymentStatus enum already exists, skipping';
END $$;

-- Verify enums were created
SELECT 'Setup complete! All enum types created successfully.' AS status;

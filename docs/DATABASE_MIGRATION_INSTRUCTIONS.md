# Database Migration Instructions for Google OAuth

## Migration Overview

This migration adds support for Google OAuth by creating a new `provider_accounts` table and updating the `users` table.

## Migration Steps

### Automatic Migration (Recommended)

Run the following command from the `backend/` directory:

```bash
cd backend
pnpm run db:migrate
```

This will:
1. Create the `provider_accounts` table
2. Make the `password` field in `users` table nullable
3. Add `email_verified` field to `users` table
4. Set `email_verified = true` for all existing users (backward compatibility)
5. Create necessary indexes
6. Set up foreign key constraints

### Manual Migration (if needed)

If automatic migration fails, you can run the SQL manually:

```sql
-- CreateTable
CREATE TABLE "provider_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_accounts_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Make password optional and add emailVerified
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to have emailVerified=true for backward compatibility
UPDATE "users" SET "email_verified" = true WHERE "password" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "provider_accounts_provider_provider_account_id_key"
ON "provider_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE INDEX "provider_accounts_user_id_idx" ON "provider_accounts"("user_id");

-- CreateIndex
CREATE INDEX "provider_accounts_provider_email_idx"
ON "provider_accounts"("provider", "email");

-- AddForeignKey
ALTER TABLE "provider_accounts"
ADD CONSTRAINT "provider_accounts_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
```

## Verification

After running the migration, verify it was successful:

```bash
# Connect to your database
psql $DATABASE_URL

# Check tables exist
\dt

# Check provider_accounts schema
\d provider_accounts

# Check users schema (should have email_verified and nullable password)
\d users

# Verify existing users have email_verified=true
SELECT id, email, email_verified FROM users LIMIT 5;
```

Expected output:
- `provider_accounts` table exists with all columns
- `users.password` is nullable
- `users.email_verified` exists and is `true` for existing users
- Indexes are created on provider_accounts

## Rollback

To rollback this migration (WARNING: This will delete all OAuth provider links):

```sql
-- Drop provider_accounts table
DROP TABLE IF EXISTS provider_accounts;

-- Make password required again (only if safe to do so)
-- WARNING: This will fail if any users have NULL passwords
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Drop emailVerified field
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Backup database before migration
- [ ] Test migration on staging environment
- [ ] Verify rollback procedure works
- [ ] Schedule maintenance window (if needed)
- [ ] Prepare rollback plan

### Deployment Steps

1. **Backup Database**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run Migration**
   ```bash
   cd backend
   pnpm run db:migrate:prod
   ```

3. **Verify Migration**
   ```bash
   # Check that tables exist and users can still login
   ```

4. **Monitor Application**
   - Check error logs
   - Verify existing auth still works
   - Test OAuth flow

### Zero-Downtime Deployment

This migration is designed for zero-downtime deployment:

1. **Schema changes are backward compatible**
   - Password becomes nullable (but existing users have passwords)
   - New table doesn't affect existing queries
   - Indexes are added without locking

2. **Deployment order**
   - Deploy database migration first
   - Deploy backend code second
   - Deploy frontend code third

3. **If issues occur**
   - Old code continues to work with new schema
   - Rollback frontend/backend without schema rollback
   - Schema rollback only if absolutely necessary

## Troubleshooting

### Migration Fails: "password cannot be null"

This shouldn't happen with this migration, but if it does:

```sql
-- Check for users without passwords
SELECT id, email FROM users WHERE password IS NULL;

-- If any exist, set a random password or delete them
UPDATE users SET password = 'TEMP_PASSWORD_RESET_REQUIRED' WHERE password IS NULL;
```

### Migration Fails: "relation already exists"

The migration has already been run. Check:

```sql
-- Check if provider_accounts exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_name = 'provider_accounts'
);

-- Check if email_verified column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'email_verified';
```

If they exist, the migration is already applied.

### Performance Concerns

This migration should be fast even on large databases:

- **ALTER TABLE** on users: Fast (no data rewrite needed)
- **UPDATE** on users: Fast (indexed by primary key)
- **CREATE TABLE**: Instant
- **CREATE INDEX**: Fast on empty table

Expected time for 1M users: < 10 seconds

## Post-Migration Tasks

After successful migration:

1. **Update Prisma Client**
   ```bash
   cd backend
   pnpm run db:generate
   ```

2. **Restart Application**
   ```bash
   # Restart backend to use new Prisma client
   ```

3. **Test OAuth Flow**
   - Test new user signup with Google
   - Test existing user login with Google
   - Test account linking

4. **Monitor Logs**
   - Watch for any migration-related errors
   - Check database performance
   - Monitor OAuth endpoint usage

## Support

For issues or questions:
- Check application logs
- Review database error messages
- Consult the team lead
- Refer to [OAUTH_README.md](./OAUTH_README.md)

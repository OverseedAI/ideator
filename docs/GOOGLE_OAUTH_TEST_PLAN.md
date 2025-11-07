# Google OAuth Test Plan & Acceptance Criteria

## Overview

This document outlines the comprehensive test plan for Google Sign-In OAuth integration, including acceptance criteria, test scenarios, and rollback procedures.

## Acceptance Criteria

### Functional Requirements

#### ✅ FR-1: Google Sign-In Entry Point
- [ ] "Continue with Google" button appears on login page
- [ ] "Continue with Google" button appears on signup page
- [ ] Button displays Google logo and proper branding
- [ ] Button has proper hover and loading states

#### ✅ FR-2: OAuth Flow Initiation
- [ ] Clicking "Continue with Google" redirects to Google OAuth consent screen
- [ ] Consent screen shows correct app name and scopes
- [ ] Consent screen shows user email and profile scopes only
- [ ] State parameter is generated and stored for CSRF protection

#### ✅ FR-3: New User Registration
- [ ] New users can sign up using Google account
- [ ] User record is created with email from Google
- [ ] User name is populated from Google profile
- [ ] Email is marked as verified if verified by Google
- [ ] Provider account is created and linked
- [ ] JWT token is generated and returned
- [ ] User is redirected to dashboard after successful signup

#### ✅ FR-4: Existing User Login
- [ ] Users with existing Google-linked accounts can login
- [ ] Correct user session is returned (idempotent)
- [ ] Access token is refreshed on login
- [ ] JWT token is generated and returned
- [ ] User is redirected to dashboard after successful login

#### ✅ FR-5: Account Linking
- [ ] If email matches existing password account, Google account is linked
- [ ] Email verification check is enforced before linking
- [ ] User is notified that account was linked
- [ ] Both password and Google login work for linked accounts
- [ ] User can see linked providers in account settings
- [ ] Cannot create duplicate users with same email

#### ✅ FR-6: OAuth Callback Handling
- [ ] Callback route handles authorization code
- [ ] State parameter is verified (CSRF protection)
- [ ] User cancellation is handled gracefully
- [ ] Errors are displayed to user with clear messages
- [ ] Successful auth redirects to dashboard
- [ ] Failed auth redirects to login

#### ✅ FR-7: Error Handling
- [ ] Missing authorization code returns proper error
- [ ] Invalid state parameter returns CSRF error
- [ ] Expired state returns error
- [ ] Network errors are handled gracefully
- [ ] Unverified Google email shows clear error message
- [ ] All errors are logged for debugging

### Security Requirements

#### ✅ SR-1: CSRF Protection
- [ ] State parameter is generated using secure random bytes (32 bytes)
- [ ] State is stored server-side (in-memory or Redis)
- [ ] State is verified on callback
- [ ] State expires after 15 minutes
- [ ] Used states are immediately deleted

#### ✅ SR-2: Token Security
- [ ] Access tokens are stored securely (encrypted at rest if stored)
- [ ] Refresh tokens are only stored if needed
- [ ] No tokens are exposed in URLs or logs
- [ ] JWT tokens follow existing security standards

#### ✅ SR-3: Email Verification
- [ ] Unverified Google emails cannot link to existing accounts
- [ ] Clear error message for unverified email linking attempt
- [ ] Password accounts are marked as verified for backward compatibility

#### ✅ SR-4: Rate Limiting
- [ ] OAuth endpoints are rate-limited (10 requests per 15 min per IP)
- [ ] Rate limit applies to both initiate and callback endpoints
- [ ] Rate limit errors return proper HTTP 429 status

#### ✅ SR-5: Secrets Management
- [ ] Google Client ID and Secret are stored in environment variables
- [ ] No credentials in code or version control
- [ ] .env files are in .gitignore
- [ ] Production uses proper secret management

### Data Requirements

#### ✅ DR-1: Database Schema
- [ ] ProviderAccount table exists with correct schema
- [ ] User table has emailVerified field
- [ ] User password field is nullable
- [ ] Proper indexes exist (userId, provider+providerAccountId, provider+email)
- [ ] Foreign keys with CASCADE delete work correctly

#### ✅ DR-2: Data Integrity
- [ ] Email normalization (lowercase, trim) works correctly
- [ ] No duplicate provider accounts can be created
- [ ] One user can have multiple provider accounts
- [ ] Provider account deletion cascades when user is deleted

#### ✅ DR-3: Backward Compatibility
- [ ] Existing password users can still login
- [ ] Existing users get emailVerified=true on migration
- [ ] No breaking changes to current auth flow

## Test Scenarios

### Happy Path Tests

#### Test 1: New User Sign-Up with Google
**Steps:**
1. Navigate to signup page
2. Click "Continue with Google"
3. Select Google account (not in system)
4. Grant consent
5. Verify redirect to dashboard

**Expected:**
- New user created in database
- Provider account linked
- Email marked as verified
- Success toast displayed
- JWT token stored in localStorage

#### Test 2: Existing User Login with Google
**Steps:**
1. Create account using Google (Test 1)
2. Logout
3. Click "Continue with Google" on login page
4. Select same Google account
5. Verify redirect to dashboard

**Expected:**
- Same user session returned
- Access token updated
- Success toast displayed
- No duplicate user created

#### Test 3: Account Linking (Matching Email)
**Steps:**
1. Create account with email/password (user@example.com)
2. Logout
3. Click "Continue with Google"
4. Select Google account with same email
5. Grant consent
6. Verify redirect to dashboard

**Expected:**
- Google account linked to existing user
- "Account linked" toast displayed
- User can login with both password and Google
- No duplicate user created

### Error Path Tests

#### Test 4: User Cancels OAuth Flow
**Steps:**
1. Click "Continue with Google"
2. Click "Cancel" on Google consent screen

**Expected:**
- User redirected to login page
- Error toast: "Google sign-in was cancelled"
- No user created
- No error logged

#### Test 5: Invalid State (CSRF Attack)
**Steps:**
1. Start OAuth flow
2. Manually modify state parameter in callback URL
3. Submit modified callback

**Expected:**
- Error: "Invalid state parameter"
- User redirected to login
- Auth fails
- Security event logged

#### Test 6: Expired State
**Steps:**
1. Start OAuth flow
2. Wait 16 minutes
3. Complete OAuth flow

**Expected:**
- Error: "Invalid or expired state"
- User redirected to login
- Auth fails

#### Test 7: Unverified Google Email Linking
**Steps:**
1. Create account with email@example.com and password
2. Try to login with Google using unverified email@example.com

**Expected:**
- Error: "Cannot link account: Google email is not verified"
- Clear instructions to verify email with Google
- Account not linked

#### Test 8: Missing Authorization Code
**Steps:**
1. Navigate directly to `/oauth/callback` without code

**Expected:**
- Error: "Missing authorization code"
- User redirected to login
- Error logged

#### Test 9: Network Error During OAuth
**Steps:**
1. Start OAuth flow
2. Simulate network error (disconnect internet before callback)
3. Attempt to complete flow

**Expected:**
- Error: "Failed to authenticate with Google"
- User redirected to login
- Error logged with details

### Security Tests

#### Test 10: Rate Limiting
**Steps:**
1. Make 11 requests to `/api/v1/oauth/google` in 1 minute

**Expected:**
- First 10 requests succeed
- 11th request returns HTTP 429
- Error message: "Too many OAuth requests"

#### Test 11: Token Storage Security
**Steps:**
1. Complete OAuth flow
2. Check database for access token
3. Verify token is stored securely

**Expected:**
- Token stored in provider_accounts table
- Token not exposed in API responses
- Token not in logs

#### Test 12: HTTPS Enforcement (Production)
**Steps:**
1. Try to use HTTP redirect URI in production
2. Verify Google rejects it

**Expected:**
- OAuth fails with redirect_uri_mismatch
- HTTPS required for production

### Account Management Tests

#### Test 13: View Linked Providers
**Steps:**
1. Login with linked account
2. Navigate to account settings
3. View linked providers

**Expected:**
- Google provider shown
- Provider email displayed
- Link date shown

#### Test 14: Unlink Provider (with password)
**Steps:**
1. Create account with password
2. Link Google account
3. Unlink Google provider

**Expected:**
- Provider unlinked successfully
- Can still login with password
- Success message displayed

#### Test 15: Prevent Unlinking Only Auth Method
**Steps:**
1. Create account with Google only
2. Try to unlink Google provider

**Expected:**
- Error: "Cannot unlink the only authentication method"
- Instructions to set password first
- Provider remains linked

### Edge Cases

#### Test 16: Multiple OAuth Providers (Future)
**Steps:**
1. Link Google account
2. Prepare for future providers (e.g., GitHub)

**Expected:**
- Architecture supports multiple providers
- Provider accounts kept separate
- Same user can have multiple providers

#### Test 17: Email Normalization
**Steps:**
1. Create account with Email@Example.COM
2. Login with Google using email@example.com

**Expected:**
- Emails match (normalized to lowercase)
- Account linking works
- No duplicate created

#### Test 18: Concurrent OAuth Requests
**Steps:**
1. Open two tabs
2. Start OAuth flow in both
3. Complete both flows

**Expected:**
- Both requests handled correctly
- No race conditions
- Same user returned (idempotent)

## Performance Tests

### Test 19: OAuth Flow Latency
**Expected:**
- Total OAuth flow < 5 seconds
- Token generation < 500ms
- Database operations < 200ms

### Test 20: Database Query Performance
**Steps:**
1. Create 10,000 users with provider accounts
2. Test login performance

**Expected:**
- Login time < 1 second
- Indexes used correctly
- No N+1 queries

## Demo Script

### Setup
1. Ensure backend and frontend are running
2. Google OAuth is configured
3. Database is migrated
4. Test Google account is ready

### Demo Flow
1. **Show Login Page**
   - Point out "Continue with Google" button
   - Note clean UI with divider

2. **Initiate OAuth**
   - Click "Continue with Google"
   - Show Google consent screen
   - Point out scopes requested (email, profile)

3. **Complete Sign-Up**
   - Grant consent
   - Show loading state on callback page
   - Show success message
   - Redirect to dashboard

4. **Verify in Database**
   - Show user record created
   - Show provider_account linked
   - Show emailVerified=true

5. **Test Login**
   - Logout
   - Login with Google again
   - Show instant login (no consent needed)

6. **Account Linking**
   - Create password account with same email
   - Login with Google
   - Show "Account linked" message
   - Verify can login with both methods

## Rollback Plan

### Immediate Rollback (Zero Downtime)

If critical issues are found:

1. **Disable OAuth Feature**
   ```bash
   # Backend: Comment out OAuth routes
   # router.use("/oauth", oauthRoutes);
   ```

2. **Remove Frontend UI**
   ```bash
   # Comment out GoogleSignInButton in Login/Signup
   ```

3. **Deploy Changes**
   - Deploy backend without OAuth routes
   - Deploy frontend without Google button
   - Password login still works (zero impact)

### Database Rollback

If database migration must be reversed:

1. **Create Rollback Migration**
   ```sql
   -- Drop provider_accounts table
   DROP TABLE IF EXISTS provider_accounts;

   -- Make password required again
   ALTER TABLE users ALTER COLUMN password SET NOT NULL;

   -- Drop emailVerified field
   ALTER TABLE users DROP COLUMN email_verified;
   ```

2. **Important Notes**
   - This will delete all provider account links
   - Users who signed up with Google will lose access
   - Only rollback if absolutely necessary

3. **User Communication**
   - Email users who signed up with Google
   - Provide password reset instructions
   - Explain the rollback

### Partial Rollback

If only Google OAuth needs to be disabled:

1. Keep database schema (no rollback needed)
2. Remove OAuth routes and UI
3. Keep ProviderAccount table for future use
4. Existing password auth unaffected

## Success Metrics

- [ ] OAuth flow completion rate > 95%
- [ ] Error rate < 1%
- [ ] Average OAuth flow time < 3 seconds
- [ ] Zero security incidents
- [ ] Zero data loss incidents
- [ ] Account linking success rate > 98%
- [ ] Rate limiting blocks malicious requests

## Sign-off Checklist

- [ ] All functional requirements tested and passing
- [ ] All security requirements verified
- [ ] Performance benchmarks met
- [ ] Documentation complete and reviewed
- [ ] Rollback plan tested
- [ ] Security review completed
- [ ] Privacy policy updated (if needed)
- [ ] Terms of service updated (if needed)
- [ ] Monitoring and logging in place
- [ ] Error tracking configured
- [ ] Production environment variables set
- [ ] Google OAuth consent screen published (if needed)

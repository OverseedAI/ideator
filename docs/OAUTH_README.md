# Google OAuth Integration

This document provides a quick overview of the Google OAuth integration in the Ideator application.

## Features

- **Google Sign-In**: Users can sign in or sign up using their Google account
- **Account Linking**: Automatically links Google accounts to existing email/password accounts
- **Security**: Implements CSRF protection, rate limiting, and secure token handling
- **Email Verification**: Enforces email verification before account linking
- **Backward Compatible**: Existing password authentication continues to work

## Architecture

### Backend

**Files Added:**
- `src/services/oauthService.ts` - OAuth business logic and account linking
- `src/controllers/oauthController.ts` - OAuth HTTP handlers
- `src/routes/v1/oauthRoutes.ts` - OAuth API routes with rate limiting

**Files Modified:**
- `src/config/index.ts` - Added Google OAuth config
- `src/services/authService.ts` - Mark password users as verified
- `src/routes/v1/index.ts` - Added OAuth routes
- `prisma/schema.prisma` - Added ProviderAccount model

**Database:**
- New table: `provider_accounts`
- Updated table: `users` (password nullable, emailVerified field)

### Frontend

**Files Added:**
- `src/components/auth/GoogleSignInButton.tsx` - Google sign-in button component
- `src/pages/OAuthCallback.tsx` - OAuth callback handler page

**Files Modified:**
- `src/services/authService.ts` - Added OAuth API calls
- `src/pages/Login.tsx` - Added Google Sign-In button
- `src/pages/Signup.tsx` - Added Google Sign-In button
- `src/routes.tsx` - Added OAuth callback route

## API Endpoints

### OAuth Endpoints

**Initiate Google OAuth:**
```
GET /api/v1/oauth/google
Response: { authUrl: string, state: string }
```

**Google OAuth Callback:**
```
GET /api/v1/oauth/google/callback?code=xxx&state=xxx
Response: { user: User, token: string, isNewUser?: boolean, accountLinked?: boolean }
```

**Get Linked Providers (Protected):**
```
GET /api/v1/oauth/providers
Authorization: Bearer <token>
Response: { providers: Array<{ provider: string, email: string, createdAt: string }> }
```

**Unlink Provider (Protected):**
```
DELETE /api/v1/oauth/providers/:provider
Authorization: Bearer <token>
Response: { success: boolean }
```

## Environment Variables

### Backend

```bash
# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/oauth/google/callback
```

**Production:**
- Set `GOOGLE_REDIRECT_URI` to your production backend URL
- Example: `https://api.yourdomain.com/api/v1/oauth/google/callback`

## Setup

1. **Configure Google OAuth** (see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md))
2. **Set environment variables** in `backend/.env`
3. **Run database migration**: `cd backend && pnpm run db:migrate`
4. **Start the application**: `pnpm run dev`

## Security Features

### CSRF Protection
- State parameter generated using crypto.randomBytes(32)
- State stored server-side with 15-minute expiration
- State verified on callback before processing

### Rate Limiting
- 10 requests per 15 minutes per IP address
- Applies to all OAuth endpoints
- Returns HTTP 429 on limit exceeded

### Email Verification
- Only verified Google emails can link to existing accounts
- Prevents account hijacking via unverified emails
- Clear error messages for users

### Token Security
- Access tokens stored securely in database
- Tokens not exposed in API responses or logs
- JWT tokens follow existing security standards

### Account Linking Rules
1. If Google account already linked → login existing user
2. If email matches existing account → link accounts (with verification check)
3. If new email → create new user

## Flow Diagrams

### New User Sign-Up

```
User clicks "Continue with Google"
  ↓
Backend generates state + auth URL
  ↓
User redirected to Google consent screen
  ↓
User grants consent
  ↓
Google redirects to callback with code
  ↓
Backend verifies state (CSRF check)
  ↓
Backend exchanges code for tokens
  ↓
Backend checks if user exists
  ↓
Backend creates new user + provider account
  ↓
Backend generates JWT token
  ↓
User redirected to dashboard
```

### Account Linking

```
User clicks "Continue with Google"
  ↓
Backend generates state + auth URL
  ↓
User redirected to Google consent screen
  ↓
User grants consent
  ↓
Google redirects to callback with code
  ↓
Backend verifies state (CSRF check)
  ↓
Backend exchanges code for tokens
  ↓
Backend finds existing user with matching email
  ↓
Backend verifies Google email is verified
  ↓
Backend links provider account to existing user
  ↓
Backend generates JWT token
  ↓
User redirected to dashboard with "Account linked" message
```

## Testing

See [GOOGLE_OAUTH_TEST_PLAN.md](./GOOGLE_OAUTH_TEST_PLAN.md) for comprehensive test scenarios.

**Quick Test:**
1. Start dev server: `pnpm run dev`
2. Navigate to `http://localhost:5173/login`
3. Click "Continue with Google"
4. Sign in with test Google account
5. Verify redirect to dashboard

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Ensure `GOOGLE_REDIRECT_URI` matches authorized redirect URI in Google Cloud Console
- Check for typos (including trailing slashes)

### "Invalid state parameter"
- Clear browser cache and try again
- State may have expired (15-minute limit)

### "Cannot link account: Google email is not verified"
- User needs to verify their email with Google first
- Check Google account settings

### OAuth button not showing
- Check that Google OAuth is configured in backend `.env`
- Verify frontend is calling correct API endpoints

## Future Enhancements

- [ ] Add support for more OAuth providers (GitHub, Microsoft, etc.)
- [ ] Implement OAuth token refresh
- [ ] Add account management UI for linked providers
- [ ] Support multiple OAuth accounts per user
- [ ] Add OAuth analytics and monitoring

## Resources

- [Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Test Plan](./GOOGLE_OAUTH_TEST_PLAN.md)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

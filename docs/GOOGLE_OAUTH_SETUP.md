# Google OAuth Setup Guide

This guide provides step-by-step instructions for setting up Google Sign-In OAuth for the Ideator application.

## Prerequisites

- A Google account
- Access to the [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "Ideator")
5. Click "Create"
6. Wait for the project to be created and select it

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" (or "Google People API")
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose the user type:
   - **External**: For apps available to any Google user
   - **Internal**: Only if you have a Google Workspace organization
3. Click "Create"

### Fill in the OAuth Consent Screen

**App Information:**
- **App name**: Ideator (or your app name)
- **User support email**: Your support email address
- **App logo**: (Optional) Upload your app logo

**App domain:**
- **Application home page**: Your production URL (e.g., https://yourdomain.com)
- **Application privacy policy link**: Your privacy policy URL
- **Application terms of service link**: Your terms of service URL

**Authorized domains:**
- Add your production domain (e.g., `yourdomain.com`)
- For development, you don't need to add `localhost`

**Developer contact information:**
- Enter your email address

4. Click "Save and Continue"

### Scopes

1. Click "Add or Remove Scopes"
2. Filter for and select the following scopes:
   - `userinfo.email` - View your email address
   - `userinfo.profile` - See your personal info
3. Click "Update"
4. Click "Save and Continue"

### Test Users (for External apps in testing)

If your app is in "Testing" mode:
1. Click "Add Users"
2. Add email addresses of users who should be able to test the OAuth flow
3. Click "Save and Continue"

### Summary

Review your settings and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose application type: **Web application**
4. Enter a name: "Ideator Web Client"

### Configure Authorized JavaScript origins

Add the following origins:
- **Development**: `http://localhost:5173` (frontend dev server)
- **Development**: `http://localhost:3000` (backend dev server)
- **Production**: Your production frontend URL (e.g., `https://yourdomain.com`)

### Configure Authorized redirect URIs

Add the following redirect URIs:
- **Development (Backend)**: `http://localhost:3000/api/v1/oauth/google/callback`
- **Development (Frontend)**: `http://localhost:5173/oauth/callback`
- **Production (Backend)**: `https://yourdomain.com/api/v1/oauth/google/callback`
- **Production (Frontend)**: `https://yourdomain.com/oauth/callback`

5. Click "Create"
6. A dialog will appear with your **Client ID** and **Client Secret**
7. **IMPORTANT**: Copy these values - you'll need them for your environment variables

## Step 5: Configure Environment Variables

### Backend (.env in backend/)

Add the following environment variables:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/oauth/google/callback
```

**Production values:**
- Update `GOOGLE_REDIRECT_URI` to your production backend URL
- Example: `https://api.yourdomain.com/api/v1/oauth/google/callback`

### Frontend (.env in frontend/)

The frontend doesn't need Google OAuth environment variables as it calls the backend API.

## Step 6: Publishing Status

Your OAuth consent screen has different publishing statuses:

### Testing Mode (Default)
- Only test users you've added can sign in
- No verification required
- Limited to 100 users

### Production Mode
- Available to all Google users
- Requires verification by Google
- Can take several days to weeks

To publish your app:
1. Go to "OAuth consent screen"
2. Click "Publish App"
3. Review and confirm
4. For apps with sensitive scopes, submit for verification

**Note**: For basic userinfo scopes (email and profile), verification is usually not required.

## Step 7: Security Best Practices

### Secure Your Credentials

1. **Never commit credentials to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables or secret managers

2. **Rotate credentials regularly**
   - Generate new Client ID/Secret periodically
   - Update environment variables

3. **Use HTTPS in production**
   - All redirect URIs must use HTTPS (except localhost)
   - Configure SSL/TLS certificates

4. **Restrict authorized domains**
   - Only add domains you control
   - Remove unused domains

### Monitor Usage

1. Go to "APIs & Services" > "Dashboard"
2. Monitor OAuth requests and errors
3. Set up usage quotas and alerts

## Step 8: Run Database Migration

After setting up Google OAuth, run the database migration to create the required tables:

```bash
cd backend
pnpm run db:migrate
```

This creates the `provider_accounts` table and updates the `users` table.

## Step 9: Test the OAuth Flow

### Development Testing

1. Start the backend: `pnpm run dev:backend`
2. Start the frontend: `pnpm run dev:frontend`
3. Navigate to `http://localhost:5173/login`
4. Click "Continue with Google"
5. Sign in with a test user (if in testing mode)
6. Verify successful authentication

### Test Scenarios

1. **New User Registration**
   - Sign in with a Google account that doesn't exist in your system
   - Verify a new user is created

2. **Existing User Login**
   - Sign in with a Google account that matches an existing email
   - Verify the Google account is linked to the existing user

3. **Account Linking**
   - Create an account with email/password
   - Sign in with Google using the same email
   - Verify the accounts are linked

4. **Cancel Flow**
   - Click "Continue with Google"
   - Click "Cancel" on the Google consent screen
   - Verify you're redirected back to login

5. **Multiple Sign-ins**
   - Sign in with Google multiple times
   - Verify it returns the same user session (idempotent)

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

**Solution**: Ensure the redirect URI in your environment variables exactly matches one of the authorized redirect URIs in Google Cloud Console.

### "Access blocked: This app's request is invalid"

**Solution**:
- Check that the OAuth consent screen is properly configured
- Ensure the user is added as a test user (if in testing mode)
- Verify scopes are correctly configured

### "Invalid state parameter"

**Solution**:
- Clear browser cache and cookies
- Check that state is being stored and retrieved correctly
- Verify CSRF protection is working

### "Google email is not verified"

**Solution**: The user needs to verify their email with Google before they can link their account.

### Network Errors

**Solution**:
- Check that Google APIs are accessible from your server
- Verify firewall rules allow outbound HTTPS traffic
- Check for proxy or network restrictions

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

## Support

For issues or questions:
- Check the [Google OAuth 2.0 FAQ](https://developers.google.com/identity/protocols/oauth2/faq)
- Review backend logs for detailed error messages
- Contact your development team

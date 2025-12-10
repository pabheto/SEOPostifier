# Auth0 Setup Guide

This guide explains how to configure Auth0 authentication for the SEO Backend.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Auth0 Configuration
AUTH0_DOMAIN=dev-y38p834gjptooc4g.us.auth0.com
AUTH0_AUDIENCE=your-api-identifier
```

### Getting Auth0 Configuration Values

1. **AUTH0_DOMAIN**:
   - This is your Auth0 domain (e.g., `dev-y38p834gjptooc4g.us.auth0.com`)
   - Found in your Auth0 Dashboard → Applications → Settings

2. **AUTH0_AUDIENCE**:
   - This is your API Identifier
   - Create an API in Auth0 Dashboard → APIs
   - Use the "Identifier" value (not the name)
   - Example: `https://seo-backend-api` or `seo-backend-api`

## Auth0 API Setup

1. Go to Auth0 Dashboard → APIs
2. Create a new API or select an existing one
3. Set the **Identifier** (this becomes your `AUTH0_AUDIENCE`)
4. Set the **Signing Algorithm** to `RS256`
5. Save the API

## Auth0 Application Setup (for Frontend)

1. Go to Auth0 Dashboard → Applications
2. Create a new Application or select an existing one
3. Set the **Application Type** to "Regular Web Application"
4. In **Allowed Callback URLs**, add:
   - `http://localhost:3000/api/auth/callback` (development)
   - Your production callback URL
5. In **Allowed Logout URLs**, add:
   - `http://localhost:3000` (development)
   - Your production URL
6. In **Allowed Web Origins**, add:
   - `http://localhost:3000` (development)
   - Your production URL
7. Save the application

## Testing

After configuration, test the authentication flow:

1. Start the backend: `pnpm start:dev`
2. The `/subscriptions/current` endpoint should now require a valid Auth0 JWT token
3. Use the frontend to authenticate and make requests

## Troubleshooting

### "Invalid or expired token"

- Check that `AUTH0_DOMAIN` matches your Auth0 domain exactly
- Verify `AUTH0_AUDIENCE` matches your API Identifier
- Ensure the token is not expired
- Check that the token was issued by the correct Auth0 domain

### "Authorization token is required"

- Ensure the frontend is sending the token in the `Authorization` header
- Format should be: `Authorization: Bearer <token>`

### Token validation fails

- Verify the API in Auth0 has RS256 signing algorithm
- Check that the token audience matches `AUTH0_AUDIENCE`
- Ensure the token issuer matches `https://AUTH0_DOMAIN/`


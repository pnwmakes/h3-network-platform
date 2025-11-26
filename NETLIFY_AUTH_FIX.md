# Netlify Authentication Fix Required

## Problem Found

The `NEXTAUTH_URL` environment variable in Netlify is set to `http://localhost:3000` instead of the production URL.

This causes NextAuth to try setting cookies for localhost when users are on the Netlify domain, which browsers block for security.

## Solution

Go to your Netlify dashboard and update the environment variable:

1. Go to: https://app.netlify.com/sites/h3-network/configuration/env
2. Find `NEXTAUTH_URL`
3. Change from: `http://localhost:3000`
4. Change to: `https://h3-network.netlify.app`
5. Click "Save"
6. Trigger a new deploy (or wait for automatic deploy)

## Why This Fixes Both Login AND Logout

- **Login**: Cookies will be set for the correct domain
- **Logout**: Cookies will be cleared from the correct domain
- **Session**: Will persist across page loads

## Test After Fix

1. Go to https://h3-network.netlify.app
2. Click "Sign In"
3. Login with noah@h3network.org / Password123!
4. Should redirect to creator dashboard and stay logged in
5. Click "Sign Out" - should fully log out

## Root Cause

We've been troubleshooting cookie settings, adapters, and sign-out logic, but the real issue was that NextAuth was configured for localhost even in production. This is why:

- Login appeared to work (200 response) but no session
- Logout appeared to work (cleared localhost cookies) but you stayed "logged in" (browser cookies for netlify domain were never set)

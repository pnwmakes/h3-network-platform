import NextAuth, { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            role: UserRole;
        };
    }

    interface User {
        role: UserRole;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    debug: process.env.NODE_ENV === 'development',
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'your@email.com',
                },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Find user by email
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    // Return user object
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                    };
                } catch (error) {
                    logger.error('Error during authentication:', {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        email: credentials.email,
                    });
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || 'VIEWER';
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({ user }) {
            // Allow all sign ins
            return true;
        },
        async redirect({ url, baseUrl }) {
            // If user is signing in, redirect based on their role
            if (url.startsWith(baseUrl)) {
                return url;
            }
            // Default redirect to home
            return baseUrl;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
        signOut: '/', // Redirect to homepage after sign out
    },
    events: {
        async createUser({ user }) {
            // New user created - could send welcome email here
            logger.info('New user created', {
                userId: user.id,
                email: user.email || undefined,
                name: user.name || undefined,
            });
        },
        async signIn({ user, account }) {
            logger.info('User signed in', {
                userId: user.id,
                email: user.email || undefined,
                provider: account?.provider,
                type: account?.type,
            });
        },
        async signOut({ session }) {
            logger.info('User signed out', {
                userId: session?.user?.id,
                email: session?.user?.email,
            });
        },
    },
};

export default NextAuth(authOptions);

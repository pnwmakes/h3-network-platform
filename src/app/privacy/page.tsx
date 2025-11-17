'use client';

import {
    Shield,
    Lock,
    Eye,
    UserCheck,
    FileText,
    Database,
    Mail,
    Globe,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
    const lastUpdated = 'November 17, 2025';

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white shadow-sm border-b'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex items-center gap-4 mb-4'>
                        <Shield className='h-8 w-8 text-blue-600' />
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Privacy Policy
                        </h1>
                    </div>
                    <p className='text-gray-600 text-lg'>
                        H3 Network is committed to protecting your privacy and
                        maintaining your trust. This policy explains how we
                        collect, use, and protect your information.
                    </p>
                    <p className='text-sm text-gray-500 mt-4'>
                        Last updated: {lastUpdated}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <div className='bg-white rounded-lg shadow-sm p-8 space-y-8'>
                    {/* Our Commitment */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <UserCheck className='h-6 w-6 text-blue-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Our Commitment to You
                            </h2>
                        </div>
                        <div className='prose prose-gray max-w-none'>
                            <p className='text-gray-700 leading-relaxed'>
                                At H3 Network, we understand that privacy is
                                especially important for justice-impacted
                                individuals and their families. We are committed
                                to protecting your personal information and
                                respecting your privacy choices. This privacy
                                policy outlines how we collect, use, protect,
                                and share information when you use our website,
                                services, or interact with our community.
                            </p>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <Database className='h-6 w-6 text-green-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Information We Collect
                            </h2>
                        </div>
                        <div className='space-y-6'>
                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Information You Provide to Us
                                </h3>
                                <ul className='space-y-2 text-gray-700'>
                                    <li>
                                        • <strong>Account Information:</strong>{' '}
                                        Name, email address, password, and
                                        profile information when you create an
                                        account
                                    </li>
                                    <li>
                                        • <strong>Content:</strong> Videos, blog
                                        posts, comments, and other content you
                                        create or share
                                    </li>
                                    <li>
                                        • <strong>Communication:</strong>{' '}
                                        Messages you send to us or other users
                                        through our platform
                                    </li>
                                    <li>
                                        •{' '}
                                        <strong>Newsletter Preferences:</strong>{' '}
                                        Email preferences and subscription
                                        choices
                                    </li>
                                    <li>
                                        • <strong>Creator Information:</strong>{' '}
                                        Additional details if you apply to
                                        become a content creator
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Information We Collect Automatically
                                </h3>
                                <ul className='space-y-2 text-gray-700'>
                                    <li>
                                        • <strong>Usage Data:</strong> How you
                                        interact with our website, videos
                                        watched, time spent, and features used
                                    </li>
                                    <li>
                                        • <strong>Device Information:</strong>{' '}
                                        Browser type, operating system, IP
                                        address, and device identifiers
                                    </li>
                                    <li>
                                        • <strong>Analytics:</strong> Website
                                        traffic, page views, and user engagement
                                        metrics
                                    </li>
                                    <li>
                                        • <strong>Cookies:</strong> Small data
                                        files stored on your device to improve
                                        your experience
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <Eye className='h-6 w-6 text-purple-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                How We Use Your Information
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <p className='text-gray-700'>
                                We use your information to:
                            </p>
                            <ul className='space-y-2 text-gray-700 ml-4'>
                                <li>
                                    • Provide and improve our services and
                                    platform functionality
                                </li>
                                <li>• Create and maintain your user account</li>
                                <li>
                                    • Deliver personalized content and
                                    recommendations
                                </li>
                                <li>
                                    • Send newsletters and communications (only
                                    if you opt-in)
                                </li>
                                <li>
                                    • Respond to your questions and provide
                                    customer support
                                </li>
                                <li>
                                    • Analyze usage patterns to improve our
                                    platform
                                </li>
                                <li>
                                    • Ensure platform security and prevent fraud
                                </li>
                                <li>
                                    • Comply with legal obligations and protect
                                    our rights
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <Globe className='h-6 w-6 text-orange-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                How We Share Information
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <p className='text-gray-700'>
                                We do not sell, rent, or trade your personal
                                information. We may share your information only
                                in these limited circumstances:
                            </p>
                            <ul className='space-y-2 text-gray-700 ml-4'>
                                <li>
                                    • <strong>Public Content:</strong> Content
                                    you choose to make public (videos, blog
                                    posts, comments) will be visible to other
                                    users
                                </li>
                                <li>
                                    • <strong>Service Providers:</strong>{' '}
                                    Trusted third parties who help us operate
                                    our platform (hosting, analytics, email
                                    services)
                                </li>
                                <li>
                                    • <strong>Legal Requirements:</strong> When
                                    required by law, court order, or to protect
                                    our rights and safety
                                </li>
                                <li>
                                    • <strong>Business Transfer:</strong> In the
                                    event of a merger, acquisition, or sale of
                                    assets
                                </li>
                                <li>
                                    • <strong>Consent:</strong> When you
                                    explicitly consent to sharing for a specific
                                    purpose
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <Lock className='h-6 w-6 text-red-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Data Security
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <p className='text-gray-700'>
                                We implement appropriate technical and
                                organizational measures to protect your
                                information:
                            </p>
                            <ul className='space-y-2 text-gray-700 ml-4'>
                                <li>
                                    • Encryption of data in transit and at rest
                                </li>
                                <li>
                                    • Secure authentication and access controls
                                </li>
                                <li>
                                    • Regular security assessments and updates
                                </li>
                                <li>
                                    • Limited access to personal information on
                                    a need-to-know basis
                                </li>
                                <li>• Secure hosting and infrastructure</li>
                            </ul>
                            <p className='text-gray-700'>
                                While we strive to protect your information, no
                                method of transmission over the internet or
                                electronic storage is 100% secure. We cannot
                                guarantee absolute security but are committed to
                                protecting your information using
                                industry-standard practices.
                            </p>
                        </div>
                    </section>

                    {/* Your Rights and Choices */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <UserCheck className='h-6 w-6 text-indigo-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Your Rights and Choices
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <p className='text-gray-700'>
                                You have the following rights regarding your
                                personal information:
                            </p>
                            <ul className='space-y-2 text-gray-700 ml-4'>
                                <li>
                                    • <strong>Access:</strong> Request a copy of
                                    the personal information we hold about you
                                </li>
                                <li>
                                    • <strong>Correction:</strong> Update or
                                    correct inaccurate information in your
                                    profile
                                </li>
                                <li>
                                    • <strong>Deletion:</strong> Request
                                    deletion of your account and associated data
                                </li>
                                <li>
                                    • <strong>Portability:</strong> Request a
                                    copy of your data in a portable format
                                </li>
                                <li>
                                    • <strong>Opt-out:</strong> Unsubscribe from
                                    newsletters and marketing communications
                                </li>
                                <li>
                                    • <strong>Privacy Settings:</strong> Control
                                    who can see your profile and activity
                                </li>
                            </ul>
                            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
                                <p className='text-blue-800'>
                                    <strong>To exercise your rights:</strong>{' '}
                                    Contact us at{' '}
                                    <a
                                        href='mailto:hopehelphumor.network@gmail.com'
                                        className='text-blue-600 hover:underline'
                                    >
                                        hopehelphumor.network@gmail.com
                                    </a>{' '}
                                    or visit your account settings page.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Cookies and Tracking */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <FileText className='h-6 w-6 text-teal-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Cookies and Tracking
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <p className='text-gray-700'>
                                We use cookies and similar technologies to
                                enhance your experience:
                            </p>
                            <ul className='space-y-2 text-gray-700 ml-4'>
                                <li>
                                    • <strong>Essential Cookies:</strong>{' '}
                                    Required for basic website functionality and
                                    security
                                </li>
                                <li>
                                    • <strong>Preference Cookies:</strong>{' '}
                                    Remember your settings and preferences
                                </li>
                                <li>
                                    • <strong>Analytics Cookies:</strong> Help
                                    us understand how visitors use our website
                                </li>
                                <li>
                                    • <strong>Marketing Cookies:</strong> Used
                                    to deliver relevant content (only with
                                    consent)
                                </li>
                            </ul>
                            <p className='text-gray-700'>
                                You can control cookies through your browser
                                settings. Note that disabling certain cookies
                                may affect website functionality.
                            </p>
                        </div>
                    </section>

                    {/* Newsletter and Communications */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <Mail className='h-6 w-6 text-pink-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Newsletter and Communications
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <p className='text-gray-700'>
                                Our newsletter is opt-in only. We will only send
                                you newsletters and communications if you
                                explicitly subscribe or request them.
                            </p>
                            <ul className='space-y-2 text-gray-700 ml-4'>
                                <li>
                                    • You can choose which types of newsletters
                                    to receive
                                </li>
                                <li>
                                    • Every email includes an easy unsubscribe
                                    link
                                </li>
                                <li>
                                    • We respect your preferences and will not
                                    send unwanted emails
                                </li>
                                <li>
                                    • You can update your email preferences at
                                    any time in your account settings
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Special Considerations */}
                    <section>
                        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
                            <h3 className='text-lg font-semibold text-yellow-800 mb-3'>
                                Special Considerations for Our Community
                            </h3>
                            <p className='text-yellow-800'>
                                We understand that many members of our community
                                may have unique privacy and safety concerns due
                                to their experiences with the criminal justice
                                system. We are committed to:
                            </p>
                            <ul className='space-y-1 text-yellow-800 mt-3 ml-4'>
                                <li>• Providing robust privacy controls</li>
                                <li>
                                    • Not sharing information with law
                                    enforcement unless legally required
                                </li>
                                <li>
                                    • Allowing pseudonymous participation where
                                    appropriate
                                </li>
                                <li>
                                    • Respecting the sensitivity of shared
                                    experiences and stories
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Children's Privacy
                        </h2>
                        <p className='text-gray-700'>
                            Our services are not intended for children under 13
                            years of age. We do not knowingly collect personal
                            information from children under 13. If we learn that
                            we have collected personal information from a child
                            under 13, we will delete that information as quickly
                            as possible.
                        </p>
                    </section>

                    {/* Changes to Policy */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Changes to This Policy
                        </h2>
                        <p className='text-gray-700'>
                            We may update this privacy policy from time to time
                            to reflect changes in our practices or for legal,
                            operational, or regulatory reasons. We will notify
                            you of any significant changes by posting the
                            updated policy on our website and, where
                            appropriate, through other communication channels.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Contact Us
                        </h2>
                        <div className='bg-gray-50 rounded-lg p-6'>
                            <p className='text-gray-700 mb-4'>
                                If you have any questions about this privacy
                                policy or our privacy practices, please contact
                                us:
                            </p>
                            <div className='space-y-2 text-gray-700'>
                                <p>
                                    <strong>Email:</strong>{' '}
                                    <a
                                        href='mailto:hopehelphumor.network@gmail.com'
                                        className='text-blue-600 hover:underline'
                                    >
                                        hopehelphumor.network@gmail.com
                                    </a>
                                </p>
                                <p>
                                    <strong>Subject Line:</strong> "Privacy
                                    Policy Question"
                                </p>
                            </div>
                            <p className='text-sm text-gray-600 mt-4'>
                                We will respond to privacy-related inquiries
                                within 30 days.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

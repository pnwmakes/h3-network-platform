'use client';

import {
    FileText,
    Users,
    Shield,
    AlertTriangle,
    Scale,
    BookOpen,
} from 'lucide-react';

export default function TermsOfServicePage() {
    const lastUpdated = 'November 17, 2025';

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white shadow-sm border-b'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex items-center gap-4 mb-4'>
                        <Scale className='h-8 w-8 text-blue-600' />
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Terms of Service
                        </h1>
                    </div>
                    <p className='text-gray-600 text-lg'>
                        These terms govern your use of H3 Network and help us
                        maintain a safe, supportive community.
                    </p>
                    <p className='text-sm text-gray-500 mt-4'>
                        Last updated: {lastUpdated}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <div className='bg-white rounded-lg shadow-sm p-8 space-y-8'>
                    {/* Acceptance of Terms */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <FileText className='h-6 w-6 text-blue-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Acceptance of Terms
                            </h2>
                        </div>
                        <div className='prose prose-gray max-w-none'>
                            <p className='text-gray-700 leading-relaxed'>
                                By accessing or using H3 Network (&quot;the
                                Platform&quot;), you agree to be bound by these
                                Terms of Service (&quot;Terms&quot;). If you do
                                not agree to these Terms, please do not use our
                                Platform. These Terms apply to all users,
                                including visitors, registered users, and
                                content creators.
                            </p>
                        </div>
                    </section>

                    {/* About H3 Network */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <Users className='h-6 w-6 text-green-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                About H3 Network
                            </h2>
                        </div>
                        <p className='text-gray-700 leading-relaxed'>
                            H3 Network is a community platform dedicated to
                            providing Hope, Help, and Humor for justice-impacted
                            individuals and their families. We offer educational
                            content, support resources, and a space for sharing
                            experiences related to criminal justice reform,
                            addiction recovery, and successful reentry into
                            society.
                        </p>
                    </section>

                    {/* User Accounts */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <Shield className='h-6 w-6 text-purple-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                User Accounts and Responsibilities
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Account Creation
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>
                                        • You must be at least 13 years old to
                                        create an account
                                    </li>
                                    <li>
                                        • You must provide accurate and complete
                                        information
                                    </li>
                                    <li>
                                        • You are responsible for maintaining
                                        the security of your account
                                    </li>
                                    <li>
                                        • You may not create multiple accounts
                                        or impersonate others
                                    </li>
                                    <li>
                                        • You may use a pseudonym if preferred
                                        for privacy reasons
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Account Security
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>• Choose a strong, unique password</li>
                                    <li>
                                        • Do not share your account credentials
                                        with others
                                    </li>
                                    <li>
                                        • Notify us immediately of any
                                        unauthorized use
                                    </li>
                                    <li>
                                        • You are responsible for all activities
                                        under your account
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Community Guidelines */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <BookOpen className='h-6 w-6 text-indigo-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Community Guidelines and Content Standards
                            </h2>
                        </div>
                        <div className='space-y-6'>
                            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                                <h3 className='text-lg font-semibold text-green-800 mb-2'>
                                    What We Encourage
                                </h3>
                                <ul className='space-y-1 text-green-700 ml-4'>
                                    <li>
                                        • Sharing personal experiences and
                                        stories of hope
                                    </li>
                                    <li>
                                        • Providing helpful resources and
                                        information
                                    </li>
                                    <li>
                                        • Supporting fellow community members
                                    </li>
                                    <li>
                                        • Educational content about criminal
                                        justice reform
                                    </li>
                                    <li>
                                        • Constructive discussions and
                                        respectful dialogue
                                    </li>
                                    <li>• Humor that uplifts and brings joy</li>
                                </ul>
                            </div>

                            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                                <h3 className='text-lg font-semibold text-red-800 mb-2'>
                                    Prohibited Content and Behavior
                                </h3>
                                <ul className='space-y-1 text-red-700 ml-4'>
                                    <li>
                                        • Harassment, bullying, or threatening
                                        behavior
                                    </li>
                                    <li>
                                        • Hate speech or discrimination based on
                                        any protected characteristic
                                    </li>
                                    <li>
                                        • Illegal activities or content that
                                        promotes illegal behavior
                                    </li>
                                    <li>
                                        • Spam, misleading information, or
                                        fraudulent content
                                    </li>
                                    <li>
                                        • Explicit sexual content or
                                        inappropriate material
                                    </li>
                                    <li>
                                        • Content that could compromise
                                        someone&apos;s safety or privacy
                                    </li>
                                    <li>
                                        • Doxxing or sharing personal
                                        information without consent
                                    </li>
                                    <li>
                                        • Copyright infringement or unauthorized
                                        use of others&apos; content
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Content Ownership and Licensing */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Content Ownership and Licensing
                        </h2>
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Your Content
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>
                                        • You retain ownership of content you
                                        create and share
                                    </li>
                                    <li>
                                        • You grant H3 Network a license to
                                        host, display, and share your content
                                    </li>
                                    <li>
                                        • You represent that you have the right
                                        to share all content you post
                                    </li>
                                    <li>
                                        • You are responsible for ensuring your
                                        content doesn&apos;t infringe on
                                        others&apos; rights
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Our Content
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>
                                        • H3 Network content is protected by
                                        copyright and other intellectual
                                        property rights
                                    </li>
                                    <li>
                                        • You may not copy, distribute, or
                                        create derivative works without
                                        permission
                                    </li>
                                    <li>
                                        • You may share links to our content for
                                        non-commercial purposes
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Creator Program */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Creator Program
                        </h2>
                        <div className='space-y-4'>
                            <p className='text-gray-700'>
                                Our Creator Program allows qualified individuals
                                to contribute educational and inspirational
                                content to our platform.
                            </p>
                            <ul className='space-y-2 text-gray-700 ml-4'>
                                <li>
                                    • Creators must apply and be approved before
                                    publishing content
                                </li>
                                <li>
                                    • All content is subject to review and
                                    approval
                                </li>
                                <li>
                                    • Creators must comply with our content
                                    guidelines and quality standards
                                </li>
                                <li>
                                    • We reserve the right to remove creators
                                    from the program for violations
                                </li>
                                <li>
                                    • Creators retain ownership of their content
                                    while granting us usage rights
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Privacy and Data Protection */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Privacy and Data Protection
                        </h2>
                        <p className='text-gray-700'>
                            Your privacy is important to us. Our use of your
                            information is governed by our{' '}
                            <a
                                href='/privacy'
                                className='text-blue-600 hover:underline'
                            >
                                Privacy Policy
                            </a>
                            , which is incorporated into these Terms by
                            reference.
                        </p>
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
                            <p className='text-blue-800'>
                                <strong>Special Note:</strong> We understand the
                                unique privacy concerns of justice-impacted
                                individuals. We are committed to protecting your
                                identity and will not voluntarily share
                                information with law enforcement unless legally
                                required to do so.
                            </p>
                        </div>
                    </section>

                    {/* Platform Rules and Enforcement */}
                    <section>
                        <div className='flex items-center gap-3 mb-4'>
                            <AlertTriangle className='h-6 w-6 text-orange-600' />
                            <h2 className='text-2xl font-semibold text-gray-900'>
                                Platform Rules and Enforcement
                            </h2>
                        </div>
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Content Moderation
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>
                                        • We review content for compliance with
                                        our guidelines
                                    </li>
                                    <li>
                                        • We may remove content that violates
                                        our Terms
                                    </li>
                                    <li>
                                        • Users can report inappropriate content
                                    </li>
                                    <li>
                                        • We aim to be fair and transparent in
                                        our moderation decisions
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Enforcement Actions
                                </h3>
                                <p className='text-gray-700 mb-3'>
                                    Violations of these Terms may result in:
                                </p>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>• Content removal</li>
                                    <li>
                                        • Temporary suspension of account
                                        privileges
                                    </li>
                                    <li>• Permanent account termination</li>
                                    <li>• Removal from creator programs</li>
                                    <li>
                                        • Legal action in cases of severe
                                        violations
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Disclaimers */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Disclaimers and Limitations
                        </h2>
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Educational Purpose
                                </h3>
                                <p className='text-gray-700'>
                                    Content on H3 Network is for educational and
                                    informational purposes only. It should not
                                    be considered as:
                                </p>
                                <ul className='space-y-2 text-gray-700 ml-4 mt-2'>
                                    <li>
                                        • Legal advice (consult with qualified
                                        attorneys for legal matters)
                                    </li>
                                    <li>
                                        • Medical or mental health advice (seek
                                        professional healthcare providers)
                                    </li>
                                    <li>
                                        • Financial advice (consult qualified
                                        financial advisors)
                                    </li>
                                    <li>• Guaranteed outcomes or results</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Platform Availability
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>
                                        • We strive for 99.9% uptime but cannot
                                        guarantee uninterrupted service
                                    </li>
                                    <li>
                                        • We may perform maintenance that
                                        temporarily affects access
                                    </li>
                                    <li>
                                        • We are not liable for losses due to
                                        platform unavailability
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Termination */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Termination
                        </h2>
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Your Right to Terminate
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>
                                        • You may delete your account at any
                                        time
                                    </li>
                                    <li>
                                        • You may request deletion of your
                                        personal data
                                    </li>
                                    <li>
                                        • Termination does not affect content
                                        you&apos;ve already shared publicly
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900 mb-3'>
                                    Our Right to Terminate
                                </h3>
                                <ul className='space-y-2 text-gray-700 ml-4'>
                                    <li>
                                        • We may suspend or terminate accounts
                                        for Terms violations
                                    </li>
                                    <li>
                                        • We may discontinue the Platform with
                                        reasonable notice
                                    </li>
                                    <li>
                                        • We will provide data export options
                                        when feasible
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Changes to Terms
                        </h2>
                        <p className='text-gray-700'>
                            We may update these Terms from time to time. We will
                            notify users of significant changes through:
                        </p>
                        <ul className='space-y-2 text-gray-700 ml-4 mt-2'>
                            <li>• Email notifications to registered users</li>
                            <li>• Prominent notices on our website</li>
                            <li>• Updates to this page with revision dates</li>
                        </ul>
                        <p className='text-gray-700 mt-4'>
                            Continued use of the Platform after changes
                            constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Contact Us
                        </h2>
                        <div className='bg-gray-50 rounded-lg p-6'>
                            <p className='text-gray-700 mb-4'>
                                If you have questions about these Terms or need
                                to report violations:
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
                                    <strong>Subject Line:</strong> &quot;Terms
                                    of Service Question&quot; or &quot;Community
                                    Guidelines Violation&quot;
                                </p>
                            </div>
                            <p className='text-sm text-gray-600 mt-4'>
                                We will respond to inquiries within 2-3 business
                                days.
                            </p>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Governing Law
                        </h2>
                        <p className='text-gray-700'>
                            These Terms are governed by the laws of the United
                            States. Any disputes will be resolved through
                            good-faith negotiation or, if necessary, through
                            arbitration or courts in the appropriate
                            jurisdiction.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

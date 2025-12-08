'use client';

import {
    Mail,
    MessageCircle,
    Clock,
    Send,
    Youtube,
    Instagram,
    Linkedin,
} from 'lucide-react';
import { useState } from 'react';
import { isInsideMode } from '@/lib/inside-mode';

export default function ContactPage() {
    const insideMode = isInsideMode();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSubmitted(true);
        setIsSubmitting(false);
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            type: 'general',
        });
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white shadow-sm border-b'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='text-center'>
                        <div className='flex items-center justify-center gap-4 mb-4'>
                            <MessageCircle className='h-8 w-8 text-blue-600' />
                            <h1 className='text-3xl font-bold text-gray-900'>
                                Contact Us
                            </h1>
                        </div>
                        <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
                            We&apos;d love to hear from you! Whether you have
                            questions, want to share your story, or are
                            interested in contributing content, we&apos;re here
                            to help.
                        </p>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <div className='grid lg:grid-cols-2 gap-12'>
                    {/* Contact Information */}
                    <div className='space-y-8'>
                        <div>
                            <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
                                Get In Touch
                            </h2>
                            <div className='space-y-6'>
                                {/* Email */}
                                <div className='flex items-start gap-4'>
                                    <div className='bg-blue-100 p-3 rounded-lg'>
                                        <Mail className='h-6 w-6 text-blue-600' />
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-gray-900 mb-1'>
                                            Email Us
                                        </h3>
                                        <p className='text-gray-600 mb-2'>
                                            Send us a message and we&apos;ll
                                            respond within 24-48 hours
                                        </p>
                                        <a
                                            href='mailto:hopehelphumor.network@gmail.com'
                                            className='text-blue-600 hover:underline font-medium'
                                        >
                                            hopehelphumor.network@gmail.com
                                        </a>
                                    </div>
                                </div>

                                {/* Response Time */}
                                <div className='flex items-start gap-4'>
                                    <div className='bg-green-100 p-3 rounded-lg'>
                                        <Clock className='h-6 w-6 text-green-600' />
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-gray-900 mb-1'>
                                            Response Time
                                        </h3>
                                        <p className='text-gray-600'>
                                            We typically respond to messages
                                            within 24-48 hours during business
                                            days. For urgent matters, please
                                            indicate &quot;URGENT&quot; in your
                                            subject line.
                                        </p>
                                    </div>
                                </div>

                                {/* Community Guidelines */}
                                <div className='flex items-start gap-4'>
                                    <div className='bg-purple-100 p-3 rounded-lg'>
                                        <MessageCircle className='h-6 w-6 text-purple-600' />
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-gray-900 mb-1'>
                                            Community Support
                                        </h3>
                                        <p className='text-gray-600'>
                                            Need help navigating our platform or
                                            community? We&apos;re here to help
                                            you make the most of your H3 Network
                                            experience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media - Hidden in Inside Mode */}
                        {!insideMode && (
                            <div>
                                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                                    Follow Us
                                </h3>
                                <div className='flex gap-4'>
                                    <a
                                        href='http://www.youtube.com/@hopehelphumor'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='bg-red-100 p-3 rounded-lg hover:bg-red-200 transition-colors'
                                        aria-label='YouTube'
                                    >
                                        <Youtube className='h-6 w-6 text-red-600' />
                                    </a>
                                    <a
                                        href='http://www.instagram.com/hopehelphumor'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='bg-pink-100 p-3 rounded-lg hover:bg-pink-200 transition-colors'
                                        aria-label='Instagram'
                                    >
                                        <Instagram className='h-6 w-6 text-pink-600' />
                                    </a>
                                    <a
                                        href='https://www.linkedin.com/company/hopehelphumor-network/'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='bg-blue-100 p-3 rounded-lg hover:bg-blue-200 transition-colors'
                                        aria-label='LinkedIn'
                                    >
                                        <Linkedin className='h-6 w-6 text-blue-600' />
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Content Submission - Hidden in Inside Mode */}
                        {!insideMode && (
                            <div className='bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                                    Want to Share Your Story?
                                </h3>
                                <p className='text-gray-700 mb-4'>
                                    We&apos;re always looking for authentic
                                    voices and inspiring content. If you have a
                                    story to tell or want to contribute to our
                                    community, we&apos;d love to hear from you.
                                </p>
                                <a
                                    href='https://hopehelphumor.com/wp-content/uploads/2025/08/H3-Network_Pitch-1.pdf'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors'
                                >
                                    Pitch Your Content
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Contact Form */}
                    <div className='bg-white rounded-lg shadow-sm p-8'>
                        {submitted ? (
                            <div className='text-center py-8'>
                                <div className='bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                                    <Send className='h-8 w-8 text-green-600' />
                                </div>
                                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                                    Message Sent!
                                </h3>
                                <p className='text-gray-600 mb-4'>
                                    Thank you for reaching out. We&apos;ll get
                                    back to you within 24-48 hours.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className='text-blue-600 hover:underline'
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
                                    Send Us a Message
                                </h2>

                                <form
                                    onSubmit={handleSubmit}
                                    className='space-y-6'
                                >
                                    {/* Contact Type */}
                                    <div>
                                        <label
                                            htmlFor='type'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            What can we help you with?
                                        </label>
                                        <select
                                            id='type'
                                            name='type'
                                            value={formData.type}
                                            onChange={handleChange}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        >
                                            <option value='general'>
                                                General Question
                                            </option>
                                            <option value='content'>
                                                Content Submission
                                            </option>
                                            <option value='creator'>
                                                Creator Program
                                            </option>
                                            <option value='technical'>
                                                Technical Support
                                            </option>
                                            <option value='community'>
                                                Community Guidelines
                                            </option>
                                            <option value='partnership'>
                                                Partnership Opportunity
                                            </option>
                                            <option value='feedback'>
                                                Feedback/Suggestion
                                            </option>
                                        </select>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label
                                            htmlFor='name'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            Name{' '}
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type='text'
                                            id='name'
                                            name='name'
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            placeholder='Your name'
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor='email'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            Email{' '}
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type='email'
                                            id='email'
                                            name='email'
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            placeholder='your.email@example.com'
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label
                                            htmlFor='subject'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            Subject{' '}
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type='text'
                                            id='subject'
                                            name='subject'
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            placeholder='Brief description of your message'
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label
                                            htmlFor='message'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            Message{' '}
                                            <span className='text-red-500'>
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            id='message'
                                            name='message'
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            placeholder='Please share your message, question, or feedback...'
                                        />
                                    </div>

                                    {/* Privacy Note */}
                                    <div className='bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-600'>
                                        <p>
                                            <strong>Privacy Note:</strong> We
                                            respect your privacy and will only
                                            use your contact information to
                                            respond to your message. We do not
                                            share your information with third
                                            parties. See our{' '}
                                            <a
                                                href='/privacy'
                                                className='text-blue-600 hover:underline'
                                            >
                                                Privacy Policy
                                            </a>{' '}
                                            for details.
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className='h-4 w-4' />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className='mt-16 bg-white rounded-lg shadow-sm p-8'>
                    <h2 className='text-2xl font-semibold text-gray-900 mb-6 text-center'>
                        Frequently Asked Questions
                    </h2>
                    <div className='grid md:grid-cols-2 gap-8'>
                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                How can I become a content creator?
                            </h3>
                            <p className='text-gray-600'>
                                We&apos;re always looking for authentic voices!
                                Review our content guidelines and submit your
                                pitch using our Creator Application form. We
                                look for stories of hope, educational content,
                                and positive humor.
                            </p>
                        </div>

                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                Is my personal information safe?
                            </h3>
                            <p className='text-gray-600'>
                                Absolutely. We understand the unique privacy
                                concerns of justice-impacted individuals and
                                take security seriously. Review our Privacy
                                Policy for complete details on how we protect
                                your information.
                            </p>
                        </div>

                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                How can I support the H3 Network mission?
                            </h3>
                            <p className='text-gray-600'>
                                You can support us by sharing our content,
                                engaging with our community, subscribing to our
                                newsletter, following us on social media, and
                                spreading awareness about our mission.
                            </p>
                        </div>

                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                Can I share my story anonymously?
                            </h3>
                            <p className='text-gray-600'>
                                Yes! We understand that many community members
                                prefer to maintain their privacy. We can work
                                with you to share your story while protecting
                                your identity if needed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

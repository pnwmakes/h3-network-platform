'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Heart,
    HandHeart,
    Smile,
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    BookOpen,
    Users,
    Target,
} from 'lucide-react';

interface GuidelineSection {
    icon: React.ReactNode;
    title: string;
    description: string;
    principles: string[];
    examples: {
        good: string[];
        avoid: string[];
    };
    tips: string[];
}

export function ContentGuidelines() {
    const [completedSections, setCompletedSections] = useState<Set<string>>(
        new Set()
    );

    const markSectionComplete = (sectionId: string) => {
        setCompletedSections((prev) => new Set([...prev, sectionId]));
    };

    const guidelines: GuidelineSection[] = [
        {
            icon: <Heart className='h-6 w-6 text-red-500' />,
            title: 'Hope',
            description:
                'Content that inspires and uplifts our community with stories of transformation, resilience, and positive possibilities.',
            principles: [
                'Share personal stories of transformation and growth',
                'Highlight positive outcomes and success stories',
                'Focus on possibilities rather than limitations',
                'Celebrate small victories and progress',
                'Provide encouragement for difficult journeys',
            ],
            examples: {
                good: [
                    'Your journey from incarceration to becoming a community leader',
                    'How you rebuilt relationships with family after release',
                    'Career success stories after reentry challenges',
                    'Educational achievements despite past obstacles',
                    'Mental health recovery and healing processes',
                ],
                avoid: [
                    'Graphic details of traumatic experiences without context',
                    'Content that might trigger trauma responses',
                    'Focusing solely on negative experiences',
                    "Comparing trauma or 'trauma Olympics'",
                    "Promising unrealistic outcomes or 'quick fixes'",
                ],
            },
            tips: [
                'Always provide context for difficult experiences',
                'Include resources or next steps in hopeful content',
                'Share what you learned, not just what you went through',
                "Consider your audience's emotional state",
                'Balance honesty with hope',
            ],
        },
        {
            icon: <HandHeart className='h-6 w-6 text-green-500' />,
            title: 'Help',
            description:
                'Practical, actionable content that provides real assistance to people navigating the criminal justice system, recovery, or reentry.',
            principles: [
                'Provide specific, actionable advice and resources',
                'Share practical tools and strategies that work',
                'Connect people with helpful services and programs',
                'Explain complex systems in accessible ways',
                'Offer step-by-step guidance for common challenges',
            ],
            examples: {
                good: [
                    'Step-by-step guide to finding employment after incarceration',
                    'How to navigate parole requirements effectively',
                    'Resources for addiction recovery support groups',
                    'Financial literacy for people rebuilding their lives',
                    'Legal aid resources and how to access them',
                ],
                avoid: [
                    'Specific legal advice (always recommend consulting attorneys)',
                    'Outdated information about laws or programs',
                    'Advice outside your area of expertise',
                    'Promoting specific businesses without disclosure',
                    'Medical or mental health advice (refer to professionals)',
                ],
            },
            tips: [
                'Always include current contact information for resources',
                'Verify information before sharing',
                'Acknowledge when advice is based on personal experience vs. professional expertise',
                'Provide multiple options when possible',
                'Include accessibility information for resources',
            ],
        },
        {
            icon: <Smile className='h-6 w-6 text-yellow-500' />,
            title: 'Humor',
            description:
                'Healing humor that builds resilience, creates connection, and provides healthy emotional relief while remaining sensitive to trauma.',
            principles: [
                'Use humor to heal, not harm',
                'Make light of situations, not people',
                'Build community through shared experiences',
                'Provide emotional relief and stress reduction',
                'Maintain dignity and respect in all humor',
            ],
            examples: {
                good: [
                    'Funny observations about reentry culture shock',
                    'Lighthearted takes on parole officer meetings',
                    'Humorous stories about learning new technology',
                    'Self-deprecating humor about your own journey',
                    'Funny misconceptions people have about the justice system',
                ],
                avoid: [
                    'Jokes that mock victims or perpetuate harm',
                    'Humor that reinforces negative stereotypes',
                    "Making light of others' trauma or pain",
                    'Jokes about ongoing addiction or mental health crises',
                    'Content that could trigger trauma responses',
                ],
            },
            tips: [
                'Test humor with trusted community members first',
                'Consider how your humor might affect different audiences',
                'Use humor to humanize, not minimize experiences',
                'Be especially careful with dark humor',
                'Remember that healing humor builds up, never tears down',
            ],
        },
    ];

    const communityStandards = [
        {
            title: 'Respect & Dignity',
            description:
                'Treat all community members with respect, regardless of their background or current situation.',
            icon: <Users className='h-5 w-5' />,
        },
        {
            title: 'Privacy & Safety',
            description:
                'Protect personal information and avoid sharing details that could compromise safety.',
            icon: <Shield className='h-5 w-5' />,
        },
        {
            title: 'Accuracy & Honesty',
            description:
                'Share truthful information and clearly distinguish between personal experience and professional advice.',
            icon: <Target className='h-5 w-5' />,
        },
        {
            title: 'Constructive Communication',
            description:
                'Focus on building up the community rather than tearing down individuals or systems.',
            icon: <BookOpen className='h-5 w-5' />,
        },
    ];

    const contentTypes = [
        {
            type: 'Personal Stories',
            guidelines: [
                'Focus on your own experiences and perspectives',
                'Provide context for difficult experiences',
                'Include lessons learned or growth achieved',
                "Consider your audience's emotional readiness",
            ],
        },
        {
            type: 'Educational Content',
            guidelines: [
                'Verify facts and provide sources when possible',
                'Explain complex topics in accessible language',
                'Include multiple perspectives when relevant',
                'Update information regularly to maintain accuracy',
            ],
        },
        {
            type: 'Resource Sharing',
            guidelines: [
                'Provide current and accurate contact information',
                'Include accessibility information',
                'Mention any costs or requirements upfront',
                'Test resources yourself when possible',
            ],
        },
        {
            type: 'Community Support',
            guidelines: [
                'Encourage without making promises',
                'Refer to professionals for specialized needs',
                'Create safe spaces for vulnerable sharing',
                'Model healthy communication and boundaries',
            ],
        },
    ];

    return (
        <div className='max-w-4xl mx-auto space-y-6'>
            {/* Header */}
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                    H3 Network Content Guidelines
                </h1>
                <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                    Creating content that brings Hope, Help, and Humor to our
                    community while maintaining safety, dignity, and impact.
                </p>
            </div>

            {/* Progress Indicator */}
            <Card>
                <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h3 className='font-semibold text-lg'>
                                Guidelines Progress
                            </h3>
                            <p className='text-gray-600'>
                                Complete all sections to begin creating content
                            </p>
                        </div>
                        <div className='text-right'>
                            <div className='text-2xl font-bold text-blue-600'>
                                {completedSections.size}/6
                            </div>
                            <div className='text-sm text-gray-500'>
                                Sections Complete
                            </div>
                        </div>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-3 mt-4'>
                        <div
                            className='bg-blue-500 h-3 rounded-full transition-all duration-300'
                            style={{
                                width: `${(completedSections.size / 6) * 100}%`,
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue='hope' className='w-full'>
                <TabsList className='grid grid-cols-4 w-full mb-8'>
                    <TabsTrigger
                        value='hope'
                        className='flex items-center gap-2'
                    >
                        <Heart className='h-4 w-4' />
                        Hope
                    </TabsTrigger>
                    <TabsTrigger
                        value='help'
                        className='flex items-center gap-2'
                    >
                        <HandHeart className='h-4 w-4' />
                        Help
                    </TabsTrigger>
                    <TabsTrigger
                        value='humor'
                        className='flex items-center gap-2'
                    >
                        <Smile className='h-4 w-4' />
                        Humor
                    </TabsTrigger>
                    <TabsTrigger
                        value='community'
                        className='flex items-center gap-2'
                    >
                        <Users className='h-4 w-4' />
                        Community
                    </TabsTrigger>
                </TabsList>

                {/* Hope, Help, Humor Guidelines */}
                {guidelines.map((guideline, index) => (
                    <TabsContent
                        key={index}
                        value={guideline.title.toLowerCase()}
                    >
                        <Card>
                            <CardHeader>
                                <div className='flex items-center gap-3'>
                                    {guideline.icon}
                                    <CardTitle className='text-2xl'>
                                        {guideline.title}
                                    </CardTitle>
                                    {completedSections.has(guideline.title) && (
                                        <CheckCircle className='h-6 w-6 text-green-500' />
                                    )}
                                </div>
                                <p className='text-gray-600 text-lg'>
                                    {guideline.description}
                                </p>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                {/* Core Principles */}
                                <div>
                                    <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
                                        <Target className='h-5 w-5' />
                                        Core Principles
                                    </h3>
                                    <ul className='space-y-2'>
                                        {guideline.principles.map(
                                            (principle, idx) => (
                                                <li
                                                    key={idx}
                                                    className='flex items-start gap-2'
                                                >
                                                    <CheckCircle className='h-5 w-5 text-green-500 mt-0.5 flex-shrink-0' />
                                                    <span>{principle}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                {/* Examples */}
                                <div className='grid md:grid-cols-2 gap-6'>
                                    <div>
                                        <h4 className='font-semibold text-green-700 mb-3 flex items-center gap-2'>
                                            <CheckCircle className='h-5 w-5' />
                                            Great Examples
                                        </h4>
                                        <ul className='space-y-2'>
                                            {guideline.examples.good.map(
                                                (example, idx) => (
                                                    <li
                                                        key={idx}
                                                        className='flex items-start gap-2 text-sm'
                                                    >
                                                        <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0' />
                                                        <span>{example}</span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className='font-semibold text-red-700 mb-3 flex items-center gap-2'>
                                            <XCircle className='h-5 w-5' />
                                            Avoid These
                                        </h4>
                                        <ul className='space-y-2'>
                                            {guideline.examples.avoid.map(
                                                (example, idx) => (
                                                    <li
                                                        key={idx}
                                                        className='flex items-start gap-2 text-sm'
                                                    >
                                                        <div className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0' />
                                                        <span>{example}</span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Pro Tips */}
                                <div>
                                    <h4 className='font-semibold text-blue-700 mb-3 flex items-center gap-2'>
                                        <AlertTriangle className='h-5 w-5' />
                                        Pro Tips
                                    </h4>
                                    <div className='grid sm:grid-cols-2 gap-3'>
                                        {guideline.tips.map((tip, idx) => (
                                            <div
                                                key={idx}
                                                className='bg-blue-50 p-3 rounded-lg border border-blue-200'
                                            >
                                                <p className='text-sm text-blue-800'>
                                                    {tip}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='flex justify-end pt-4'>
                                    <Button
                                        onClick={() =>
                                            markSectionComplete(guideline.title)
                                        }
                                        disabled={completedSections.has(
                                            guideline.title
                                        )}
                                    >
                                        {completedSections.has(
                                            guideline.title
                                        ) ? (
                                            <>
                                                <CheckCircle className='mr-2 h-4 w-4' />
                                                Completed
                                            </>
                                        ) : (
                                            <>Mark as Complete</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}

                {/* Community Standards */}
                <TabsContent value='community'>
                    <div className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-2xl flex items-center gap-3'>
                                    <Users className='h-6 w-6 text-blue-500' />
                                    Community Standards
                                    {completedSections.has('community') && (
                                        <CheckCircle className='h-6 w-6 text-green-500' />
                                    )}
                                </CardTitle>
                                <p className='text-gray-600 text-lg'>
                                    Building a safe, supportive community for
                                    everyone affected by the criminal justice
                                    system.
                                </p>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid gap-4'>
                                    {communityStandards.map((standard, idx) => (
                                        <div
                                            key={idx}
                                            className='flex gap-4 p-4 bg-gray-50 rounded-lg'
                                        >
                                            <div className='flex-shrink-0 text-blue-500'>
                                                {standard.icon}
                                            </div>
                                            <div>
                                                <h4 className='font-semibold text-lg'>
                                                    {standard.title}
                                                </h4>
                                                <p className='text-gray-600'>
                                                    {standard.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex justify-end pt-4'>
                                    <Button
                                        onClick={() =>
                                            markSectionComplete('community')
                                        }
                                        disabled={completedSections.has(
                                            'community'
                                        )}
                                    >
                                        {completedSections.has('community') ? (
                                            <>
                                                <CheckCircle className='mr-2 h-4 w-4' />
                                                Completed
                                            </>
                                        ) : (
                                            <>Mark as Complete</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content Types */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-xl flex items-center gap-3'>
                                    <BookOpen className='h-6 w-6 text-purple-500' />
                                    Content Type Guidelines
                                    {completedSections.has('content-types') && (
                                        <CheckCircle className='h-6 w-6 text-green-500' />
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid md:grid-cols-2 gap-6'>
                                    {contentTypes.map((contentType, idx) => (
                                        <div
                                            key={idx}
                                            className='border border-gray-200 rounded-lg p-4'
                                        >
                                            <h4 className='font-semibold text-lg mb-3'>
                                                {contentType.type}
                                            </h4>
                                            <ul className='space-y-2'>
                                                {contentType.guidelines.map(
                                                    (guideline, gIdx) => (
                                                        <li
                                                            key={gIdx}
                                                            className='flex items-start gap-2 text-sm'
                                                        >
                                                            <div className='w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0' />
                                                            <span>
                                                                {guideline}
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex justify-end pt-6'>
                                    <Button
                                        onClick={() =>
                                            markSectionComplete('content-types')
                                        }
                                        disabled={completedSections.has(
                                            'content-types'
                                        )}
                                    >
                                        {completedSections.has(
                                            'content-types'
                                        ) ? (
                                            <>
                                                <CheckCircle className='mr-2 h-4 w-4' />
                                                Completed
                                            </>
                                        ) : (
                                            <>Mark as Complete</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Completion Status */}
            {completedSections.size === 6 && (
                <Card className='bg-green-50 border-green-200'>
                    <CardContent className='p-6 text-center'>
                        <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
                        <h3 className='text-xl font-semibold text-green-800 mb-2'>
                            🎉 Guidelines Complete!
                        </h3>
                        <p className='text-green-700 mb-4'>
                            You&apos;re ready to start creating meaningful
                            content for the H3 Network community.
                        </p>
                        <Button className='bg-green-600 hover:bg-green-700'>
                            Start Creating Content
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

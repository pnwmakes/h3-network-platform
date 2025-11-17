'use client';

import { useState } from 'react';
import { CreatorOnboardingForm } from '@/components/creator/CreatorOnboardingForm';
import { ContentGuidelines } from '@/components/creator/ContentGuidelines';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Video,
    Users,
    Target,
} from 'lucide-react';

type OnboardingStep =
    | 'welcome'
    | 'guidelines'
    | 'profile'
    | 'tour'
    | 'complete';

interface OnboardingProgress {
    step: OnboardingStep;
    completed: Set<string>;
}

export function EnhancedCreatorOnboarding() {
    const [progress, setProgress] = useState<OnboardingProgress>({
        step: 'welcome',
        completed: new Set(),
    });

    const steps = [
        {
            id: 'welcome',
            title: 'Welcome to H3 Network',
            description: 'Learn about our mission and community',
            icon: <Users className='h-6 w-6' />,
        },
        {
            id: 'guidelines',
            title: 'Content Guidelines',
            description: 'Understanding Hope, Help, and Humor',
            icon: <BookOpen className='h-6 w-6' />,
        },
        {
            id: 'profile',
            title: 'Create Your Profile',
            description: 'Set up your creator identity',
            icon: <Target className='h-6 w-6' />,
        },
        {
            id: 'tour',
            title: 'Platform Tour',
            description: 'Learn how to create and share content',
            icon: <Video className='h-6 w-6' />,
        },
    ];

    const currentStepIndex = steps.findIndex(
        (step) => step.id === progress.step
    );

    const nextStep = () => {
        const currentIndex = steps.findIndex(
            (step) => step.id === progress.step
        );
        if (currentIndex < steps.length - 1) {
            setProgress((prev) => ({
                ...prev,
                step: steps[currentIndex + 1].id as OnboardingStep,
                completed: new Set([...prev.completed, progress.step]),
            }));
        } else {
            setProgress((prev) => ({
                ...prev,
                step: 'complete',
                completed: new Set([...prev.completed, progress.step]),
            }));
        }
    };

    const prevStep = () => {
        const currentIndex = steps.findIndex(
            (step) => step.id === progress.step
        );
        if (currentIndex > 0) {
            setProgress((prev) => ({
                ...prev,
                step: steps[currentIndex - 1].id as OnboardingStep,
            }));
        }
    };

    const renderWelcomeStep = () => (
        <div className='text-center space-y-8'>
            <div className='space-y-4'>
                <h1 className='text-4xl font-bold h3-text-gradient'>
                    Welcome to H3 Network!
                </h1>
                <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
                    You&apos;re joining a community focused on bringing Hope,
                    Help, and Humor to people affected by the criminal justice
                    system.
                </p>
            </div>

            <div className='grid md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
                <Card className='border-red-200 bg-red-50'>
                    <CardContent className='p-6 text-center'>
                        <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <span className='text-2xl text-white'>💝</span>
                        </div>
                        <h3 className='font-semibold text-lg mb-2 text-red-800'>
                            Hope
                        </h3>
                        <p className='text-red-700 text-sm'>
                            Share stories of transformation, resilience, and
                            positive possibilities that inspire our community.
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-green-200 bg-green-50'>
                    <CardContent className='p-6 text-center'>
                        <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <span className='text-2xl text-white'>🤝</span>
                        </div>
                        <h3 className='font-semibold text-lg mb-2 text-green-800'>
                            Help
                        </h3>
                        <p className='text-green-700 text-sm'>
                            Provide practical resources, guidance, and support
                            for reentry, recovery, and navigating the system.
                        </p>
                    </CardContent>
                </Card>

                <Card className='border-yellow-200 bg-yellow-50'>
                    <CardContent className='p-6 text-center'>
                        <div className='w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <span className='text-2xl text-white'>😄</span>
                        </div>
                        <h3 className='font-semibold text-lg mb-2 text-yellow-800'>
                            Humor
                        </h3>
                        <p className='text-yellow-700 text-sm'>
                            Use healing humor to build resilience, create
                            connection, and provide healthy emotional relief.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className='space-y-4'>
                <h2 className='text-2xl font-semibold'>Your Story Matters</h2>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                    Whether you&apos;re formerly incarcerated, work within the
                    criminal justice system, are in recovery, or support reform
                    efforts - your voice and experiences can create real change
                    and help others on their journey.
                </p>
            </div>

            <div className='flex justify-center'>
                <Button
                    onClick={nextStep}
                    size='lg'
                    className='text-lg px-8 py-3'
                >
                    I&apos;m Ready to Get Started
                    <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
            </div>
        </div>
    );

    const renderPlatformTour = () => (
        <div className='text-center space-y-8'>
            <div className='space-y-4'>
                <h1 className='text-3xl font-bold'>Platform Tour</h1>
                <p className='text-xl text-gray-600'>
                    Learn how to create and manage your content on H3 Network
                </p>
            </div>

            <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
                <Card>
                    <CardContent className='p-6 space-y-4'>
                        <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto'>
                            <Video className='h-6 w-6 text-white' />
                        </div>
                        <h3 className='font-semibold text-lg'>
                            Content Creation
                        </h3>
                        <p className='text-gray-600 text-sm'>
                            Upload videos directly or link from YouTube. Create
                            blog posts with rich text editing and media
                            integration.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='p-6 space-y-4'>
                        <div className='w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto'>
                            <Target className='h-6 w-6 text-white' />
                        </div>
                        <h3 className='font-semibold text-lg'>
                            Content Scheduling
                        </h3>
                        <p className='text-gray-600 text-sm'>
                            Plan your content releases with our visual calendar.
                            Schedule recurring posts and collaborate with other
                            creators.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='p-6 space-y-4'>
                        <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto'>
                            <Users className='h-6 w-6 text-white' />
                        </div>
                        <h3 className='font-semibold text-lg'>
                            Community Engagement
                        </h3>
                        <p className='text-gray-600 text-sm'>
                            Connect with your audience through comments, build
                            your following, and collaborate with other creators.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='p-6 space-y-4'>
                        <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto'>
                            <CheckCircle className='h-6 w-6 text-white' />
                        </div>
                        <h3 className='font-semibold text-lg'>
                            Content Review
                        </h3>
                        <p className='text-gray-600 text-sm'>
                            Your first few pieces of content will be reviewed by
                            our team to ensure they align with H3 Network
                            guidelines.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto'>
                <h3 className='font-semibold text-lg mb-2 text-blue-800'>
                    🌟 Creator Support
                </h3>
                <p className='text-blue-700 text-sm'>
                    You&apos;ll be paired with an experienced H3 Network creator
                    who can help guide you through your first few content pieces
                    and answer any questions you have about the platform.
                </p>
            </div>
        </div>
    );

    const renderCompleteStep = () => (
        <div className='text-center space-y-8'>
            <div className='space-y-4'>
                <div className='w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto'>
                    <CheckCircle className='h-12 w-12 text-white' />
                </div>
                <h1 className='text-3xl font-bold text-green-800'>
                    🎉 Welcome to the H3 Family!
                </h1>
                <p className='text-xl text-gray-600'>
                    Your creator profile is complete and you&apos;re ready to
                    start sharing your story.
                </p>
            </div>

            <div className='bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto'>
                <h3 className='font-semibold text-lg mb-4 text-green-800'>
                    What happens next?
                </h3>
                <div className='text-left space-y-3 text-green-700'>
                    <div className='flex items-start gap-3'>
                        <CheckCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                        <p className='text-sm'>
                            You&apos;ll be paired with a mentor creator within
                            24 hours
                        </p>
                    </div>
                    <div className='flex items-start gap-3'>
                        <CheckCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                        <p className='text-sm'>
                            Your first 3 content pieces will be reviewed for
                            quality
                        </p>
                    </div>
                    <div className='flex items-start gap-3'>
                        <CheckCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                        <p className='text-sm'>
                            You&apos;ll receive feedback and support to help you
                            succeed
                        </p>
                    </div>
                    <div className='flex items-start gap-3'>
                        <CheckCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                        <p className='text-sm'>
                            After approval, you can publish content
                            independently
                        </p>
                    </div>
                </div>
            </div>

            <div className='flex justify-center'>
                <Button
                    size='lg'
                    className='text-lg px-8 py-3'
                    onClick={() =>
                        (window.location.href = '/creator/dashboard')
                    }
                >
                    Go to Creator Dashboard
                    <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (progress.step) {
            case 'welcome':
                return renderWelcomeStep();
            case 'guidelines':
                return <ContentGuidelines />;
            case 'profile':
                return <CreatorOnboardingForm />;
            case 'tour':
                return renderPlatformTour();
            case 'complete':
                return renderCompleteStep();
            default:
                return renderWelcomeStep();
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50'>
            {/* Progress Header */}
            {progress.step !== 'complete' && (
                <div className='bg-white border-b border-gray-200 px-4 py-6'>
                    <div className='max-w-4xl mx-auto'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold'>
                                Creator Onboarding
                            </h2>
                            <span className='text-sm text-gray-500'>
                                Step {currentStepIndex + 1} of {steps.length}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className='flex items-center space-x-4'>
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className='flex items-center flex-1'
                                >
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                            progress.completed.has(step.id)
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : progress.step === step.id
                                                ? 'border-blue-500 text-blue-500'
                                                : 'border-gray-300 text-gray-400'
                                        }`}
                                    >
                                        {progress.completed.has(step.id) ? (
                                            <CheckCircle className='h-5 w-5' />
                                        ) : (
                                            <span className='text-sm font-medium'>
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <div className='ml-3 min-w-0 flex-1'>
                                        <p
                                            className={`text-sm font-medium ${
                                                progress.step === step.id
                                                    ? 'text-blue-600'
                                                    : 'text-gray-900'
                                            }`}
                                        >
                                            {step.title}
                                        </p>
                                        <p className='text-xs text-gray-500'>
                                            {step.description}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`h-px bg-gray-300 flex-1 mx-4 ${
                                                progress.completed.has(step.id)
                                                    ? 'bg-green-500'
                                                    : ''
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className='flex-1 p-4'>
                <div className='max-w-6xl mx-auto'>
                    {renderCurrentStep()}

                    {/* Navigation for non-form steps */}
                    {progress.step !== 'profile' &&
                        progress.step !== 'complete' &&
                        progress.step !== 'guidelines' && (
                            <div className='flex justify-between mt-12 max-w-2xl mx-auto'>
                                {currentStepIndex > 0 ? (
                                    <Button
                                        variant='outline'
                                        onClick={prevStep}
                                    >
                                        <ArrowLeft className='mr-2 h-4 w-4' />
                                        Previous
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                <Button onClick={nextStep}>
                                    Next Step
                                    <ArrowRight className='ml-2 h-4 w-4' />
                                </Button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}

import { CreatorOnboardingForm } from '@/components/creator/CreatorOnboardingForm';

export default function CreatorOnboardingPage() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-2xl'>
                <div className='text-center mb-8'>
                    <h1 className='text-4xl font-bold h3-text-gradient mb-2'>
                        Welcome to H3 Network!
                    </h1>
                    <p className='text-xl text-gray-600 mb-6'>
                        Let&apos;s set up your creator profile so you can start
                        sharing your story
                    </p>
                    <div className='inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                        🎉 You&apos;re almost ready to create content!
                    </div>
                </div>
                <CreatorOnboardingForm />
            </div>
        </div>
    );
}

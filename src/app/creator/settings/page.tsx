export default function CreatorSettingsPage() {
    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='border-b border-gray-200 pb-5'>
                <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                    Creator Settings
                </h1>
                <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                    Manage your creator profile, notification preferences, and
                    platform settings.
                </p>
            </div>

            {/* Coming Soon */}
            <div className='text-center py-16'>
                <div className='mx-auto h-16 w-16 text-6xl mb-4'>⚙️</div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Creator Settings Coming Soon
                </h3>
                <p className='text-sm text-gray-500 mb-6 max-w-md mx-auto'>
                    We&apos;re building comprehensive settings to help you
                    customize your creator experience and manage your profile.
                </p>
                <div className='bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-lg mx-auto'>
                    <h4 className='font-medium text-purple-900 mb-2'>
                        Planned Settings Features:
                    </h4>
                    <ul className='text-sm text-purple-800 space-y-1 text-left'>
                        <li>• Profile & bio management</li>
                        <li>• Notification preferences</li>
                        <li>• Content visibility controls</li>
                        <li>• Social media integration</li>
                        <li>• Publishing defaults</li>
                        <li>• Account & privacy settings</li>
                    </ul>
                </div>
                <div className='mt-8'>
                    <p className='text-xs text-gray-400'>
                        For now, you can manage basic profile settings through
                        your{' '}
                        <a
                            href='/profile'
                            className='text-blue-600 hover:underline'
                        >
                            User Profile
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

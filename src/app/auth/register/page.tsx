import { RegistrationForm } from '@/components/auth/RegistrationForm';

export default function RegisterPage() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold h3-text-gradient mb-2'>
                        Join H3 Network
                    </h1>
                    <p className='text-gray-600'>
                        Connect with a community focused on hope, help, and
                        humor
                    </p>
                </div>
                <RegistrationForm />
            </div>
        </div>
    );
}

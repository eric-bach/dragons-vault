'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export default function FeedbackPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (value.length > 16) {
      setError('Username must be 16 characters or less');
      return false;
    }

    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      setError('Username must contain only letters and numbers');
      return false;
    }

    setError('');

    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setUsername(value);
    validateUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateUsername(username)) {
      setIsLoading(true);

      // Generate a UUID for the user
      const userId = crypto.randomUUID();

      // Store in localStorage
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);

      // Navigate to question page
      router.push('/feedback/question/1');
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-3xl font-bold text-center text-gray-900 mb-2'>Task Genie</h1>
          <p className='text-md text-center text-gray-900 mb-8'>Join the conversation</p>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label htmlFor='username' className='block text-sm font-medium text-gray-700'>
                Name
              </label>
              <Input
                id='username'
                type='text'
                placeholder='Enter your name'
                value={username}
                onChange={handleUsernameChange}
                minLength={3}
                maxLength={16}
                required
                disabled={isLoading}
                className={`w-full ${error ? 'border-red-500' : ''}`}
              />
              {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
            </div>

            <button
              type='submit'
              disabled={!!error || !username || isLoading}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { events } from 'aws-amplify/data';

export default function QuestionOnePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (usingAzureDevOps: boolean) => {
    setIsLoading(true);

    // Store the Azure DevOps usage preference in localStorage
    localStorage.setItem('usingAzureDevOps', usingAzureDevOps.toString());

    // Send to AppSync
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    const data = {
      uuid: userId,
      username: username,
      questionType: 'azure-devops',
      usingAzureDevOps: usingAzureDevOps,
      timestamp: new Date().toISOString(),
    };

    await events.post('questions/channel', { data: data });

    // Navigate to game page
    router.push('/feedback/question/2');
    setIsLoading(false);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-2xl font-bold text-center text-gray-900 mb-4'>Azure DevOps</h1>

          <div className='space-y-6'>
            <p className='text-md text-center text-gray-700 mb-6'>
              Are you currently using Azure DevOps for your work?
            </p>

            <div className='space-y-4'>
              <button
                onClick={() => handleResponse(true)}
                disabled={isLoading}
                className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Yes
              </button>

              <button
                onClick={() => handleResponse(false)}
                disabled={isLoading}
                className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

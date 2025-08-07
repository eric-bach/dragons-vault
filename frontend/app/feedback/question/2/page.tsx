'use client';

import { useEffect, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { events } from 'aws-amplify/data';

export default function QuestionPage() {
  const [user, setUser] = useState({
    uuid: '',
    username: '',
  });
  const [userComment, setUserComment] = useState('');
  const [taskGenieAnswer, setTaskGenieAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const savedAnswer = localStorage.getItem('interestInTaskGenie');

    setUser({
      uuid: userId ?? crypto.randomUUID(),
      username: username ?? 'Anonymous',
    });

    if (savedAnswer !== null) {
      setTaskGenieAnswer(savedAnswer === 'true');
    }
  }, []);

  const handleMessageSubmit = async () => {
    if (userComment.trim()) {
      // Send comment to WebSocket
      const data = {
        uuid: user.uuid,
        username: user.username,
        comment: userComment.trim(),
        timestamp: new Date().toISOString(),
      };

      await events.post('comments/channel', { data: data });

      // Clear the input
      setUserComment('');
    }
  };

  const handleTaskGenieResponse = async (interestInTaskGenie: boolean) => {
    // Update local state
    setTaskGenieAnswer(interestInTaskGenie);

    // Store the Task Genie preference in localStorage
    localStorage.setItem('interestInTaskGenie', interestInTaskGenie.toString());

    // Send to AppSync
    const data = {
      uuid: user.uuid,
      username: user.username,
      questionType: 'task-genie',
      interestInTaskGenie: interestInTaskGenie,
      timestamp: new Date().toISOString(),
    };

    await events.post('questions/channel', { data: data });
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md mx-auto'>
        {/* Task Genie Question - Always Visible */}
        <div className='bg-white rounded-lg shadow-xl p-8 mb-8'>
          <h1 className='text-3xl font-bold text-center text-gray-900 mb-8'>Interest in Task Genie</h1>

          <div className='space-y-6'>
            <p className='text-lg text-center text-gray-700 mb-8'>Would you use Task Genie for your work?</p>

            <div className='space-y-4'>
              <button
                onClick={() => handleTaskGenieResponse(true)}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  taskGenieAnswer === true
                    ? 'bg-green-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                }`}
              >
                Yes
              </button>

              <button
                onClick={() => handleTaskGenieResponse(false)}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  taskGenieAnswer === false
                    ? 'bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Box */}
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h2 className='text-2xl font-bold text-center text-gray-900 mb-6'>Your Feedback</h2>

          <div className='space-y-4'>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder='Enter your feedback...'
              rows={6}
              className='w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
            />

            <button
              onClick={handleMessageSubmit}
              disabled={!userComment.trim()}
              className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <SendHorizontal className='w-5 h-5 mr-2' />
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

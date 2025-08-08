'use client';

import { useEffect, useState } from 'react';
import { events } from 'aws-amplify/data';
import Image from 'next/image';

interface User {
  uuid: string;
  username: string;
}

interface QuestionResponse extends User {
  questionType: string;
  answer: boolean;
  timestamp: string;
}

interface Comments extends User {
  comment: string;
  timestamp: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: number;
}

// Helper function to generate notification messages
const generateNotificationMessage = (username: string, questionType: string, answer: boolean): string => {
  if (questionType === 'azure-devops') {
    return answer ? `${username} is using Azure DevOps!` : `${username} is not using Azure DevOps`;
  } else if (questionType === 'task-genie') {
    return answer ? `${username} would use Task Genie!` : `${username} would not use Task Genie`;
  }
  return `${username} answered a question!`;
};

export default function LeaderboardPage() {
  const [questionResponses, setQuestionResponses] = useState<QuestionResponse[]>([]);
  const [comments, setComments] = useState<Comments[]>([]);
  const [notifications, setNotifications] = useState<Notification | undefined>(undefined);

  // Function to add a notification
  const addNotification = (message: string) => {
    const id = crypto.randomUUID();
    setNotifications({ id, message, timestamp: Date.now() });

    // Remove notification after 2 seconds
    setTimeout(() => {
      setNotifications(undefined);
    }, 2000);
  };

  // Calculate Azure DevOps usage statistics
  const azureStats = () => {
    const azureQuestions = questionResponses.filter((q) => q.questionType === 'azure-devops');
    const total = azureQuestions.length;
    const usingAzure = azureQuestions.filter((q) => q.answer).length;
    const notUsingAzure = total - usingAzure;
    const azurePercentage = total > 0 ? Math.round((usingAzure / total) * 100) : 0;

    return { total, usingAzure, notUsingAzure, azurePercentage };
  };

  // Calculate Task Genie usage statistics
  const taskGenieStats = () => {
    const taskGenieQuestions = questionResponses.filter((q) => q.questionType === 'task-genie');
    const total = taskGenieQuestions.length;
    const wouldUseTaskGenie = taskGenieQuestions.filter((q) => q.answer).length;
    const wouldNotUseTaskGenie = total - wouldUseTaskGenie;
    const taskGeniePercentage = total > 0 ? Math.round((wouldUseTaskGenie / total) * 100) : 0;

    return { total, wouldUseTaskGenie, wouldNotUseTaskGenie, taskGeniePercentage };
  };

  useEffect(() => {
    async function handleQuestionsConnect() {
      return (await events.connect('/questions/channel')).subscribe({
        next: (data) => {
          // console.log('Received question:', data.event.data);
          setQuestionResponses((prevQuestions) => {
            const updatedQuestions = [...prevQuestions, data.event.data];
            return updatedQuestions
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 50); // Keep more responses for better tracking
          });

          // Show notification for new responses
          const message = generateNotificationMessage(
            data.event.data.username,
            data.event.data.questionType,
            data.event.data.answer
          );
          addNotification(message);
        },
        error: (error) => {
          console.error('Subscription error:', error);
        },
      });
    }

    async function handleCommentsConnect() {
      return (await events.connect('/comments/channel')).subscribe({
        next: (data) => {
          // console.log('Received comment:', data.event.data);
          setComments((prevComments) => {
            const updatedComments = [...prevComments, data.event.data];
            return updatedComments
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 5);
          });
        },
        error: (error) => {
          console.error('Subscription error:', error);
        },
      });
    }

    handleQuestionsConnect();
    handleCommentsConnect();
  }, []);

  const azureStatsData = azureStats();
  const taskGenieStatsData = taskGenieStats();

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {notifications && (
          <div className='fixed top-4 left-0 right-0 z-50 flex justify-center'>
            <div
              key={notifications.id}
              className='bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-lg shadow-lg px-4 py-2 text-center animate-slide-in'
            >
              <p className='text-lg font-semibold'>{notifications.message}</p>
            </div>
          </div>
        )}

        <h1 className='text-3xl font-bold text-center mt-4 text-gray-900 mb-4'>Welcome to Dragon&apos;s Vault</h1>

        {/* Azure DevOps Statistics */}
        {azureStatsData.total > 0 && (
          <div className='bg-white rounded-lg shadow-xl overflow-hidden mb-8'>
            <h2 className='text-xl font-semibold text-white p-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-md'>
              Using Azure DevOps
            </h2>
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-blue-600'>{azureStatsData.total}</div>
                  <div className='text-sm text-gray-600'>Total Responses</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-green-600'>{azureStatsData.usingAzure}</div>
                  <div className='text-sm text-gray-600'>Using Azure DevOps</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-red-600'>{azureStatsData.notUsingAzure}</div>
                  <div className='text-sm text-gray-600'>Not Using Azure DevOps</div>
                </div>
              </div>

              <div className='mb-6'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>Using Azure DevOps</span>
                  <span className='text-sm font-medium text-gray-700'>{azureStatsData.azurePercentage}%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${azureStatsData.azurePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Genie Statistics */}
        {taskGenieStatsData.total > 0 && (
          <div className='bg-white rounded-lg shadow-xl overflow-hidden mb-8'>
            <h2 className='text-xl font-semibold text-white p-3 border-b border-gray-200 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-md'>
              Interest in Task Genie
            </h2>
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-purple-600'>{taskGenieStatsData.total}</div>
                  <div className='text-sm text-gray-600'>Total Responses</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-green-600'>{taskGenieStatsData.wouldUseTaskGenie}</div>
                  <div className='text-sm text-gray-600'>Would Use Task Genie</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-red-600'>{taskGenieStatsData.wouldNotUseTaskGenie}</div>
                  <div className='text-sm text-gray-600'>Would Not Use Task Genie</div>
                </div>
              </div>

              <div className='mb-6'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>Task Genie Interest</span>
                  <span className='text-sm font-medium text-gray-700'>{taskGenieStatsData.taskGeniePercentage}%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${taskGenieStatsData.taskGeniePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {comments.length > 0 && (
          <div className='bg-white rounded-lg shadow-xl overflow-hidden mb-8'>
            <h2 className='text-xl font-semibold text-white p-3 border-b border-gray-200 bg-gradient-to-r from-[#43a49e] via-[#2fb387] to-[#10b981] shadow-md'>
              Feedback
            </h2>
            {comments
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((c, i) => (
                <div key={i} className='p-2 border-gray-200 last:border-0'>
                  <div className='flex items-center'>
                    <span className='font-semibold text-gray-900'>{c.username}:</span>
                    <p className='text-gray-700 ml-2'>&quot;{c.comment}&quot;</p>
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Join the Conversation</h2>
          <div className='bg-white p-6 rounded-lg shadow-lg inline-block'>
            <Image src='/code-feedback.png' alt='QR Code to join' width={200} height={200} className='mx-auto' />
            <p className='mt-4 text-sm text-gray-600'>Scan to start contributing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

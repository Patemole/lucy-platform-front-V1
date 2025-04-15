import React from 'react';
import { CircularProgress, Fade } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useAuthStore from '../stores/useAuthStore';
import useChatStore from '../stores/useChatStore';
import { useAppInitializationStore } from '../stores/useAppInitializationStore';
import lucyLogo from '../logo_lucy.png';

interface LoadingStepProps {
  label: string;
  isLoading: boolean;
  isComplete: boolean;
}

const LoadingStep: React.FC<LoadingStepProps> = ({ label, isLoading, isComplete }) => (
  <div className="flex items-center gap-4 mb-4 w-full max-w-[280px]">
    <div className="w-6 flex justify-center">
      <div className="relative w-5 h-5">
        {/* Utiliser des éléments superposés avec des transitions d'opacité */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <CircularProgress size={20} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-0'}`}>
          <CheckCircleIcon className="text-green-500" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-500 ${!isLoading && !isComplete ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-5" /> {/* Placeholder pour l'alignement */}
        </div>
      </div>
    </div>
    <span
      className={`text-sm md:text-base transition-colors duration-500 ${
        isComplete 
          ? 'text-green-600 dark:text-green-400'
          : isLoading 
            ? 'text-blue-600 dark:text-blue-400 font-medium'
            : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {label}
    </span>
  </div>
);

const LoadingScreen: React.FC = () => {
  const { isLoading: authLoading } = useAuthStore();
  const { isLoadingConversations, isLoadingMessages } = useChatStore();
  const isAppInitialized = useAppInitializationStore((state) => state.isAppInitialized);

  return (
    <Fade in={true} timeout={800}>
      <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Logo Container */}
          <div className="relative w-24 h-24 mb-8">
            <img
              src={lucyLogo}
              alt="Lucy Logo"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>

          {/* Loading Steps Container */}
          <div className="w-full flex flex-col items-center gap-2 mb-8">
            <LoadingStep
              label="Verifying your credentials"
              isLoading={authLoading}
              isComplete={!authLoading}
            />
            <LoadingStep
              label="Initializing your workspace"
              isLoading={isLoadingConversations}
              isComplete={!isLoadingConversations && isAppInitialized}
            />
            <LoadingStep
              label="Setting up your personalized experience"
              isLoading={!isAppInitialized && !isLoadingConversations}
              isComplete={isAppInitialized}
            />
          </div>

          {/* Message Container */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[280px] mx-auto">
              We're preparing everything for you. This will only take a moment.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Powered by Lucy AI
            </p>
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default LoadingScreen; 
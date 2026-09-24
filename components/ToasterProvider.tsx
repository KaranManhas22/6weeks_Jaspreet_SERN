'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster 
      position="bottom-center"
      toastOptions={{
        className: 'dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-800',
        duration: 4000,
      }}
    />
  );
}

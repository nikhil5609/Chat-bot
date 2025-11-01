import { Loader2, Sun, Moon } from "lucide-react";

const Loading = () => {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 animate-pulse">
        Loading...
      </h1>
    </div>
  );
};

export default Loading;

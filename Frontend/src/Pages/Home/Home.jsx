import Sidebar from "./Sidebar";
import Chatbox from "./Chatbox";
import { useSelector } from "react-redux";


const Home = () => {
  const user = useSelector((state) => state.user);

  if (user.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f1117] transition-all duration-300">
      <Sidebar />
      <Chatbox />
    </div>
  );
};

export default Home;

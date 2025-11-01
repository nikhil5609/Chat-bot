import { Plus, Search, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getHistory, setactiveSession } from '../../Storage/modelSlice';
import { useEffect, useState } from 'react';
import Loading from '../Loading/Loading';
import axios from 'axios';

const Sidebar = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const userId = user?.user?._id;
    const model = useSelector((state) => state.model);

    const [search, setSearch] = useState('');

    useEffect(() => {
        if (userId) {
            console.log(userId);
            dispatch(getHistory(userId))
        }
    }, [userId, dispatch]);

    const createNewChat = () => {
        dispatch(setactiveSession(null));
        dispatch(getHistory(userId));
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.post("https://chat-bot-ok2h.onrender.com/delete-session", { id });
            if (res.status === 200) {
                dispatch(getHistory(userId));
            }
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    const filteredHistory = model.history.filter((data) =>
        data.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <aside className="hidden md:flex flex-col w-72 bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            {/* --- User Info Section --- */}
            {user.isLoggedin ? (
                <div className="flex items-center space-x-3 mb-5">
                    <img
                        src="/icons8-user-48.png"
                        alt="avatar"
                        className="w-10 h-10 rounded-full dark:bg-white"
                    />
                    <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-base">
                            {user.user.name || "User"}
                        </p>
                        <p className="text-xs text-green-500 font-medium">● Online</p>
                    </div>
                </div>
            ) : (
                <div className='w-full h-full flex flex-col items-center justify-center gap-4'>
                    <Link to='/login' className='w-full'>
                        <button className='bg-blue-500 w-full py-3 rounded-lg font-semibold text-white hover:bg-gray-900 hover:scale-105 transition'>
                            Login
                        </button>
                    </Link>
                    <Link to='/register' className='w-full'>
                        <button className='bg-blue-500 w-full py-3 rounded-lg font-semibold text-white hover:bg-gray-900 hover:scale-105 transition'>
                            Create New Account
                        </button>
                    </Link>
                </div>
            )}

            {user.isLoggedin && (
                <>
                    <button
                        onClick={createNewChat}
                        className="flex items-center justify-center space-x-2 w-full py-2 mb-4 rounded-xl font-medium
                           bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 transition-all shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Chat</span>
                    </button>

                    {/* 🔍 Search Input */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 
                           text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </>
            )}

            {/* --- Chat History --- */}
            {user.isLoggedin && (
                model.loading ? (
                    <Loading />
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                        {filteredHistory.length === 0 ? (
                            <h1 className='dark:text-white font-semibold w-full h-full text-2xl text-center pt-20'>
                                No History Found
                            </h1>
                        ) : (
                            filteredHistory.map((data, i) => (
                                <div key={i} className="py-3 rounded-xl cursor-pointer transition-all">
                                    <div className="flex items-center justify-between bg-gray-700 w-full py-2 px-3 text-white font-medium rounded-md hover:bg-gray-900">
                                        {/* Title (clickable) */}
                                        <p onClick={() => dispatch(setactiveSession(data._id))}>
                                            {data.title || "Title"}
                                        </p>

                                        {/* Delete Icon */}
                                        <Trash2
                                            size={18}
                                            className="text-red-400 hover:text-red-600 transition"
                                            onClick={() => handleDelete(data._id)}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )
            )}
        </aside>
    );
};

export default Sidebar;

import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Storage/userSlice';
import { LogOut, Menu, Moon, Send, Sun } from 'lucide-react';
import { setactiveSession } from '../../Storage/modelSlice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Chatbox = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [input, setInput] = useState('');
    const [sessionId, setsessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const model = useSelector((state) => state.model);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setsessionId(model.activeSession);
        if (messages.length > 0 && model.activeSession == null) {
            setMessages([]);
        }
    }, [model]);

    // fetch session history
    useEffect(() => {
        const fetchSession = async () => {
            if (sessionId) {
                const res = await axios.post('https://chat-bot-ok2h.onrender.com/get-session', {
                    userid: user?.user?._id,
                    sessionid: sessionId,
                });
                setMessages(res.data.session.history);
            }
        };
        fetchSession();
    }, [sessionId, user]);

    // theme setup
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = darkMode ? 'light' : 'dark';
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark', !darkMode);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogout = async () => {
        try {
            const token =
                localStorage.getItem('token') ||
                document.cookie
                    ?.split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1];

            const response = await axios.get('https://chat-bot-ok2h.onrender.com/user/logout', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                localStorage.removeItem('token');
                dispatch(logout());
                navigate('/login');
            } else {
                alert('Something went wrong. Try again!');
            }
        } catch (err) {
            console.error(err);
            alert('Logout failed. Try again!');
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const mess = input;
        setInput('');

        // Add user's message
        setMessages((prev) => [...prev, { role: 'user', parts: [{ text: mess }] }]);

        // Add temporary "Generating..." message
        const tempId = Date.now();
        setMessages((prev) => [
            ...prev,
            { id: tempId, role: 'model', parts: [{ text: '_✨ Generating response..._' }] },
        ]);

        try {
            let res;
            if (!user?.isLoggedin) {
                res = await axios.post("https://chat-bot-ok2h.onrender.com/unauth/chat-bot", {
                    userPrompt: mess
                })
            }
            else {
                res = await axios.post('https://chat-bot-ok2h.onrender.com/chat-bot', {
                    userId: user.user._id,
                    userPrompt: mess,
                    sessionId: sessionId,
                });
            }

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempId
                        ? { role: 'model', parts: [{ text: res?.data?.reply }] }
                        : msg
                )
            );

            if (!sessionId && res.data.sessionId) {
                dispatch(setactiveSession(res.data.sessionId));
            }
        } catch (err) {
            console.error(err);
            // Replace generating message with error
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempId
                        ? {
                            role: 'model',
                            parts: [
                                {
                                    text:
                                        '_⚠️ Error: Something went wrong, please try again._',
                                },
                            ],
                        }
                        : msg
                )
            );
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <main className="flex-1 flex flex-col">
            {/* Navbar */}
            <nav className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 p-4 shadow-md">
                <div className="flex items-center space-x-3">
                    <button className="md:hidden">
                        <Menu className="text-gray-700 dark:text-gray-200 w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                        🤖 ChatBot
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition-transform"
                    >
                        {darkMode ? (
                            <Sun className="text-yellow-400 w-5 h-5" />
                        ) : (
                            <Moon className="text-gray-800 w-5 h-5" />
                        )}
                    </button>
                    {user.isLoggedin && (
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-transform hover:scale-105"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </nav>

            {/* Chat Section */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                {messages.length === 0 ? (
                    <div className='w-full h-full'>
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-10 mb-60">
                            Start a new conversation ✨
                        </p>
                        <h1 className='text-center font-bold dark:text-white text-3xl'>Hey {user?.user?.name} 👋</h1>
                    </div>
                ) : (
                    messages.map((msg, id) => (
                        <div
                            key={id}
                            className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white self-end ml-auto font-semibold'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start'
                                }`}
                        >
                            <div className="prose dark:prose-invert max-w-none prose-sm">
                                {msg.parts[0].text === '_✨ Generating response..._' ? (
                                    <div className="flex space-x-1 items-center">
                                        <h1 className='font-bold mr-2'>✨ Generating response</h1>
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-150" />
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-300" />
                                    </div>
                                ) : (
                                    <ReactMarkdown  remarkPlugins={[remarkGfm]}>
                                        {msg.parts[0].text}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 
                text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 
                focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                    onClick={handleSend}
                    className="flex items-center justify-center space-x-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-md"
                >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                </button>
            </div>
        </main>
    );
};

export default Chatbox;

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {loginUser} from '../../Storage/userSlice'
import Loading from '../Loading/Loading'

const Login = () => {
    const dispatch  = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [userData, setUserData] = useState({
        email: '',
        password: ''
    })

    // Handle input change
    const handleChange = (e) => {
        const { id, value } = e.target
        setUserData((prev) => ({
            ...prev,
            [id]: value
        }))
    }

    const loginHandler =  (e) => {
        e.preventDefault()
        dispatch(loginUser(userData))
        .then((res) => {
            navigate('/');
            localStorage.setItem('token', res.payload.token)
        })
        .catch((err)=>{
            console.log(err);
        })
        
    }

    return (
        user.loading ? <Loading /> :
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                    Welcome Back
                </h1>

                <form className="space-y-4" onSubmit={loginHandler}>
                    <div>
                        <label
                            className="block text-gray-700 dark:text-gray-300 mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={userData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                                rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            className="block text-gray-700 dark:text-gray-300 mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                                rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="********"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 
                            text-white rounded-xl font-medium transition"
                    >
                        Login
                    </button>
                </form>

                <div className="flex flex-col space-y-3">
                    <Link to="/register">
                        <button
                            type="button"
                            className="w-full py-2 border border-gray-300 dark:border-gray-600 
                                rounded-xl text-gray-800 dark:text-gray-100 font-medium 
                                hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            Create New Account
                        </button>
                    </Link>

                    <Link to="/">
                        <button
                            type="button"
                            className="w-full py-2 bg-gray-200 dark:bg-gray-700 
                                hover:bg-gray-300 dark:hover:bg-gray-600 
                                text-gray-900 dark:text-gray-100 rounded-xl font-medium transition"
                        >
                            Continue as Guest
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, clearError, googleLogin } from '../store/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const [authBanner, setAuthBanner] = useState('https://images.unsplash.com/photo-1555169062-013468b47726?auto=format&fit=crop&q=80&w=800');

    useEffect(() => {
        api.get('/banners/active?page=auth')
            .then(res => {
                if (res.data && res.data.data && res.data.data.length > 0) {
                    setAuthBanner(res.data.data[0].imageUrl);
                }
            })
            .catch(err => console.error("Could not fetch auth banner", err));
    }, []);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error, status, user } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        dispatch(clearError());
    }, [isLogin, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            dispatch(loginUser({ email: formData.email, password: formData.password }));
        } else {
            dispatch(registerUser(formData));
        }
    };


    return (
        <div className="bg-white min-h-screen py-16 flex items-center justify-center mt-10 mb-10">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">

                {/* Left Image Block */}
                <div className="w-[450px] hidden lg:block rounded-l overflow-hidden shadow-sm relative">
                    <img
                        src={authBanner}
                        alt="SkyBeing Auth"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-[#0E7A0D]/10"></div>
                </div>

                {/* Right Form Container */}
                <div className="w-full lg:flex-1 bg-white p-12 border border-gray-100 shadow-sm rounded-r flex flex-col justify-center">
                    <h2 className="text-4xl text-black font-semibold mb-1 tracking-wide">
                        {isLogin ? 'Sign In' : 'Create an account'}
                    </h2>
                    <p className="text-gray-900 font-medium mb-12 mt-2">Enter your details below</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-sm">
                        {error && <div className="text-red-500 font-medium text-sm text-center">{error}</div>}
                        {!isLogin && (
                            <div className="border-b border-gray-400 pb-2">
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full outline-none text-gray-900 font-medium placeholder-gray-500" placeholder="Name" />
                            </div>
                        )}
                        <div className="border-b border-gray-400 pb-2">
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full outline-none text-gray-900 font-medium placeholder-gray-500" placeholder="Email Address" required />
                        </div>
                        <div className="border-b border-gray-400 pb-2">
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full outline-none text-gray-900 font-medium placeholder-gray-500" placeholder="Password" required />
                        </div>

                        <div className="flex flex-col gap-6 mt-4">
                            <button type="submit" disabled={status === 'loading'} className="bg-[#DB4444] text-white font-medium w-full py-4 rounded hover:bg-[#DB4444]/90 transition disabled:opacity-50">
                                {status === 'loading' ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </button>
                            <div className="flex justify-center mt-2 w-full">
                                <GoogleLogin
                                    onSuccess={(credentialResponse) => {
                                        dispatch(googleLogin(credentialResponse.credential));
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                />
                            </div>
                        </div>
                    </form>

                    <p className="text-gray-500 mt-8 font-medium">
                        {isLogin ? "Don't have an account?" : "Already have account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-gray-900 font-semibold ml-4 border-b border-gray-900 bg-transparent border-t-0 border-x-0 cursor-pointer">
                            {isLogin ? 'Sign Up' : 'Log in'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Auth;

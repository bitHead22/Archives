import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { GraduationCap, Mail, Lock, User } from 'lucide-react'

export default function AuthPage() {
  const { user, signIn, signUp, signInWithGoogle } = useAuthContext()
  const [isLogin, setIsLogin] = useState(true)
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/select-course" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#000000] text-white overflow-hidden antialiased selection:bg-[#c5f174] selection:text-black">
      {/* Left Pane */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#000000] p-10 xl:p-16 z-10 border-r border-[#1a1a1a]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#c5f174] flex items-center justify-center">
            <GraduationCap className="text-black" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Archives</span>
        </Link>
        
        {/* Hero Typography */}
        <div className="flex-1 flex flex-col justify-center">
          {isLogin ? (
            <>
              <h1 className="text-6xl xl:text-8xl font-black leading-tight tracking-tight text-white mb-6">
                Welcome<br/>
                <span className="text-[#c5f174] italic font-light">Back</span>
              </h1>
              <p className="mt-6 text-gray-400 max-w-md text-lg font-light leading-relaxed">
                Your AI-powered academic journey continues here. Log in to access your personalized dashboard.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-6xl xl:text-8xl font-black leading-tight tracking-tight text-white mb-6">
                Create<br/>
                <span className="text-[#c5f174] italic font-light">Account</span>
              </h1>
              <p className="mt-6 text-gray-400 max-w-md text-lg font-light leading-relaxed">
                Start your journey to academic excellence. Gain access to thousands of resources instantly.
              </p>
            </>
          )}
        </div>
        
        {/* Footer text */}
        <div className="text-sm text-gray-600 font-medium">
          © 2026 Archives Education Platform.
        </div>
        <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at bottom left, #222 0%, transparent 40%)' }}></div>
      </div>

      {/* Right Pane */}
      <div className="flex w-full lg:w-[55%] flex-col justify-center items-center bg-[#111111] px-6 py-12 lg:px-20 xl:px-32 relative overflow-y-auto">
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden absolute top-6 flex items-center gap-2 mb-8 self-center">
          <div className="h-8 w-8 rounded-full bg-[#c5f174] flex items-center justify-center">
            <GraduationCap className="text-black" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Archives</span>
        </Link>
        
        <div className="w-full max-w-[480px] flex flex-col gap-8">
          {/* Form Header */}
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              {isLogin ? 'Log in to your account' : 'Join Archives'}
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Start your journey to academic excellence.'}
            </p>
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-white text-sm font-medium ml-1" htmlFor="fullname">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#c5f174] transition-colors" size={20} />
                  <input 
                    className="w-full bg-[#000000] border border-[#222222] text-white rounded-xl h-14 pl-12 pr-4 focus:ring-1 focus:border-[#c5f174] focus:ring-[#c5f174] outline-none placeholder:text-gray-600 transition-colors" 
                    id="fullname" 
                    placeholder="Enter your full name" 
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-white text-sm font-medium ml-1" htmlFor="email">Email</label>
              <div className="relative group">
                <Mail className={`absolute top-1/2 -translate-y-1/2 text-gray-500 transition-colors ${!isLogin ? 'left-4 group-focus-within:text-[#c5f174]' : 'hidden'}`} size={20} />
                <input 
                  className={`w-full bg-[#000000] border border-[#222222] text-white rounded-xl h-14 pr-4 focus:ring-1 focus:border-[#c5f174] focus:ring-[#c5f174] outline-none placeholder:text-gray-600 transition-colors ${!isLogin ? 'pl-12' : 'pl-4 px-4 text-base font-normal'}`} 
                  id="email" 
                  placeholder="name@example.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-medium ml-1" htmlFor="password">Password</label>
              <div className="relative group">
                <Lock className={`absolute top-1/2 -translate-y-1/2 text-gray-500 transition-colors ${!isLogin ? 'left-4 group-focus-within:text-[#c5f174]' : 'hidden'}`} size={20} />
                <input 
                  className={`w-full bg-[#000000] border border-[#222222] text-white rounded-xl h-14 pr-4 focus:ring-1 focus:border-[#c5f174] focus:ring-[#c5f174] outline-none placeholder:text-gray-600 transition-colors ${!isLogin ? 'pl-12' : 'pl-4 px-4 text-base font-normal'}`} 
                  id="password" 
                  placeholder={isLogin ? "Enter your password" : "Create a password"} 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {isLogin && (
              <div className="flex justify-end mt-[-8px]">
                <a className="text-sm font-medium text-gray-400 hover:text-[#c5f174] transition-colors" href="#">Forgot password?</a>
              </div>
            )}
            
            <button 
              className={`w-full h-14 bg-[#c5f174] hover:bg-[#b0d965] text-black font-bold text-lg rounded-2xl transition-all active:scale-[0.98] ${isLogin ? 'mt-2' : 'mt-4'}`} 
              type="submit"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#222222]"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">or continue with</span>
            <div className="flex-grow border-t border-[#222222]"></div>
          </div>
          
          {/* Google Button */}
          <button 
            className="w-full h-14 bg-[#000000] border border-[#222222] hover:bg-[#1a1a1a] hover:border-[#333] text-white font-medium text-base rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]" 
            type="button"
            onClick={signInWithGoogle}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>
          
          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-gray-500 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="font-semibold text-[#c5f174] hover:text-[#d4f890] transition-colors hover:underline"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
              >
                {isLogin ? 'Sign up for free' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}



import React, { useState } from 'react';
import { X, Mail, Lock, User, MapPin, CheckSquare, Square, AlertCircle, Loader } from 'lucide-react';
import { NEPAL_CITIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin: onLoginSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && !agreed) {
        setError("Please agree to the terms.");
        return;
    }

    setIsLoading(true);
    try {
        if (isLogin) {
            await login(email, password);
        } else {
            await register({
                email,
                password_hash: password,
                username,
                location,
                is_verified_age: true // In a real app, this would be more rigorous
            });
        }
        if (onLoginSuccess) onLoginSuccess();
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setUsername('');
        setLocation('');
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative h-32 bg-hemp-600 flex items-center justify-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X size={24} />
          </button>
          <div className="text-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <span className="text-3xl">🌿</span>
             </div>
             <h2 className="text-white font-bold text-xl">Nepal Hemp Community</h2>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="flex space-x-4 mb-6">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 pb-2 text-center font-medium border-b-2 transition-colors ${isLogin ? 'border-hemp-600 text-hemp-600' : 'border-transparent text-gray-400'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 pb-2 text-center font-medium border-b-2 transition-colors ${!isLogin ? 'border-hemp-600 text-hemp-600' : 'border-transparent text-gray-400'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-3">
                 <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent outline-none" 
                        required 
                    />
                 </div>
                 <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <select 
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent outline-none bg-white text-gray-600" 
                        required
                    >
                      <option value="">Select City in Nepal</option>
                      {NEPAL_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                 </div>
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent outline-none" 
                  required 
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent outline-none" 
                  required 
              />
            </div>

            {!isLogin && (
              <div 
                className="flex items-start space-x-2 cursor-pointer group"
                onClick={() => setAgreed(!agreed)}
              >
                <div className={`mt-0.5 ${agreed ? 'text-hemp-600' : 'text-gray-400'}`}>
                  {agreed ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <p className="text-xs text-gray-500 leading-snug">
                  I confirm I am over 18 years of age and I agree to the <span className="text-hemp-600 underline">Terms of Service</span>. I understand this platform is for educational and community purposes within Nepal's legal framework.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || (!isLogin && !agreed)}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all flex justify-center items-center ${(!isLogin && !agreed) ? 'bg-gray-300 cursor-not-allowed' : 'bg-hemp-600 hover:bg-hemp-700 shadow-md hover:shadow-lg'}`}
            >
              {isLoading && <Loader className="animate-spin mr-2" size={20} />}
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

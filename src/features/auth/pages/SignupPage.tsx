import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Dumbbell, Check } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

export function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 2) {
      setCurrentStep(2);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const success = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password,
    });
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Failed to create account. Email may already be in use.');
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 2) return 'bg-danger-500';
    if (strength <= 3) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getStrengthText = () => {
    const strength = passwordStrength();
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-primary-600 rounded-lg text-white">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FitHub</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                  currentStep >= 1 ? 'bg-primary-600 text-white scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <div className={`w-16 h-1 rounded transition-all duration-500 ${
                  currentStep > 1 ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                  currentStep >= 2 ? 'bg-primary-600 text-white scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 animate-fade-in">
                {currentStep === 1 ? 'Create Account' : 'Set Password'}
              </h2>
              <p className="text-gray-500 mt-2 animate-fade-in animation-delay-100">
                {currentStep === 1 
                  ? 'Fill in your details to get started' 
                  : 'Choose a secure password for your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-danger-50 border border-danger-500 rounded-xl text-danger-600 text-sm animate-shake">
                  {error}
                </div>
              )}

              {currentStep === 1 ? (
                <>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4 animate-slide-in-up animation-delay-200">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-primary-300"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-primary-300"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="animate-slide-in-up animation-delay-300">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-primary-300"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="animate-slide-in-up animation-delay-400">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-primary-300"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Password Field */}
                  <div className="animate-slide-in-up">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-primary-300"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-3 animate-fade-in">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                              style={{ width: `${(passwordStrength() / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength() <= 2 ? 'text-danger-500' : 
                            passwordStrength() <= 3 ? 'text-warning-500' : 'text-success-500'
                          }`}>
                            {getStrengthText()}
                          </span>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1 mt-2">
                          <li className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-success-500' : ''}`}>
                            <Check className={`w-3 h-3 ${formData.password.length >= 8 ? 'opacity-100' : 'opacity-30'}`} />
                            At least 8 characters
                          </li>
                          <li className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-success-500' : ''}`}>
                            <Check className={`w-3 h-3 ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'opacity-100' : 'opacity-30'}`} />
                            Upper & lowercase letters
                          </li>
                          <li className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-success-500' : ''}`}>
                            <Check className={`w-3 h-3 ${/[0-9]/.test(formData.password) ? 'opacity-100' : 'opacity-30'}`} />
                            At least one number
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="animate-slide-in-up animation-delay-100">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-primary-300 ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword 
                            ? 'border-danger-500' 
                            : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-danger-500 text-sm mt-1 animate-shake">Passwords do not match</p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="animate-slide-in-up animation-delay-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                        required
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className={`flex gap-3 ${currentStep === 1 ? '' : 'animate-slide-in-up animation-delay-300'}`}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || (currentStep === 2 && formData.password !== formData.confirmPassword)}
                  className={`${currentStep === 1 ? 'w-full' : 'flex-1'} py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed animate-slide-in-up animation-delay-500`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : currentStep === 1 ? (
                    'Continue'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-8 text-gray-600 animate-fade-in animation-delay-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-bl from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        {/* Animated shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-3xl rotate-12 animate-float" />
          <div className="absolute bottom-32 left-16 w-48 h-48 bg-white/5 rounded-full animate-pulse" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/10 rounded-2xl -rotate-12 animate-bounce-slow" />
          <div className="absolute bottom-20 right-32 w-24 h-24 bg-white/15 rounded-full animate-ping-slow" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-bounce-gentle">
                <Dumbbell className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold">FitHub</h1>
            </div>
            <h2 className="text-3xl font-semibold mb-4 animate-slide-in-right">Join Our Community</h2>
            <p className="text-lg text-white/80 max-w-md animate-slide-in-right animation-delay-200">
              Start your fitness management journey today. Create an account and unlock powerful tools for your gym.
            </p>
          </div>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 animate-fade-in animation-delay-500">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500+', label: 'Gyms' },
              { value: '99%', label: 'Satisfaction' },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${600 + index * 150}ms` }}
              >
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-12 max-w-md animate-fade-in animation-delay-800">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-white/90 italic mb-4">
                "FitHub transformed how we manage our gym. The dashboard is intuitive and our members love the experience!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                  JD
                </div>
                <div>
                  <div className="font-medium">Jane Doe</div>
                  <div className="text-sm text-white/60">Gym Owner, FitLife</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

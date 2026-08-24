import React, { useState } from 'react';
import { UserRole, ActiveUser, Zone, Agent } from '../../../types';
import {
  Truck,
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Radio,
  KeyRound,
  FileText,
  X,
  AlertCircle,
  HelpCircle,
  Fingerprint,
} from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  initialRole?: UserRole;
  zones: Zone[];
  onAuthSuccess: (user: ActiveUser, role: UserRole) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  initialRole = 'customer',
  zones,
  onAuthSuccess,
  onClose,
  isModal = false,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRole === 'guest' ? 'customer' : initialRole
  );

  // Common Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Customer Specific Fields
  const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'B2B'>('INDIVIDUAL');
  const [companyName, setCompanyName] = useState('');
  const [businessTaxId, setBusinessTaxId] = useState('');
  const [defaultPickupAddress, setDefaultPickupAddress] = useState('');
  const [defaultPincode, setDefaultPincode] = useState('110001');

  // Courier Specific Fields
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'VAN' | 'ELECTRIC_SCOOTER'>('ELECTRIC_SCOOTER');
  const [preferredZoneId, setPreferredZoneId] = useState(zones[0]?.id || 'zone-north');
  const [licenseNumber, setLicenseNumber] = useState('DL-9042-882');

  // Admin Specific Fields
  const [adminPasskey, setAdminPasskey] = useState('ADMIN-9900');
  const [department, setDepartment] = useState('Central Dispatch HQ');

  // Interactive UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [useOtpLogin, setUseOtpLogin] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passwordScore = getPasswordStrength(password);

  // 1-Click Quick Demo Sign-In Handlers
  const handleQuickDemoSignIn = (roleType: 'customer' | 'merchant' | 'agent' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      if (roleType === 'customer') {
        const demoUser: ActiveUser = {
          id: 'cust-recipient-01',
          name: 'Rohan Mehta',
          email: 'rohan.mehta@example.in',
          role: 'customer',
          phone: '+91 98450 44332',
          address: 'Apt 4B, 742 80ft Road, Koramangala 4th Block',
          pincode: '560034',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          joinedDate: '2024-05-10',
        };
        onAuthSuccess(demoUser, 'customer');
      } else if (roleType === 'merchant') {
        const demoUser: ActiveUser = {
          id: 'cust-001',
          name: 'Priya Sharma',
          email: 'priya.sharma@example.in',
          role: 'merchant',
          phone: '+91 98450 11223',
          companyName: 'Sharma Enterprises & Retail',
          businessType: 'B2B',
          address: '402 Innovation Blvd, Indiranagar',
          pincode: '560038',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          joinedDate: '2024-03-15',
        };
        onAuthSuccess(demoUser, 'merchant');
      } else if (roleType === 'agent') {
        const demoUser: ActiveUser = {
          id: 'agt-042',
          name: 'Rahul Sharma',
          email: 'rahul.s@lastmile-fleet.internal',
          role: 'agent',
          agentId: 'agt-042',
          phone: '+91 98110 55443',
          vehicleType: 'ELECTRIC_SCOOTER',
          zoneId: 'zone-a',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
          joinedDate: '2023-11-10',
        };
        onAuthSuccess(demoUser, 'agent');
      } else {
        const demoUser: ActiveUser = {
          id: 'admin-master',
          name: 'Vikramaditya Singh',
          email: 'vikram.singh@lastmile.in',
          role: 'admin',
          phone: '+91 98100 99887',
          companyName: 'RELAY Logistics Command',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          joinedDate: '2023-01-01',
        };
        onAuthSuccess(demoUser, 'admin');
      }
    }, 400);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!email && !phone) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!useOtpLogin && !password && mode === 'login') {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        return;
      }
      if (!agreedToTerms) {
        setErrorMessage('Please accept the Terms of Service to create an account.');
        return;
      }
    }

    if (selectedRole === 'admin' && adminPasskey !== 'ADMIN-9900') {
      setErrorMessage('Invalid Dispatch Security Key. For preview demo use: ADMIN-9900');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const generatedId = `usr-${Date.now().toString(36)}`;
      const resolvedName = fullName.trim() || (email ? email.split('@')[0] : 'Logistics User');

      const authenticatedUser: ActiveUser = {
        id: generatedId,
        name: resolvedName,
        email: email || `${phone}@sms.relay.in`,
        role: selectedRole,
        phone: phone || '+91 98450 12345',
        companyName: customerType === 'B2B' ? companyName || 'Custom Business Shipper' : undefined,
        businessType: customerType,
        address: defaultPickupAddress || '101 Commercial Logistics Gateway, Indiranagar',
        pincode: defaultPincode || '560038',
        agentId: selectedRole === 'agent' ? generatedId : undefined,
        vehicleType: selectedRole === 'agent' ? vehicleType : undefined,
        zoneId: selectedRole === 'agent' ? preferredZoneId : undefined,
        avatar:
          selectedRole === 'agent'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : selectedRole === 'admin'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      onAuthSuccess(authenticatedUser, selectedRole);
    }, 500);
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in'
          : 'w-full max-w-5xl mx-auto my-4'
      }`}
    >
      <div
        className={`w-full bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden ${
          isModal ? 'max-w-4xl max-h-[92vh] flex flex-col my-auto' : 'grid grid-cols-1 lg:grid-cols-12 min-h-[640px]'
        }`}
      >
        {/* Left Side: Relay Brand Panel */}
        <div
          className={`${
            isModal ? 'hidden md:flex' : 'lg:col-span-5 flex'
          } flex-col justify-between p-8 bg-zinc-950 text-white relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Brand Block */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/30">
                <Truck size={19} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                  RELAY
                  <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                    Logistics
                  </span>
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed pt-2">
              Next-generation routing, dynamic volumetric rating, OTP handshakes, and instant delivery rescheduling.
            </p>
          </div>

          {/* Center Visual: Live Platform Telemetry Pills */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Radio size={13} className="text-emerald-400 animate-pulse" />
                  Live Route Telemetry
                </span>
                <span className="font-mono text-emerald-400 font-bold text-[11px]">99.9% On-Time</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full w-[94%] rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">ACTIVE HUBS</span>
                <span className="text-zinc-200 font-bold">5,000+ Zones</span>
              </div>
              <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">AUTO DISPATCH</span>
                <span className="text-amber-400 font-bold">&lt; 15s Latency</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <p className="text-[11px] text-amber-200 leading-tight">
                Deterministic weight-based billing with automatic COD verification and instant reschedule recovery.
              </p>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Shield size={13} className="text-amber-400" />
              End-to-End Encrypted
            </span>
            <span className="text-zinc-500">Relay v2.4</span>
          </div>
        </div>

        {/* Right Side: Interactive Login / Sign Up Form */}
        <div
          className={`${
            isModal ? 'flex-1 overflow-y-auto' : 'lg:col-span-7'
          } p-6 sm:p-8 flex flex-col justify-between bg-white`}
        >
          <div>
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  {mode === 'login' ? 'Welcome Back to Relay' : 'Create Your Relay Account'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {mode === 'login'
                    ? 'Sign in to access your consignments, routes, or dispatch console.'
                    : 'Get instant access to real-time dispatching and parcel delivery.'}
                </p>
              </div>

              {isModal && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-stone-100 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Mode Switcher Tabs (Log In vs Sign Up) */}
            <div className="flex bg-stone-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
                  mode === 'login'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
                  mode === 'signup'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Quick 1-Click Persona Fast Logins */}
            <div className="mb-5 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-500 fill-amber-500" />
                  Quick Demo Access:
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">1-click test login</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSignIn('customer')}
                  className="px-2.5 py-2 bg-white hover:bg-amber-50 hover:border-amber-300 border border-stone-200 rounded-lg text-left transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                    <User size={13} />
                    <span className="truncate">Customer</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate mt-0.5">Rohan (Recipient)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSignIn('merchant')}
                  className="px-2.5 py-2 bg-white hover:bg-orange-50 hover:border-orange-300 border border-stone-200 rounded-lg text-left transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-orange-700 font-bold text-xs">
                    <Building2 size={13} />
                    <span className="truncate">Merchant</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate mt-0.5">Priya (Shipper)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSignIn('agent')}
                  className="px-2.5 py-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-lg text-left transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <Truck size={13} />
                    <span className="truncate">Courier</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate mt-0.5">Rahul (Rider)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSignIn('admin')}
                  className="px-2.5 py-2 bg-white hover:bg-purple-50 hover:border-purple-300 border border-stone-200 rounded-lg text-left transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                    <Shield size={13} />
                    <span className="truncate">Admin Ops</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate mt-0.5">Vikram (Command)</span>
                </button>
              </div>
            </div>

            {/* Role / Persona Target Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                Select Operating Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('customer')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    selectedRole === 'customer'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 font-bold'
                      : 'border-stone-200 bg-white text-zinc-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <User size={15} className={selectedRole === 'customer' ? 'text-amber-600' : 'text-zinc-400'} />
                    {selectedRole === 'customer' && <CheckCircle2 size={13} className="text-amber-600" />}
                  </div>
                  <span className="text-xs font-bold leading-none mt-1">Customer</span>
                  <span className="text-[10px] text-zinc-500">Receive & OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('merchant')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    selectedRole === 'merchant'
                      ? 'border-orange-500 bg-orange-50/70 text-orange-950 ring-2 ring-orange-500/20 font-bold'
                      : 'border-stone-200 bg-white text-zinc-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 size={15} className={selectedRole === 'merchant' ? 'text-orange-600' : 'text-zinc-400'} />
                    {selectedRole === 'merchant' && <CheckCircle2 size={13} className="text-orange-600" />}
                  </div>
                  <span className="text-xs font-bold leading-none mt-1">Merchant</span>
                  <span className="text-[10px] text-zinc-500">Book & AWB</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('agent')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    selectedRole === 'agent'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 font-bold'
                      : 'border-stone-200 bg-white text-zinc-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Truck size={15} className={selectedRole === 'agent' ? 'text-emerald-600' : 'text-zinc-400'} />
                    {selectedRole === 'agent' && <CheckCircle2 size={13} className="text-emerald-600" />}
                  </div>
                  <span className="text-xs font-bold leading-none mt-1">Courier</span>
                  <span className="text-[10px] text-zinc-500">Mobile Tasks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    selectedRole === 'admin'
                      ? 'border-purple-500 bg-purple-50/70 text-purple-950 ring-2 ring-purple-500/20 font-bold'
                      : 'border-stone-200 bg-white text-zinc-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Shield size={15} className={selectedRole === 'admin' ? 'text-purple-600' : 'text-zinc-400'} />
                    {selectedRole === 'admin' && <CheckCircle2 size={13} className="text-purple-600" />}
                  </div>
                  <span className="text-xs font-bold leading-none mt-1">Admin</span>
                  <span className="text-[10px] text-zinc-500">Command HQ</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-semibold">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Sign Up Name Field */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={
                        selectedRole === 'agent'
                          ? 'e.g. Rahul Sharma'
                          : selectedRole === 'admin'
                          ? 'e.g. Vikramaditya Singh'
                          : 'e.g. Priya Sharma'
                      }
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-medium"
                    />
                    <User size={15} className="absolute left-3 top-2.5 text-zinc-400" />
                  </div>
                </div>
              )}

              {/* Email or Phone Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={mode === 'signup' ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {useOtpLogin ? 'Mobile Phone' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <input
                      type={useOtpLogin ? 'tel' : 'email'}
                      required
                      value={useOtpLogin ? phone : email}
                      onChange={(e) => {
                        if (useOtpLogin) setPhone(e.target.value);
                        else setEmail(e.target.value);
                      }}
                      placeholder={
                        useOtpLogin
                          ? '+1 (555) 019-2834'
                          : selectedRole === 'agent'
                          ? 'rider@relay-fleet.internal'
                          : selectedRole === 'admin'
                          ? 'admin@relay.io'
                          : 'shipper@example.com'
                      }
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-medium"
                    />
                    {useOtpLogin ? (
                      <Phone size={15} className="absolute left-3 top-2.5 text-zinc-400" />
                    ) : (
                      <Mail size={15} className="absolute left-3 top-2.5 text-zinc-400" />
                    )}
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Contact Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-medium"
                      />
                      <Phone size={15} className="absolute left-3 top-2.5 text-zinc-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Password or OTP Verification */}
              {!useOtpLogin ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-zinc-700">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-medium"
                    />
                    <Lock size={15} className="absolute left-3 top-2.5 text-zinc-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password Strength Meter in Signup */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>Password Strength:</span>
                        <span
                          className={`font-bold ${
                            passwordScore > 70
                              ? 'text-emerald-600'
                              : passwordScore > 40
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {passwordScore > 70 ? 'Strong' : passwordScore > 40 ? 'Moderate' : 'Weak'}
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordScore > 70
                              ? 'bg-emerald-500'
                              : passwordScore > 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${passwordScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-zinc-700">6-Digit SMS OTP Code</label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(true);
                        setOtpCode('892048');
                      }}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-bold"
                    >
                      {otpSent ? 'Resend (892048)' : 'Send Demo Code'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 892048"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold tracking-widest text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                    />
                    <Fingerprint size={15} className="absolute left-3 top-2.5 text-zinc-400" />
                  </div>
                </div>
              )}

              {/* Confirm Password in Sign Up */}
              {mode === 'signup' && !useOtpLogin && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-medium"
                    />
                    <Lock size={15} className="absolute left-3 top-2.5 text-zinc-400" />
                  </div>
                </div>
              )}

              {/* Role-Specific Customization Accordions */}
              {mode === 'signup' && selectedRole === 'customer' && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">Account Category:</span>
                    <div className="flex bg-white p-0.5 rounded-lg border border-amber-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setCustomerType('INDIVIDUAL')}
                        className={`px-2 py-0.5 rounded font-semibold ${
                          customerType === 'INDIVIDUAL' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-600'
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerType('B2B')}
                        className={`px-2 py-0.5 rounded font-semibold ${
                          customerType === 'B2B' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-600'
                        }`}
                      >
                        Business (B2B)
                      </button>
                    </div>
                  </div>

                  {customerType === 'B2B' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Apex Corp"
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">GST / Tax ID</label>
                        <input
                          type="text"
                          value={businessTaxId}
                          onChange={(e) => setBusinessTaxId(e.target.value)}
                          placeholder="GSTIN29ABCDE1234F"
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">
                      Default Delivery Address & Pincode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={defaultPickupAddress}
                        onChange={(e) => setDefaultPickupAddress(e.target.value)}
                        placeholder="Apartment / Office Address"
                        className="col-span-2 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={defaultPincode}
                        onChange={(e) => setDefaultPincode(e.target.value)}
                        placeholder="110001"
                        className="col-span-1 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Courier Specific Setup in Signup */}
              {mode === 'signup' && selectedRole === 'agent' && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2.5 text-xs">
                  <span className="font-bold text-emerald-950 block">Courier Fleet Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Vehicle Fleet</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="ELECTRIC_SCOOTER">⚡ Electric Scooter</option>
                        <option value="BIKE">🏍️ Motorbike</option>
                        <option value="VAN">🚐 Delivery Van</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Primary Zone</label>
                      <select
                        value={preferredZoneId}
                        onChange={(e) => setPreferredZoneId(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold"
                      >
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name} ({z.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Passkey Verification */}
              {selectedRole === 'admin' && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-purple-950 flex items-center gap-1.5">
                      <KeyRound size={13} className="text-purple-600" />
                      Dispatch Station Passkey (2FA Bypass)
                    </label>
                    <span className="font-mono text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-bold">
                      Demo: ADMIN-9900
                    </span>
                  </div>
                  <input
                    type="password"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="Enter ADMIN-9900"
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono font-bold text-purple-900"
                  />
                </div>
              )}

              {/* Remember Me & OTP Mode Toggles */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span>Remember this device</span>
                </label>

                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseOtpLogin(!useOtpLogin);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
                  >
                    {useOtpLogin ? 'Use Password Sign-In' : 'Sign In with Mobile OTP'}
                  </button>
                )}
              </div>

              {/* Terms Checkbox in Signup */}
              {mode === 'signup' && (
                <label className="flex items-start gap-2 text-[11px] text-zinc-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="rounded border-stone-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 mt-0.5"
                  />
                  <span>
                    I agree to Relay Terms of Carriage & Privacy Framework.
                  </span>
                </label>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 shadow-amber-500/20 active:scale-98 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? `Sign In as ${
                            selectedRole === 'agent'
                              ? 'Courier Partner'
                              : selectedRole === 'admin'
                              ? 'Dispatch Admin'
                              : selectedRole === 'merchant'
                              ? 'Merchant Shipper'
                              : 'Customer'
                          }`
                        : 'Create Account & Enter'}
                    </span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Single Sign-On Separator */}
            <div className="mt-5 pt-4 border-t border-stone-100">
              <div className="relative flex justify-center text-xs mb-3">
                <span className="bg-white px-2 text-zinc-400 font-mono text-[11px]">
                  Or authenticate with SSO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSignIn(selectedRole === 'guest' ? 'customer' : selectedRole)}
                  className="px-3 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-zinc-700 flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google SSO</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSignIn(selectedRole === 'guest' ? 'customer' : selectedRole)}
                  className="px-3 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-zinc-700 flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Building2 size={15} className="text-zinc-600" />
                  <span>Corporate SSO</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Switch Mode Toggle */}
          <div className="pt-4 text-center text-xs text-zinc-500 border-t border-stone-100 mt-4">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an active account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Sign In instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <KeyRound size={18} />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Reset Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            {!forgotSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-zinc-600">
                  Enter the email associated with your account. We'll send a secure password reset link.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Reset Link Dispatched
                </div>
                <p className="text-[11px] text-emerald-800">
                  We've sent recovery instructions to <span className="font-mono font-bold">{forgotEmail || 'your email'}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full mt-2 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

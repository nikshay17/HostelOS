// client/src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  FiArrowRight, FiCheckCircle, FiMenu, FiX,
  FiShield, FiBarChart2, FiCalendar, FiMessageSquare,
  FiCreditCard, FiAlertCircle, FiUsers, FiLogOut,
  FiSun, FiMoon
} from 'react-icons/fi';
import { LuBuilding2, LuBedDouble } from 'react-icons/lu';

// ─── GLOBAL KEYFRAMES (scoped once, used for scroll-reveal + ambient motion) ──
const GlobalAnimationStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .reveal {
      opacity: 0;
      transform: translateY(24px);
    }
    .reveal.is-visible {
      animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .float-slow {
      animation: floatSlow 5s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal, .reveal.is-visible { animation: none !important; opacity: 1 !important; transform: none !important; }
      .float-slow { animation: none !important; }
    }
  `}</style>
);

// ─── SCROLL REVEAL WRAPPER ────────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ animationDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
};

// ─── THEME HOOK ───────────────────────────────────────────────────────────────
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hostelos-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored ? stored === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('hostelos-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return { isDark, toggleTheme };
};

// ─── THEME TOGGLE BUTTON ──────────────────────────────────────────────────────
const ThemeToggle = ({ isDark, toggleTheme, className = '' }) => (
  <button
    onClick={toggleTheme}
    aria-label="Toggle dark mode"
    className={`relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
  >
    <FiSun
      size={17}
      className={`absolute transition-all duration-500 ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
    />
    <FiMoon
      size={17}
      className={`absolute transition-all duration-500 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
    />
  </button>
);

// ─── IMAGE PLACEHOLDER COMPONENT ─────────────────────────────────────────────
// Replace src="" with your actual image URL wherever you see <ImagePlaceholder />
const ImagePlaceholder = ({ src = '', alt = '', className = '', overlay = false }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${className}`}>
    {src ? (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
      />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
        <LuBuilding2 size={32} className="opacity-30" />
        <p className="text-xs opacity-50 font-medium">Add image URL here</p>
        <p className="text-xs opacity-40">{alt}</p>
      </div>
    )}
    {overlay && (
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    )}
  </div>
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

const LandingNav = ({ isDark, toggleTheme }) => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Roles", href: "#roles" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <ImagePlaceholder
              src="" // Add your logo image URL here
              alt="HostelOS Logo"
              className="w-8 h-8"
            />
          </div>

          <span className="font-bold text-gray-900 dark:text-white text-lg transition-colors duration-300">
            HostelOS
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="relative text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Get started
            <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          <button
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-90"
            onClick={() => setOpen(!open)}
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-6 py-4 space-y-3 animate-[fadeInUp_0.3s_ease-out]">
          {navItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="block text-sm text-gray-600 dark:text-gray-300 py-1.5 hover:text-gray-900 dark:hover:text-white hover:translate-x-1 transition-all duration-200"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-all duration-200 active:scale-95"
              onClick={() => setOpen(false)}
            >
              Get started
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};



// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section className="pt-16 min-h-screen flex flex-col">
    {/* Main hero with background image */}
    <div className="relative flex-1 flex items-center">
      {/* Background image — replace src with your hostel building photo */}
      <div className="absolute inset-0">
        <ImagePlaceholder
          src="" // <-- Add hostel exterior/campus photo URL here (recommended: wide shot of hostel building)
          alt="Hostel building"
          className="w-full h-full"
          overlay={true}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold rounded-full mb-6 float-slow">
            <FiShield size={11} />
            Trusted by college hostels
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight mb-6 animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            Your hostel,
            <br />
            <span className="text-primary-light">fully digital</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.15s_both]">
            One platform for students, wardens, and administrators. Room booking, attendance, mess bills, gate passes — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 text-sm">
              Register as student <FiArrowRight size={15} />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 active:scale-95 text-sm">
              Staff sign in
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Stats bar */}
    <div className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { value: '50%', label: 'Fewer manual errors' },
          { value: '80%', label: 'Less paperwork' },
          { value: '10+', label: 'Hours saved weekly' },
          { value: '100%', label: 'Digital workflow' },
        ].map(stat => (
          <div key={stat.label} className="text-center group cursor-default">
            <p className="text-2xl font-bold text-primary transition-transform duration-200 group-hover:scale-110">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: LuBedDouble,
    title: 'Room Booking',
    description: 'Browse available rooms, submit requests online. Wardens approve with one click and occupancy updates instantly.',
    imageSrc: '', // <-- Add room interior photo URL here
    imageAlt: 'Hostel room',
    color: 'text-primary',
    bg: 'bg-primary-light',
  },
  {
    icon: FiCreditCard,
    title: 'Mess Bills',
    description: 'Monthly bills auto-generated for all students. Pay online, track balance, view payment history.',
    imageSrc: '', // <-- Add mess/dining hall photo URL here
    imageAlt: 'Hostel mess',
    color: 'text-success',
    bg: 'bg-success-light',
  },
  {
    icon: FiLogOut,
    title: 'Gate Pass + QR',
    description: 'Request outings digitally. Get a QR code on approval, scanned by security on your return.',
    imageSrc: '', // <-- Add gate/entrance photo URL here
    imageAlt: 'Hostel gate',
    color: 'text-warning',
    bg: 'bg-warning-light',
  },
  {
    icon: FiCalendar,
    title: 'Attendance',
    description: 'GPS-verified daily check-in. Optional face recognition for biometric confirmation.',
    imageSrc: '', // <-- Add campus/courtyard photo URL here
    imageAlt: 'Attendance',
    color: 'text-primary',
    bg: 'bg-primary-light',
  },
  {
    icon: FiShield,
    title: 'Face Recognition',
    description: 'Enroll your face once. Use your webcam for biometric verification during attendance.',
    imageSrc: '', // <-- Add face-scan or security photo URL here
    imageAlt: 'Face recognition',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  {
    icon: FiAlertCircle,
    title: 'Complaints',
    description: 'File complaints by category. Wardens triage, update status, and add resolution notes.',
    imageSrc: '', // <-- Add hostel corridor/common area photo URL here
    imageAlt: 'Complaints',
    color: 'text-danger',
    bg: 'bg-danger-light',
  },
  {
    icon: FiMessageSquare,
    title: 'Feedback',
    description: 'Rate mess, facilities, and staff. Admins see aggregated scores and trends.',
    imageSrc: '', // <-- Add dining/facility photo URL here
    imageAlt: 'Feedback',
    color: 'text-primary',
    bg: 'bg-primary-light',
  },
  {
    icon: FiBarChart2,
    title: 'Analytics',
    description: 'Live charts for occupancy, billing, complaints, and attendance across the hostel.',
    imageSrc: '', // <-- Add dashboard screenshot or analytics photo URL here
    imageAlt: 'Analytics',
    color: 'text-success',
    bg: 'bg-success-light',
  },
];

const Features = () => (
  <section id="features" className="py-24 px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Everything your hostel needs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed transition-colors duration-300">
            Eight core modules covering every aspect of hostel administration — from a student's first room booking to month-end billing.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map(({ icon: Icon, title, description, imageSrc, imageAlt, color, bg }, i) => (
          <Reveal key={title} delay={i * 60}>
            <div
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1.5 group h-full"
            >
              {/* Feature card image */}
              <div className="h-36 relative overflow-hidden">
                <ImagePlaceholder
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full"
                  overlay={!!imageSrc}
                />
                {/* Icon overlay */}
                <div className={`absolute bottom-3 left-3 p-2 rounded-xl ${bg} backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                  <Icon size={16} className={color} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5 transition-colors duration-300">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed transition-colors duration-300">{description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── DASHBOARD PREVIEW ────────────────────────────────────────────────────────
const DashboardPreview = () => (
  <section className="py-24 px-6 bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Dashboard</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-5 transition-colors duration-300">
              Purpose-built for
              <br />
              every role
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm transition-colors duration-300">
              Students, wardens, and admins each get their own dashboard — with exactly the tools they need and nothing they don't. Every action is one click away.
            </p>
            <div className="space-y-3">
              {[
                'Students see their room, bills, gate passes, and attendance at a glance',
                'Wardens manage approvals and complaints from a single queue',
                'Admins get analytics, room management, and staff controls',
              ].map(text => (
                <div key={text} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300 hover:translate-x-1 duration-200">
                  <FiCheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                  {text}
                </div>
              ))}
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95">
              View dashboard <FiArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        {/* Dashboard screenshot — replace with a real screenshot */}
        <Reveal delay={150}>
          <div className="relative group">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 transition-transform duration-500 group-hover:scale-[1.02]">
              <ImagePlaceholder
                src="" // <-- Add dashboard screenshot URL here (recommended: 800x500px screenshot of your admin/student dashboard)
                alt="HostelOS Dashboard"
                className="w-full h-72 lg:h-96"
              />
            </div>
            {/* Floating stat card — decorative */}
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-44 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl float-slow">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">248</p>
              <p className="text-xs text-success font-medium mt-1">+12 this month</p>
            </div>
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl float-slow" style={{ animationDelay: '1.5s' }}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rooms filled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
              <p className="text-xs text-primary font-medium mt-1">Near capacity</p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    title: 'Register with your college email',
    description: 'Sign up, get an OTP on your email, verify — takes under 2 minutes. No paperwork.',
    imageSrc: '', // <-- Add registration screenshot or student with laptop photo URL here
    imageAlt: 'Student registering',
  },
  {
    step: '02',
    title: 'Warden activates your account',
    description: 'A warden confirms you\'re a legitimate resident. You\'ll get a notification the moment you\'re cleared.',
    imageSrc: '', // <-- Add warden reviewing screen photo URL here
    imageAlt: 'Warden verifying',
  },
  {
    step: '03',
    title: 'Book your room',
    description: 'Browse available rooms and submit a request. Warden approves, your dashboard updates instantly.',
    imageSrc: '', // <-- Add room booking UI screenshot or student choosing room URL here
    imageAlt: 'Room booking',
  },
  {
    step: '04',
    title: 'Use every service from your phone',
    description: 'Pay bills, mark attendance, request gate passes, file complaints — all digital, all tracked.',
    imageSrc: '', // <-- Add phone/mobile usage photo or app screenshot URL here
    imageAlt: 'Mobile usage',
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Up and running in minutes
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto transition-colors duration-300">
            From first registration to fully active account — a simple four-step process.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map(({ step, title, description, imageSrc, imageAlt }, i) => (
          <Reveal key={step} delay={i * 80}>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1.5 group h-full">
              <div className="h-40 relative overflow-hidden">
                <ImagePlaceholder
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full"
                  overlay={!!imageSrc}
                />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <span className="text-xs font-bold text-white">{step}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed transition-colors duration-300">{description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── ROLES ────────────────────────────────────────────────────────────────────
const ROLES = [
  {
    role: 'Student',
    tagline: 'Your hostel life, simplified',
    description: 'Register, book a room, pay bills, and manage your hostel life entirely from your laptop or phone.',
    imageSrc: '', // <-- Add student in hostel/studying photo URL here
    imageAlt: 'Student in hostel',
    capabilities: [
      'Room booking requests',
      'Mess bill payments',
      'Gate pass with QR code',
      'GPS attendance check-in',
      'Complaint filing',
      'Feedback submission',
    ],
    accentBg: 'bg-primary',
    accentLight: 'bg-primary-light',
    accentText: 'text-primary',
    link: '/register',
    cta: 'Register as student',
  },
  {
    role: 'Warden',
    tagline: 'Manage operations effortlessly',
    description: 'Your entire workflow — approvals, complaints, attendance — in one clean dashboard. No more paper registers.',
    imageSrc: '', // <-- Add warden/staff at desk photo URL here
    imageAlt: 'Warden managing hostel',
    capabilities: [
      'Approve / reject bookings',
      'Approve / reject gate passes',
      'QR scan for student returns',
      'View today\'s attendance',
      'Manage complaints',
      'Broadcast announcements',
    ],
    accentBg: 'bg-success',
    accentLight: 'bg-success-light',
    accentText: 'text-success',
    link: '/login',
    cta: 'Warden sign in',
  },
  {
    role: 'Admin',
    tagline: 'Full oversight, zero guesswork',
    description: 'See every metric, manage the room inventory, generate bills, and provision staff accounts — all from one dashboard.',
    imageSrc: '', // <-- Add admin/dean at computer photo URL here
    imageAlt: 'Admin overview',
    capabilities: [
      'Room inventory management',
      'Monthly bill generation',
      'Analytics & charts',
      'Create warden/admin accounts',
      'Audit log access',
      'System-wide broadcasts',
    ],
    accentBg: 'bg-warning',
    accentLight: 'bg-warning-light',
    accentText: 'text-warning',
    link: '/login',
    cta: 'Admin sign in',
  },
];

const Roles = () => (
  <section id="roles" className="py-24 px-6 bg-white dark:bg-gray-950 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Roles</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Three roles, one system
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto transition-colors duration-300">
            Every user type gets a purpose-built dashboard with exactly the tools they need.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ROLES.map(({ role, tagline, description, imageSrc, imageAlt, capabilities, accentBg, accentLight, accentText, link, cta }, i) => (
          <Reveal key={role} delay={i * 100}>
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1.5 group h-full">
              {/* Role card image */}
              <div className="h-52 relative overflow-hidden">
                <ImagePlaceholder
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full"
                  overlay={true}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className={`inline-flex self-start px-3 py-1 ${accentBg} rounded-full mb-2 transition-transform duration-300 group-hover:scale-105`}>
                    <span className="text-white text-xs font-bold">{role}</span>
                  </div>
                  <h3 className="text-white text-lg font-bold leading-tight">{tagline}</h3>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-900 transition-colors duration-300">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed transition-colors duration-300">{description}</p>
                <ul className="space-y-2 mb-5">
                  {capabilities.map(cap => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      <FiCheckCircle size={12} className={accentText + ' shrink-0'} />
                      {cap}
                    </li>
                  ))}
                </ul>
                <Link
                  to={link}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${accentText} hover:opacity-80 transition-all duration-200 group/link`}
                >
                  {cta} <FiArrowRight size={12} className="transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── TESTIMONIAL / SOCIAL PROOF ───────────────────────────────────────────────
const SocialProof = () => (
  <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Built for real use</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Designed with hostel life in mind</h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Photo cards — replace image URLs with real hostel photos */}
        {[
          {
            imageSrc: '', // <-- Add hostel common room photo URL here
            imageAlt: 'Students in common room',
            quote: 'No more standing in queues to book a room or submit a complaint. Everything is just a click away.',
            name: 'Student, Batch 2024',
          },
          {
            imageSrc: '', // <-- Add hostel corridor photo URL here
            imageAlt: 'Hostel corridor',
            quote: 'Managing 300+ students used to take hours. The dashboard cut my daily admin work in half.',
            name: 'Hostel Warden',
          },
          {
            imageSrc: '', // <-- Add admin/office photo URL here
            imageAlt: 'Admin office',
            quote: 'The audit trail and analytics give me real visibility into hostel operations for the first time.',
            name: 'Dean of Student Affairs',
          },
        ].map(({ imageSrc, imageAlt, quote, name }, i) => (
          <Reveal key={name} delay={i * 90}>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1.5 h-full">
              <div className="h-44 overflow-hidden">
                <ImagePlaceholder
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full"
                />
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed mb-4 transition-colors duration-300">"{quote}"</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 transition-colors duration-300">— {name}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA ──────────────────────────────────────────────────────────────────────
const CTA = () => (
  <section className="py-24 px-6 bg-white dark:bg-gray-950 transition-colors duration-300">
    <div className="max-w-5xl mx-auto">
      <Reveal>
        <div className="relative rounded-3xl overflow-hidden group">
          {/* Background image */}
          <ImagePlaceholder
            src="" // <-- Add a wide hostel building / campus aerial photo URL here
            alt="Hostel campus"
            className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-primary/80" />

          <div className="relative z-10 px-8 py-16 sm:px-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to digitize your hostel?
            </h2>
            <p className="text-white/75 text-sm mb-10 max-w-lg mx-auto leading-relaxed">
              Register as a student today, or contact your warden to set up your institution on HostelOS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-xl hover:scale-105 active:scale-95 text-sm">
                Student registration <FiArrowRight size={15} />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200 hover:scale-105 active:scale-95 text-sm">
                Staff sign in
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-gray-900 dark:bg-black text-white py-12 px-6 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5 mb-3 group cursor-pointer w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <LuBuilding2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">HostelOS</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            A complete digital hostel management system for modern college hostels.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-semibold text-white mb-3">Product</p>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">How it works</a></li>
              <li><a href="#roles" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">Roles</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Access</p>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/register" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">Student Register</Link></li>
              <li><Link to="/login" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">Staff Login</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Built with</p>
            <ul className="space-y-2 text-gray-400">
              <li>React</li>
              <li>Node.js</li>
              <li>MongoDB</li>
              <li>Python Flask</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
        <p>© 2026 HostelOS. Built as a college minor project.</p>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-white transition-colors duration-200">Sign in</Link>
          <Link to="/register" className="hover:text-white transition-colors duration-200">Register</Link>
        </div>
      </div>
    </div>
  </footer>
);

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const Landing = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <GlobalAnimationStyles />
      <LandingNav isDark={isDark} toggleTheme={toggleTheme} />
      <Hero />
      <Features />
      <DashboardPreview />
      <HowItWorks />
      <Roles />
      <SocialProof />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
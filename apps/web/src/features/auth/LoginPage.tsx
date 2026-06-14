import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authClient } from '@/lib/authClient';
import { api } from '@/lib/api';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { User } from '@the-prophet/shared';

function ConfettiOrb({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}) {
  return <div className={`absolute rounded-full animate-confetti ${className}`} style={style} />;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Where to go after login — preserves invite links like /join?code=… (?next=)
  const next = params.get('next') || '/groups';

  // If already logged in, go straight to the destination
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, next]);

  async function handleGoogleLogin() {
    // The Better Auth client redirects the browser to Google and, after the
    // callback, back to callbackURL. callbackURL must be an absolute URL on the
    // WEB origin — a relative path would resolve against the API base URL.
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}${next}`,
    });
    if (error) {
      console.error('[login] Google sign-in failed:', error);
    }
  }

  async function handleGuestLogin() {
    const { error } = await authClient.signIn.anonymous();
    if (error) {
      console.error('[login] guest sign-in failed:', error);
      return;
    }
    // requireAuth auto-creates our domain user on the first authenticated call;
    // GET /api/me returns it (with provider/isSuperAdmin/managedBy).
    try {
      const user = await api.get<User>('/api/me');
      useAuthStore.getState().setUser(user);
      navigate(next, { replace: true });
    } catch (err) {
      console.error('[login] profile fetch failed:', err);
    }
  }

  return (
    <div className="flex flex-col min-h-screen text-(--color-on-background) overflow-x-hidden">
      {/* Decorative background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <ConfettiOrb
          className="top-10 left-10 w-4 h-4 bg-stadium-green-light opacity-20"
          style={{ animationDelay: '0s' }}
        />
        <ConfettiOrb
          className="top-20 right-20 w-3 h-3 bg-secondary-container opacity-20"
          style={{ animationDelay: '2s' }}
        />
        <ConfettiOrb
          className="top-40 left-1/4 w-5 h-5 bg-tertiary-container opacity-10"
          style={{ animationDelay: '5s' }}
        />
        <ConfettiOrb
          className="top-60 right-1/3 w-4 h-4 bg-action-blue opacity-20"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Main canvas */}
      <main className="grow flex flex-col items-center justify-center relative z-10 px-4 md:px-10 py-6 max-w-lg mx-auto w-full">
        {/* Branding */}
        <div className="flex items-center gap-2 mb-8">
          <MaterialIcon
            icon="sports_soccer"
            className="text-stadium-green-light text-4xl"
          />
          <span className="text-xl font-bold text-stadium-green-dark">The Prophet</span>
        </div>

        {/* Hero */}
        <div className="w-full flex flex-col items-center mb-8">
          {/* Hero image: centered ball + trophy/contacts badges. A radial mask
              fades the outer edge to transparent so it blends into the page
              background instead of showing a square margin. */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 mb-6 animate-float">
            <img
              src="/hero-ball.png"
              alt="Balón de fútbol en el estadio"
              className="w-full h-full object-contain"
              style={{
                WebkitMaskImage: 'radial-gradient(circle at center, #000 78%, transparent 100%)',
                maskImage: 'radial-gradient(circle at center, #000 78%, transparent 100%)',
              }}
            />
          </div>

          {/* Headline */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-stadium-green-dark leading-tight">
              Mundialito 2026
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xs mx-auto">
              ¡Predice, compite y gana en familia!
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="w-full bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] p-6 space-y-4 border border-surface-container">
          {/* Google Sign In */}
          <div className="relative p-0.5 rounded-full w-full group">
            {/* Clockwise border beam on hover */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-border-spin"
              style={{
                background:
                  'conic-gradient(from var(--border-angle), transparent 72%, #1976d2 83%, transparent 88%)',
              }}
            />
            <button
              onClick={handleGoogleLogin}
              className="relative button-press w-full bg-stadium-green-dark text-white font-bold h-12 rounded-full flex items-center justify-center gap-4 transition-all z-10"
            >
              <GoogleIcon />
              Continuar con Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="grow border-t border-outline-variant" />
            <span className="shrink mx-4 text-xs font-medium text-on-surface-variant">
              o también
            </span>
            <div className="grow border-t border-outline-variant" />
          </div>

          {/* Guest */}
          <button
            onClick={handleGuestLogin}
            className="w-full bg-white border-2 border-outline-variant text-on-surface-variant font-bold h-12 rounded-full flex items-center justify-center button-press transition-all"
          >
            Entrar como invitado
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-outline px-4 leading-relaxed">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="text-stadium-green-light font-medium">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="text-stadium-green-light font-medium">
              Política de Privacidad
            </a>
            .
          </p>
        </footer>
      </main>

      {/* Stadium crowd silhouette */}
      <div className="relative w-full h-24 mt-auto overflow-hidden opacity-10">
        <div className="absolute bottom-0 w-full h-full bg-stadium-green-dark stadium-curve" />
        <div className="absolute bottom-0 flex justify-around w-full px-4">
          {[8, 12, 6, 10, 8, 14, 7, 11].map((h, i) => (
            <div
              key={i}
              className="w-4 bg-stadium-green-light rounded-t-full"
              style={{ height: `${h * 4}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

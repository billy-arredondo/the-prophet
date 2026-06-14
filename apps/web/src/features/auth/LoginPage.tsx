import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
  const { isAuthenticated, isLoading } = useAuthStore();

  // If already logged in, go straight to groups
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/groups', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  function handleGoogleLogin() {
    // Redirect to API OAuth endpoint — Better Auth handles the flow
    window.location.href = `${API_URL}/api/auth/google`;
  }

  function handleGuestLogin() {
    // POST to guest endpoint
    fetch(`${API_URL}/api/auth/guest`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((user) => {
        useAuthStore.getState().setUser(user);
        navigate('/groups', { replace: true });
      })
      .catch(console.error);
  }

  return (
    <div className="flex flex-col min-h-screen text-(--color-on-background) overflow-x-hidden">
      {/* Decorative background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <ConfettiOrb
          className="top-10 left-10 w-4 h-4 bg-(--color-stadium-green-light) opacity-20"
          style={{ animationDelay: '0s' }}
        />
        <ConfettiOrb
          className="top-20 right-20 w-3 h-3 bg-(--color-secondary-container) opacity-20"
          style={{ animationDelay: '2s' }}
        />
        <ConfettiOrb
          className="top-40 left-1/4 w-5 h-5 bg-(--color-tertiary-container) opacity-10"
          style={{ animationDelay: '5s' }}
        />
        <ConfettiOrb
          className="top-60 right-1/3 w-4 h-4 bg-(--color-action-blue) opacity-20"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Main canvas */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 md:px-10 py-6 max-w-lg mx-auto w-full">
        {/* Branding */}
        <div className="flex items-center gap-2 mb-8">
          <MaterialIcon
            icon="sports_soccer"
            className="text-(--color-stadium-green-light) text-4xl"
          />
          <span className="text-xl font-bold text-(--color-stadium-green-dark)">Mundialito</span>
        </div>

        {/* Hero */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6">
            {/* Glow */}
            <div className="absolute inset-0 bg-(--color-stadium-green-light) opacity-10 blur-3xl rounded-full" />
            {/* Floating ball */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <div className="animate-float relative">
                {/* Placeholder soccer ball SVG */}
                <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-(--color-stadium-green-light) to-(--color-stadium-green-dark) shadow-2xl border-4 border-white flex items-center justify-center">
                  <MaterialIcon
                    icon="sports_soccer"
                    className="text-white text-[120px] md:text-[140px]"
                  />
                </div>
                {/* Trophy badge */}
                <div className="absolute -top-4 -right-4 bg-(--color-secondary-container) p-3 rounded-full shadow-lg border-2 border-white">
                  <MaterialIcon
                    icon="emoji_events"
                    filled
                    className="text-(--color-on-secondary-container)"
                  />
                </div>
                {/* Group badge */}
                <div className="absolute -bottom-2 -left-2 bg-(--color-action-blue) p-3 rounded-full shadow-lg border-2 border-white">
                  <MaterialIcon icon="group" filled className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-(--color-stadium-green-dark) leading-tight">
              Mundialito 2026
            </h1>
            <p className="text-lg text-(--color-on-surface-variant) max-w-xs mx-auto">
              Predice, Compite, Gana en Familia
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="w-full bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] p-6 space-y-4 border border-(--color-surface-container)">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="button-press w-full bg-(--color-stadium-green-light) hover:bg-(--color-stadium-green-dark) text-white font-bold h-12 rounded-full flex items-center justify-center gap-4 transition-all"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-(--color-outline-variant)" />
            <span className="flex-shrink mx-4 text-xs font-medium text-(--color-on-surface-variant)">
              o también
            </span>
            <div className="flex-grow border-t border-(--color-outline-variant)" />
          </div>

          {/* Email (placeholder for MVP) */}
          <button
            disabled
            className="w-full bg-white border-2 border-(--color-outline-variant) text-(--color-on-surface-variant) font-bold h-12 rounded-full flex items-center justify-center opacity-50 cursor-not-allowed"
            title="Próximamente"
          >
            Usar correo electrónico
          </button>

          {/* Guest */}
          <div className="text-center pt-1">
            <button
              onClick={handleGuestLogin}
              className="text-sm font-bold text-(--color-on-surface-variant) hover:text-(--color-stadium-green-dark) underline underline-offset-4 transition-colors"
            >
              Entrar como Invitado
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-(--color-outline) px-4 leading-relaxed">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="text-(--color-stadium-green-light) font-medium">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="text-(--color-stadium-green-light) font-medium">
              Política de Privacidad
            </a>
            .
          </p>
        </footer>
      </main>

      {/* Stadium crowd silhouette */}
      <div className="relative w-full h-24 mt-auto overflow-hidden opacity-10">
        <div className="absolute bottom-0 w-full h-full bg-(--color-stadium-green-dark) stadium-curve" />
        <div className="absolute bottom-0 flex justify-around w-full px-4">
          {[8, 12, 6, 10, 8, 14, 7, 11].map((h, i) => (
            <div
              key={i}
              className="w-4 bg-(--color-stadium-green-light) rounded-t-full"
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
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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

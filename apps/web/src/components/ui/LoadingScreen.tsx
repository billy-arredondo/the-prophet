import { MaterialIcon } from './MaterialIcon';

interface Props {
  /** Text shown under the spinner. */
  label?: string;
  /** Full-viewport height (route/session restore) vs inline (content area). */
  fullscreen?: boolean;
}

/**
 * Branded loading indicator: a floating, spinning ball matching the login hero.
 * Used for route Suspense fallbacks and session restore.
 */
export function LoadingScreen({ label = 'Cargando…', fullscreen = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullscreen ? 'min-h-screen' : 'flex-1 min-h-[50vh]'
      }`}
    >
      <div className="relative animate-float">
        <div className="absolute inset-0 bg-stadium-green-light opacity-20 blur-2xl rounded-full" />
        <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-stadium-green-light to-stadium-green-dark border-2 border-white shadow-lg flex items-center justify-center">
          <MaterialIcon
            icon="sports_soccer"
            size={34}
            className="text-white animate-spin [animation-duration:2.5s]"
          />
        </div>
      </div>
      <p className="text-sm font-medium text-(--color-on-surface-variant)">{label}</p>
    </div>
  );
}

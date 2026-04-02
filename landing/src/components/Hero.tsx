"use client";

interface HeroProps {
  stars: number | null;
}

export function Hero({ stars }: HeroProps) {
  return (
    <section className="relative flex-1 px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Title */}
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="gradient-text">2FA</span> sin sacar el celular
        </h1>

        {/* Problem & Solution Cards */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {/* Problem */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="mb-3 flex items-center gap-2 text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-semibold uppercase tracking-wide">El problema</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Buscar celular, desbloquearlo, abrir la app, encontrar la cuenta correcta, memorizar el codigo y escribirlo antes de que expire.
            </p>
          </div>

          {/* Solution */}
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
            <div className="mb-3 flex items-center gap-2 text-green-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold uppercase tracking-wide">La solucion</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Un espejo de tu authenticator en el navegador. Click en la extension, click en copiar. Tus codigos sincronizados, sin depender del celular.
            </p>
          </div>
        </div>

        {/* How to use */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-6 text-center text-xl font-semibold text-white">Como funciona</h2>
          <div className="space-y-4 text-gray-400">
            <div className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">1</span>
              <p>Cuando actives 2FA en cualquier servicio, escanea el QR o copia la clave secreta <span className="text-white">tanto en tu app movil como en la extension</span>.</p>
            </div>
            <div className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">2</span>
              <p>Ambos generaran los mismos codigos. Usa el que tengas mas a mano.</p>
            </div>
            <div className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">3</span>
              <p>Puedes exportar e importar tus cuentas si necesitas usarlas en otro navegador.</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Chrome - Disabled */}
          <div className="inline-flex cursor-not-allowed items-center gap-3 rounded-2xl bg-white/10 px-8 py-4 text-base font-semibold text-white/50">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29L1.931 5.47zm13.342 2.166a5.446 5.446 0 0 1 1.819 7.911l-3.953 6.848A12.048 12.048 0 0 0 24 12c0-.653-.055-1.291-.145-1.918H15.273a5.387 5.387 0 0 1 0-2.446zM12 16.364a4.364 4.364 0 1 0 0-8.728 4.364 4.364 0 0 0 0 8.728z" />
            </svg>
            <span>En revision por Chrome</span>
          </div>

          {/* GitHub Stars */}
          <a
            href="https://github.com/asther0/TOTP-Extension"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white transition-all hover:border-white/40 hover:bg-white/10"
          >
            <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
            </svg>
            {stars !== null && (
              <span className="font-mono text-sm">{stars}</span>
            )}
          </a>
        </div>
      </div>
    </section>
  );
}

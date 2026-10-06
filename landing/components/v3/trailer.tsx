import { Reveal } from './reveal'

export function Trailer() {
  return (
    <section id="video" className="mx-auto max-w-6xl px-6 pt-20 sm:px-10 sm:pt-28">
      <Reveal>
        <h2 className="text-center text-[clamp(1.7rem,3.2vw,2.4rem)] leading-[1.14] font-medium tracking-[-0.03em] text-balance">
          O eilo em 30 segundos.
        </h2>
        <div className="mt-9 overflow-hidden rounded-[1.5rem] border border-[var(--v3-line)] bg-[var(--v3-lilac)] shadow-[0_30px_80px_-40px_rgba(67,61,86,0.45)] sm:rounded-[2rem]">
          <video
            controls
            playsInline
            preload="none"
            poster="/video/eilo-30s-capa.webp"
            aria-label="Vídeo de 30 segundos apresentando o eilo"
            className="block aspect-video w-full"
          >
            <source src="/video/eilo-30s.mp4" type="video/mp4" />
          </video>
        </div>
      </Reveal>
    </section>
  )
}

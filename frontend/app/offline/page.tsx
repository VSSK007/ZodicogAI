import { Star4 } from "@/components/ui/glyphs";
import RetryButton from "@/app/offline/RetryButton";

/**
 * Shown by the service worker (public/sw.js) when a page can't be loaded
 * without a network. Fully static so it can be cached at install time.
 */
export default function OfflinePage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <Star4 size={18} className="text-gold" />
      <p className="mt-5 font-display font-extrabold text-micro tracking-[0.24em] uppercase text-ink-muted">
        No connection
      </p>
      <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.08] text-ink text-balance">
        The stars are out of range.
      </h1>
      <p className="mt-4 text-ink-secondary max-w-md leading-relaxed">
        Readings need a connection to run. Your saved profile and reading history are still on
        this device and will be here when you&apos;re back online.
      </p>
      <RetryButton />
    </main>
  );
}

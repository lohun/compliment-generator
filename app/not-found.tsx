import TransitionLink from "@/components/transitions/TransitionLink";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-5 py-12 text-on-surface">
      <div className="w-full max-w-3xl rounded-[32px] border border-outline-variant/20 bg-surface-container-low p-10 shadow-[0_30px_90px_rgba(43,17,20,0.12)] text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-primary/80 mb-4">
          Page Not Found
        </p>
        <h1 className="text-5xl md:text-6xl font-black text-primary" style={{ fontFamily: "var(--font-playfair-display)" }}>
          The compliment has vanished.
        </h1>
        <p className="mt-4 text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          We couldn't find that result set. Maybe the page was deleted, or the universe simply changed its mind.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <TransitionLink
            href="/"
            className="px-5 py-3 rounded-lg bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-colors duration-200"
          >
            Back to Home
          </TransitionLink>
          <TransitionLink
            href="/form"
            className="px-5 py-3 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors duration-200 text-center"
          >
            Create New Compliment
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}

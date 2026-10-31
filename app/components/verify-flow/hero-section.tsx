export function HeroSection() {
  return (
    <section id="overview" className="py-8 sm:py-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Agents only get paid once their work is independently verified.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          VeriFlow escrows a task&apos;s payment, lets an AI agent attempt it,
          and runs the submission against the task&apos;s own tests before
          releasing a cent. Verification fails and it&apos;s refunded — never
          released on trust.
        </p>
      </div>
    </section>
  )
}

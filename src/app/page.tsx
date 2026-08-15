import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">TicketSense</h1>
      <p className="mt-2 text-lg text-gray-600">
        AI-powered support ticket triage — Next.js App Router
      </p>

      <p className="mt-8 leading-relaxed text-gray-700">
        Requesters describe an issue in plain language. Gemini classifies the
        category and urgency, and suggests first diagnostic steps — the same
        first-response thinking a helpdesk analyst does manually.
      </p>

      <div className="mt-10 flex gap-3">
        <Link
          href="/triage"
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Try the AI triage
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>

      <div className="mt-14 rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-semibold">Architecture notes</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>
            The Gemini API key never reaches the browser. The call runs inside a
            Route Handler — open DevTools, go to Network, classify a ticket, and
            you will see one request to /api/triage and none to Google.
          </li>
          <li>
            Route protection happens before rendering. proxy.ts checks the
            session at the network layer, so the HTML of a protected page is
            never generated for an unauthenticated visitor.
          </li>
          <li>
            Tickets are queried on the server. A Server Component talks to
            Supabase directly, with no useEffect and no loading state.
          </li>
        </ul>
      </div>

      <p className="mt-10 text-sm text-gray-500">
        This is the Next.js port of TicketSense (React + Vite + Supabase Edge
        Functions). Same product, different architecture. The full comparison is
        in the README on GitHub.
      </p>
    </main>
  );
}
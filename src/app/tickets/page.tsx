import { createClient } from "@/lib/supabase/server";

export default async function TicketsPage() {
  const supabase = await createClient();
  const { data: tickets, error } = await supabase.from("tickets").select("*");

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Tickets</h1>
      <pre className="mt-4 rounded bg-gray-100 p-4 text-sm">
        {JSON.stringify(tickets, null, 2)}
      </pre>
    </main>
  );
}
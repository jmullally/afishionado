import { Wordmark } from "@/components/Logo";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-md space-y-5 px-6 py-12">
      <Wordmark />
      <h1 className="font-display text-3xl font-bold">Almost there</h1>
      <p className="text-muted">afishionado needs a Supabase project to store tins, check-ins and photos.</p>
      <ol className="card list-decimal space-y-2 p-5 pl-9 text-sm">
        <li>Create a free project at supabase.com.</li>
        <li>
          In the SQL editor, run <code>supabase/migrations/0001_init.sql</code>, then <code>supabase/seed.sql</code>.
        </li>
        <li>
          Copy <code>.env.local.example</code> to <code>.env.local</code> and fill in your project URL and anon key.
        </li>
        <li>Restart the dev server.</li>
      </ol>
      <p className="text-sm text-muted">Full steps are in the README.</p>
    </main>
  );
}

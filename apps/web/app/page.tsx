export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Steward</h1>
      <p className="text-lg opacity-80">
        Giving &amp; treasury for parishes, schools, and small nonprofits — dollar-simple on the
        surface, stablecoin rails underneath.
      </p>
      <div className="flex flex-col gap-2 text-sm opacity-70">
        <span>Scaffold ready. Next steps:</span>
        <ul className="list-inside list-disc">
          <li>
            Giving page: <code>/give/&lt;org&gt;</code>
          </li>
          <li>
            Staff dashboard: <code>/dashboard</code>
          </li>
          <li>
            Webhooks: <code>/api/webhooks/{`{stripe,bridge,helius}`}</code>
          </li>
        </ul>
      </div>
    </main>
  );
}

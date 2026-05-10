export default function AuthorizedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-white lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Boilerplate</h1>
        </div>
        <nav className="space-y-1 p-4">
          <a href="/dashboard" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">Dashboard</a>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <span className="text-sm text-gray-500">Welcome, User</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

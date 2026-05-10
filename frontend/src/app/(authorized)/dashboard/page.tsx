export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">Welcome to your dashboard.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Users', value: '0', desc: 'Active users' },
          { title: 'Revenue', value: '$0', desc: 'This month' },
          { title: 'Orders', value: '0', desc: 'Pending orders' },
          { title: 'Growth', value: '0%', desc: 'vs last month' },
        ].map((c) => (
          <div key={c.title} className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{c.title}</h3>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
            <p className="mt-1 text-xs text-gray-400">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

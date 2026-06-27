import { Building2 } from 'lucide-react'

export function NavBar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Building2 className="text-blue-400 w-5 h-5" />
        <span className="text-white font-semibold text-lg tracking-tight">Rentor Internal</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-green-400 text-sm font-medium">Live</span>
      </div>
    </nav>
  )
}

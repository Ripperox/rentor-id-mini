import type { CallEntry } from '../types'

interface Props {
  entries: CallEntry[]
}

export function CallLogTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <p className="text-lg font-medium">No calls yet</p>
        <p className="text-sm mt-1">Click "Simulate Incoming Call" to begin</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800/50 text-gray-400 text-left">
            <th className="px-5 py-3 font-medium">Caller</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Property</th>
            <th className="px-5 py-3 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              className={`border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/60'} hover:bg-gray-800/50 transition-colors`}
            >
              <td className="px-5 py-3 text-white font-medium">{entry.person.name}</td>
              <td className="px-5 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    entry.person.role === 'owner' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                  }`}
                >
                  {entry.person.role}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-400">
                {entry.property.address} · Unit {entry.property.unit}
              </td>
              <td className="px-5 py-3 text-gray-500 tabular-nums">
                {entry.timestamp.toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

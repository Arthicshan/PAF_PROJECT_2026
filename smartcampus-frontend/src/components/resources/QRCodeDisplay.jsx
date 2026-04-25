import QRCode from 'react-qr-code'
import { QrCode } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function QRCodeDisplay({ value, resourceName }) {
  const { dark } = useTheme()

  if (!value) return null

  return (
    <div className={`rounded-xl p-4 border text-center ${dark ? 'bg-[#16162a] border-[#2a2a45]' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <QrCode size={14} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
        <span className={`text-xs font-semibold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>QR Check-in</span>
      </div>
      <div className={`inline-block p-3 rounded-xl ${dark ? 'bg-white' : 'bg-white border border-gray-100'}`}>
        <QRCode value={value} size={120} />
      </div>
      <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
        Scan to verify booking for {resourceName}
      </p>
    </div>
  )
}

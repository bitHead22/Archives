import { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { LogOut } from 'lucide-react'

export function UserAvatar() {
  const { user, signOut } = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-8 w-8 rounded-none bg-neutral-800 ring-1 ring-neutral-700 cursor-pointer overflow-hidden text-xs font-bold uppercase text-white hover:bg-neutral-700 transition-colors"
      >
        {user?.email?.charAt(0) || 'U'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black border border-neutral-800 shadow-xl shadow-black z-50">
          <div className="px-4 py-3 border-b border-neutral-800">
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="flex items-center w-full gap-2 px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors text-left"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

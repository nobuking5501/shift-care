'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import { 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Menu, 
  X, 
  LogOut,
  Home
} from 'lucide-react'

interface NavbarProps {
  userRole?: 'staff' | 'admin'
}

export default function Navbar({ userRole = 'staff' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const staffMenuItems = [
    { href: '/staff-dashboard', icon: Home, label: 'スタッフホーム' },
    { href: '/staff-shifts', icon: Calendar, label: 'シフト確認' },
    { href: '/shift-request', icon: Calendar, label: 'シフト希望' },
    { href: '/staff-reports', icon: FileText, label: '日報入力' },
  ]

  const adminMenuItems = [
    { href: '/dashboard', icon: Home, label: '管理者ホーム' },
    { href: '/shifts', icon: Calendar, label: 'シフト管理' },
    { href: '/staff', icon: Users, label: 'スタッフ管理' },
    { href: '/incidents', icon: FileText, label: '事故管理' },
    { href: '/analytics', icon: BarChart3, label: 'レポート' },
  ]

  const menuItems = userRole === 'admin' ? adminMenuItems : staffMenuItems

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              ShiftCare
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">ログアウト</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 btn-touch"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-accessible font-medium">{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 w-full text-left btn-touch"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-accessible font-medium">ログアウト</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
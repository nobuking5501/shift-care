'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, X, CheckCircle, AlertTriangle, Info, Calendar, User } from 'lucide-react'

interface Notification {
  id: string
  type: 'shift_update' | 'request_approved' | 'request_rejected' | 'new_shift' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  metadata?: any
}

interface RealtimeNotificationsProps {
  userId: string
  userRole: 'staff' | 'admin'
}

export default function RealtimeNotifications({ userId, userRole }: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // リアルタイム購読の設定
    const setupRealtimeSubscriptions = () => {
      // シフト変更の監視
      const shiftChannel = supabase
        .channel('shift_notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'generated_shifts',
            filter: userRole === 'staff' ? `user_id=eq.${userId}` : undefined,
          },
          (payload) => {
            handleShiftNotification(payload)
          }
        )
        .subscribe()

      // 休日希望の監視 (スタッフ用)
      const requestChannel = supabase
        .channel('request_notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'shift_requests',
            filter: userRole === 'staff' ? `staff_id=eq.${userId}` : undefined,
          },
          (payload) => {
            handleRequestNotification(payload)
          }
        )
        .subscribe()

      return () => {
        shiftChannel.unsubscribe()
        requestChannel.unsubscribe()
      }
    }

    const cleanup = setupRealtimeSubscriptions()
    return cleanup
  }, [userId, userRole])

  const handleShiftNotification = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    let notification: Notification | null = null

    switch (eventType) {
      case 'INSERT':
        notification = {
          id: `shift_new_${newRecord.id}_${Date.now()}`,
          type: 'new_shift',
          title: '新しいシフトが作成されました',
          message: `${new Date(newRecord.date).toLocaleDateString('ja-JP')} ${newRecord.shift_type}のシフトが追加されました`,
          timestamp: new Date().toISOString(),
          read: false,
          metadata: newRecord
        }
        break
      case 'UPDATE':
        if (oldRecord?.shift_type !== newRecord?.shift_type ||
            oldRecord?.start_time !== newRecord?.start_time) {
          notification = {
            id: `shift_update_${newRecord.id}_${Date.now()}`,
            type: 'shift_update',
            title: 'シフト変更通知',
            message: `${new Date(newRecord.date).toLocaleDateString('ja-JP')}のシフトが変更されました`,
            timestamp: new Date().toISOString(),
            read: false,
            metadata: { old: oldRecord, new: newRecord }
          }
        }
        break
    }

    if (notification) {
      setNotifications(prev => [notification!, ...prev.slice(0, 9)]) // 最大10件まで
      setUnreadCount(prev => prev + 1)

      // ブラウザ通知 (権限がある場合)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    }
  }

  const handleRequestNotification = (payload: any) => {
    const { new: newRecord } = payload

    if (newRecord.status !== 'pending') {
      const notification: Notification = {
        id: `request_${newRecord.status}_${newRecord.id}_${Date.now()}`,
        type: newRecord.status === 'approved' ? 'request_approved' : 'request_rejected',
        title: newRecord.status === 'approved' ? '休日希望が承認されました' : '休日希望が却下されました',
        message: `${newRecord.target_month}の休日希望が${newRecord.status === 'approved' ? '承認' : '却下'}されました`,
        timestamp: new Date().toISOString(),
        read: false,
        metadata: newRecord
      }

      setNotifications(prev => [notification, ...prev.slice(0, 9)])
      setUnreadCount(prev => prev + 1)

      // ブラウザ通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'shift_update':
      case 'new_shift':
        return <Calendar className="w-4 h-4" />
      case 'request_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'request_rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'request_approved':
        return 'bg-green-50 border-green-200'
      case 'request_rejected':
        return 'bg-red-50 border-red-200'
      case 'shift_update':
      case 'new_shift':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  // ブラウザ通知の許可を要求
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="relative">
      {/* 通知ベルアイコン */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知パネル */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">通知</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    すべて既読
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>通知はありません</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearNotification(notification.id)
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full absolute left-2 top-1/2 transform -translate-y-1/2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
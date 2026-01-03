"use client"

import { useEffect, useState } from "react"
import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, BookOpen, Megaphone } from "lucide-react"
import { api } from "@/lib/api"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.getStudentNotifications()
      if (response.notifications) {
        // Map backend notification types to icons and colors
        const mapped = response.notifications.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          timestamp: new Date(n.created_at).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          sender: "Library Admin",
          icon: getIconForType(n.type),
          color: getColorForType(n.type)
        }))
        setNotifications(mapped)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "overdue": return AlertTriangle
      case "due_soon": return Clock
      case "available": return BookOpen
      case "announcement": return Megaphone
      default: return Megaphone
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case "overdue": return "text-destructive"
      case "due_soon": return "text-orange-500" // chart-3 might not be defined in tailwind config explicitly
      case "available": return "text-primary"
      case "announcement": return "text-blue-500" // accent might be subtle
      default: return "text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated with your library activity</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Recent alerts and announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading notifications...</p>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-4 p-4 rounded-lg border ${notification.read ? "bg-background" : "bg-muted/50"}`}
                    >
                      <div className={`mt-0.5 ${notification.color}`}>
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="font-semibold">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">From: {notification.sender}</p>
                          </div>
                          {!notification.read && <Badge className="bg-primary text-primary-foreground">New</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No notifications found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

"use client"

import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, AlertTriangle, IndianRupee, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRealtimeSubscription } from "@/lib/useRealtimeSubscription"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState([
    { title: "Books Borrowed", value: "0", icon: BookOpen, color: "text-primary" },
    { title: "Due Soon", value: "0", icon: Clock, color: "text-chart-3" },
    { title: "Overdue", value: "0", icon: AlertTriangle, color: "text-destructive" },
    { title: "Total Fine", value: "₹0", icon: IndianRupee, color: "text-chart-2" },
  ])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Wrap fetchData in useCallback so it can be called from Realtime subscription
  const fetchData = useCallback(async () => {
    try {
      const dashboardData = await api.getStudentDashboard()
      const historyData = await api.getBorrowHistory()

      // Update stats
      if (dashboardData.summary) {
        setStats([
          { title: "Books Borrowed", value: String(dashboardData.summary.currently_borrowed || 0), icon: BookOpen, color: "text-primary" },
          { title: "Due Soon", value: String(dashboardData.summary.due_soon || 0), icon: Clock, color: "text-chart-3" },
          { title: "Overdue", value: String(dashboardData.summary.overdue || 0), icon: AlertTriangle, color: "text-destructive" },
          { title: "Total Fine", value: `₹${dashboardData.summary.total_fine || 0}`, icon: IndianRupee, color: "text-chart-2" },
        ])
      }

      // Update recent activity (take top 3)
      if (historyData.history) {
        const mappedHistory = historyData.history.slice(0, 3).map((item: any) => ({
          book: item.title || "Unknown Book",
          action: item.status === "borrowed" ? "Borrowed" : "Returned",
          date: new Date(item.borrow_date).toLocaleDateString(),
          status: item.status === "borrowed" ? "active" : "returned"
        }))
        setRecentActivity(mappedHistory)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Subscribe to real-time updates on borrow_logs table (where IoT writes)
  useRealtimeSubscription({
    table: "borrow_logs",
    event: "*",
    onEvent: useCallback(() => {
      console.log("[Realtime] Borrow log event detected, refreshing dashboard...")
      fetchData()
    }, [fetchData])
  })

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "Student"}!</h1>
            <p className="text-muted-foreground mt-1">Here's your library activity overview</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Alerts Section */}
          {Number(stats[2].value) > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Overdue Book</AlertTitle>
                <AlertDescription>
                  You have books that are overdue. Please check your current books list.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your last 3 library transactions</CardDescription>
                  </div>
                  <Link href="/student/books">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{activity.book}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                        <Badge variant={activity.status === "active" ? "default" : "secondary"}>{activity.action}</Badge>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

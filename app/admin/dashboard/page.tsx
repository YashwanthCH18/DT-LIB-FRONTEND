"use client"

import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { useRealtimeSubscription } from "@/lib/useRealtimeSubscription"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: "Total Books", value: "0", icon: BookOpen, color: "text-primary" },
    { title: "Active Borrows", value: "0", icon: TrendingUp, color: "text-accent" },
    { title: "Overdue Books", value: "0", icon: AlertTriangle, color: "text-destructive" },
    { title: "Active Students", value: "0", icon: Users, color: "text-chart-3" },
  ])
  const [loading, setLoading] = useState(true)

  const [borrowTrendData, setBorrowTrendData] = useState<any[]>([])
  const [overdueTrendData, setOverdueTrendData] = useState<any[]>([])

  // Active Borrows Sheet State
  const [activeBorrowsSheetOpen, setActiveBorrowsSheetOpen] = useState(false)
  const [activeBorrowsList, setActiveBorrowsList] = useState<any[]>([])
  const [loadingBorrows, setLoadingBorrows] = useState(false)

  // Wrap fetchStats in useCallback for Realtime subscription
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getAdminDashboard()
      if (data.summary) {
        setStats([
          { title: "Total Books", value: String(data.summary.total_books || 0), icon: BookOpen, color: "text-primary" },
          { title: "Active Borrows", value: String(data.summary.active_borrows || 0), icon: TrendingUp, color: "text-accent" },
          { title: "Overdue Books", value: String(data.summary.overdue_borrows || 0), icon: AlertTriangle, color: "text-destructive" },
          { title: "Active Students", value: String(data.summary.total_students || 0), icon: Users, color: "text-chart-3" },
        ])
      }
      if (data.borrow_trends) setBorrowTrendData(data.borrow_trends)
      if (data.overdue_trends) setOverdueTrendData(data.overdue_trends)
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch active borrows for sheet
  const fetchActiveBorrows = useCallback(async () => {
    setLoadingBorrows(true)
    try {
      const data = await api.getBorrowLogs({ action: "borrow" })
      setActiveBorrowsList(data.logs || [])
    } catch (error) {
      console.error("Failed to fetch active borrows:", error)
    } finally {
      setLoadingBorrows(false)
    }
  }, [])

  // Handle Active Borrows card click
  const handleActiveBorrowsClick = () => {
    setActiveBorrowsSheetOpen(true)
    fetchActiveBorrows()
  }

  // Initial data fetch
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Subscribe to real-time updates on borrow_logs table (where IoT writes)
  useRealtimeSubscription({
    table: "borrow_logs",
    event: "*",
    onEvent: useCallback(() => {
      console.log("[Realtime] Borrow log event detected, refreshing admin dashboard...")
      fetchStats()
    }, [fetchStats])
  })

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">System overview and analytics</p>
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
                <Card
                  className={stat.title === "Active Borrows" ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}
                  onClick={stat.title === "Active Borrows" ? handleActiveBorrowsClick : undefined}
                >
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

          {/* Charts */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="min-w-0 w-full"
            >
              <Card className="min-w-0 h-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Daily Borrow Trends</CardTitle>
                  <CardDescription>Books borrowed in the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      borrows: {
                        label: "Borrows",
                        color: "#8b5cf6", // Violet-500
                      },
                    }}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={borrowTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" width={30} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="borrows" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="min-w-0 w-full"
            >
              <Card className="min-w-0 h-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Overdue Trends</CardTitle>
                  <CardDescription>Overdue books over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      overdue: {
                        label: "Overdue",
                        color: "#ef4444", // Red-500
                      },
                    }}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overdueTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" width={30} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="overdue"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/admin/logs">
                  <Button variant="outline" className="w-full justify-between bg-transparent h-auto py-4">
                    <span>View Transaction Logs</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/admin/inventory">
                  <Button variant="outline" className="w-full justify-between bg-transparent h-auto py-4">
                    <span>Manage Inventory</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/admin/content">
                  <Button variant="outline" className="w-full justify-between bg-transparent h-auto py-4">
                    <span>Upload Resources</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Active Borrows Sheet */}
      <Sheet open={activeBorrowsSheetOpen} onOpenChange={setActiveBorrowsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Active Borrows</SheetTitle>
            <SheetDescription>Currently borrowed books and their borrowers</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {loadingBorrows ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : activeBorrowsList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active borrows</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBorrowsList.map((borrow: any) => (
                    <TableRow key={borrow.id}>
                      <TableCell className="font-medium">
                        {borrow.user_profiles?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{borrow.books?.title || "Unknown"}</TableCell>
                      <TableCell>{new Date(borrow.borrow_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(borrow.due_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}


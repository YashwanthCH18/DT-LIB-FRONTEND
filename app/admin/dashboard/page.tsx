"use client"

import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: "Total Books", value: "0", icon: BookOpen, color: "text-primary" },
    { title: "Books Borrowed", value: "0", icon: TrendingUp, color: "text-accent" },
    { title: "Overdue Books", value: "0", icon: AlertTriangle, color: "text-destructive" },
    { title: "Active Students", value: "0", icon: Users, color: "text-chart-3" },
  ])
  const [loading, setLoading] = useState(true)

  const [borrowTrendData, setBorrowTrendData] = useState<any[]>([])
  const [overdueTrendData, setOverdueTrendData] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
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
    }
    fetchStats()
  }, [])

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
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>Daily Borrow Trends</CardTitle>
                <CardDescription>Books borrowed in the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    borrows: {
                      label: "Borrows",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={borrowTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="borrows" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>Overdue Trends</CardTitle>
                <CardDescription>Overdue books over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    overdue: {
                      label: "Overdue",
                      color: "hsl(var(--destructive))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overdueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="overdue"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--destructive))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
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
    </div>
  )
}

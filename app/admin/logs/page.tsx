"use client"

import { useState } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { api } from "@/lib/api"
import { useEffect } from "react"

export default function LogsPage() {
  const [actionFilter, setActionFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.getBorrowLogs()
        if (response.logs) {
          const mappedLogs = response.logs.map((log: any) => ({
            id: log.id,
            student: log.user_profiles?.name || log.user_profiles?.email || "Unknown",
            book: log.books?.title || "Unknown Book",
            action: log.status === 'borrowed' ? 'Borrowed' : (log.return_date ? 'Returned' : 'Unknown'),
            date: new Date(log.borrow_date || log.created_at).toLocaleString(),
            status: log.status === 'borrowed' ? 'active' : 'completed' // Simple mapping
          }))
          // Simplified status logic for now, real logic might need due date comparison
          setLogs(mappedLogs)
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === "all" || log.action.toLowerCase() === actionFilter.toLowerCase()
    const matchesSearch = searchTerm === "" ||
      log.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.book.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAction && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Borrow & Return Logs</h1>
            <p className="text-muted-foreground mt-1">Complete transaction history</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Filters</CardTitle>
              <CardDescription>Filter logs by action, student, or book</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student or book..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All borrow and return activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.student}</TableCell>
                        <TableCell>{log.book}</TableCell>
                        <TableCell>
                          <Badge variant={log.action === "Borrowed" ? "default" : "secondary"}>{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === "overdue" ? "destructive" : log.status === "active" ? "default" : "secondary"
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

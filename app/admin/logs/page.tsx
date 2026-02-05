"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter, History, ArrowRight, Calendar, ArrowUpDown } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRealtimeSubscription } from "@/lib/useRealtimeSubscription"
import { motion, AnimatePresence } from "framer-motion"
import { parseISO, format } from "date-fns"

export default function LogsPage() {
  const { token } = useAuth()
  const [actionFilter, setActionFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // New Filters
  const [sortBy, setSortBy] = useState("newest")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)

      const filters: any = {
        sort_by: sortBy
      }
      if (actionFilter !== "all") filters.action = actionFilter
      // Use 'search' param instead of 'student_id' allows backend to handle name/id search
      if (searchTerm) filters.search = searchTerm
      if (dateFrom) filters.date_from = new Date(dateFrom).toISOString()
      // Set end of the day for date_to if only single date provided, or handle range
      // Ideally: timestamp works with ISO strings. 
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        filters.date_to = d.toISOString()
      }

      // FIX: Removed 'token' argument. api.getIotLogs takes (params)
      const response = await api.getIotLogs(filters)

      if (response.logs) {
        const mappedLogs = response.logs.map((log: any) => ({
          id: log.id,
          student: log.student_name || log.Student_id || "Unknown",
          book: log.in_inventory
            ? log.book_title
            : `${log.book_uid} (Not in inventory)`,
          action: log.action === 'borrow' ? 'Borrowed' : (log.action === 'return' ? 'Returned' : log.action),
          date: log.timestamp ? new Date(log.timestamp).toLocaleString() : "Not recorded",
          status: log.action === 'borrow' ? 'active' : 'completed'
        }))
        setLogs(mappedLogs)
      }
    } catch (error) {
      console.error("Failed to fetch IoT logs:", error)
    } finally {
      setLoading(false)
    }
  }, [actionFilter, sortBy, dateFrom, dateTo, searchTerm]) // searchTerm usually requires debounce

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs()
    }, 500)
    return () => clearTimeout(timeout)
  }, [fetchLogs])

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Borrow & Return Logs</h1>
              <p className="text-muted-foreground mt-1">Real-time transaction history from RFID Gates</p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search Student Name or ID..."
                      className="pl-9 bg-secondary/50 border-white/10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Action Filter */}
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="bg-secondary/50 border-white/10">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Action" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="borrow">Borrowed</SelectItem>
                      <SelectItem value="return">Returned</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Range */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none">
                        <Calendar className="h-4 w-4 opacity-50" />
                      </div>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="pl-9 bg-secondary/50 border-white/10 text-xs"
                        placeholder="From"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="pl-3 bg-secondary/50 border-white/10 text-xs"
                        placeholder="To"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-secondary/50 border-white/10">
                      <div className="flex items-center">
                        <ArrowUpDown className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Sort" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-white/10 overflow-hidden shadow-xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="font-semibold text-foreground">Student</TableHead>
                      <TableHead className="font-semibold text-foreground">Book</TableHead>
                      <TableHead className="font-semibold text-foreground">Action</TableHead>
                      <TableHead className="font-semibold text-foreground">Date & Time</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : logs.length > 0 ? (
                        logs.map((log, index) => (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="font-medium">{log.student}</TableCell>
                            <TableCell className="text-muted-foreground">{log.book}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`border-0 ${log.action === "Borrowed" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}
                              >
                                {log.action === "Borrowed" ? "Out" : "In"} <ArrowRight className="ml-1 h-3 w-3" /> {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.date ? (() => {
                                try {
                                  // Backend sends valid ISO: "2026-01-05T20:56:45.268278"
                                  const d = new Date(log.date);
                                  if (isNaN(d.getTime())) return <span className="text-muted-foreground italic">Invalid</span>;
                                  return d.toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                  });
                                } catch (e) {
                                  return <span className="text-muted-foreground italic">Error</span>;
                                }
                              })() : <span className="text-muted-foreground italic">No Date</span>}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`border-0 uppercase text-[10px] tracking-wider ${log.status === "overdue" ? "bg-destructive/10 text-destructive" :
                                  log.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                                    "bg-secondary text-muted-foreground"
                                  }`}
                              >
                                {log.status}
                              </Badge>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            No logs found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

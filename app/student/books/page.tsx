"use client"

import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { useRealtimeSubscription } from "@/lib/useRealtimeSubscription"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle2, AlertCircle, BookOpen } from "lucide-react"

export default function MyBooksPage() {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Wrap fetchData in useCallback for Realtime subscription
  const fetchData = useCallback(async () => {
    try {
      const [currentRes, historyRes] = await Promise.all([
        api.getCurrentBorrowedBooks(),
        api.getBorrowHistory()
      ])

      if (currentRes.books) {
        const mappedCurrent = currentRes.books.map((book: any) => {
          const dueDate = new Date(book.due_date)
          const today = new Date()
          const diffTime = dueDate.getTime() - today.getTime()
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          let status = "active"
          if (daysRemaining < 0) status = "overdue"
          else if (daysRemaining <= 3) status = "due-soon"

          return {
            id: book.borrow_id,
            title: book.title,
            author: book.author,
            borrowDate: new Date(book.borrow_date).toLocaleDateString(),
            dueDate: dueDate.toLocaleDateString(),
            daysRemaining,
            status
          }
        })
        setBorrowedBooks(mappedCurrent)
      }

      if (historyRes.history) {
        const mappedHistory = historyRes.history.map((record: any) => ({
          id: record.id,
          title: record.title || record.books?.title || "Unknown",
          borrowDate: new Date(record.borrow_date).toLocaleDateString(),
          returnDate: record.return_date ? new Date(record.return_date).toLocaleDateString() : "-",
          status: record.status === "returned" ? "on-time" : "late"
        }))
        setHistory(mappedHistory)
      }

    } catch (error) {
      console.error("Failed to fetch books data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Subscribe to real-time updates
  useRealtimeSubscription({
    table: "borrow_logs",
    event: "*",
    onEvent: useCallback(() => {
      console.log("[Realtime] Borrow log event detected, refreshing books...")
      fetchData()
    }, [fetchData])
  })

  const getStatusBadge = (status: string, daysRemaining?: number) => {
    if (status === "overdue") {
      return (
        <Badge variant="destructive" className="font-medium flex w-fit items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue: {Math.abs(daysRemaining || 0)} days
        </Badge>
      )
    }
    if (status === "due-soon") {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium flex w-fit items-center gap-1">
          <Clock className="h-3 w-3" />
          Due in {daysRemaining} days
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary font-medium flex w-fit items-center gap-1">
        <Clock className="h-3 w-3" />
        {daysRemaining} days left
      </Badge>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">My Books</h1>
            <p className="text-muted-foreground mt-1">Track your reading journey and library activity</p>
          </motion.div>

          <Tabs defaultValue="current" className="w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary/30 p-1 mb-6 border border-white/5 rounded-full">
                <TabsTrigger value="current" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Currently Borrowed</TabsTrigger>
                <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Borrow History</TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="current" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass border-white/10 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Active Loans</CardTitle>
                        <CardDescription>Books you have checked out right now</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader className="bg-secondary/30">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="font-semibold text-foreground">Book Title</TableHead>
                          <TableHead className="font-semibold text-foreground">Author</TableHead>
                          <TableHead className="font-semibold text-foreground">Borrow Date</TableHead>
                          <TableHead className="font-semibold text-foreground">Due Date</TableHead>
                          <TableHead className="font-semibold text-foreground">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {borrowedBooks.length > 0 ? (
                            borrowedBooks.map((book, i) => (
                              <motion.tr
                                key={book.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="font-medium text-lg">{book.title}</TableCell>
                                <TableCell className="text-muted-foreground">{book.author}</TableCell>
                                <TableCell>{book.borrowDate}</TableCell>
                                <TableCell className="font-medium">{book.dueDate}</TableCell>
                                <TableCell>{getStatusBadge(book.status, book.daysRemaining)}</TableCell>
                              </motion.tr>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center justify-center gap-3">
                                  <BookOpen className="h-12 w-12 opacity-20" />
                                  <p>You don't have any books borrowed at the moment.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass border-white/10 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle>Borrow History</CardTitle>
                        <CardDescription>Your reading archive</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader className="bg-secondary/30">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="font-semibold text-foreground">Book Title</TableHead>
                          <TableHead className="font-semibold text-foreground">Borrow Date</TableHead>
                          <TableHead className="font-semibold text-foreground">Return Date</TableHead>
                          <TableHead className="font-semibold text-foreground">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {history.length > 0 ? (
                            history.map((record, index) => (
                              <motion.tr
                                key={record.id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="font-medium">{record.title}</TableCell>
                                <TableCell>{record.borrowDate}</TableCell>
                                <TableCell>{record.returnDate}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`border-0 ${record.status === "on-time" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                                    {record.status === "on-time" ? (
                                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Returned on time</span>
                                    ) : "Returned late"}
                                  </Badge>
                                </TableCell>
                              </motion.tr>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                No history available yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

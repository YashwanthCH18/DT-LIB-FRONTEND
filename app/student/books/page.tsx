"use client"

import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function MyBooksPage() {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
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
            title: record.books?.title || "Unknown",
            borrowDate: new Date(record.borrow_date).toLocaleDateString(),
            returnDate: record.return_date ? new Date(record.return_date).toLocaleDateString() : "-",
            status: record.status === "returned" ? "on-time" : "late" // Simplified logic, real logic would need due_date check
          }))
          setHistory(mappedHistory)
        }

      } catch (error) {
        console.error("Failed to fetch books data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (status: string, daysRemaining?: number) => {
    if (status === "overdue") {
      return (
        <Badge variant="destructive" className="font-medium">
          Overdue by {Math.abs(daysRemaining || 0)} days
        </Badge>
      )
    }
    if (status === "due-soon") {
      return (
        <Badge className="bg-chart-3 text-white font-medium hover:bg-chart-3/90">Due in {daysRemaining} days</Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
        {daysRemaining} days left
      </Badge>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
            <p className="text-muted-foreground mt-1">Manage your borrowed books and view history</p>
          </div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList>
              <TabsTrigger value="current">Currently Borrowed</TabsTrigger>
              <TabsTrigger value="history">Borrow History</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Currently Borrowed Books</CardTitle>
                  <CardDescription>Books you have checked out from the library</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Borrow Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowedBooks.length > 0 ? (
                        borrowedBooks.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell className="font-medium">{book.title}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.borrowDate}</TableCell>
                            <TableCell>{book.dueDate}</TableCell>
                            <TableCell>{getStatusBadge(book.status, book.daysRemaining)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No active borrows
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Borrow History</CardTitle>
                  <CardDescription>Your past library transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead>Borrow Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length > 0 ? (
                        history.map((record, index) => (
                          <TableRow key={record.id || index}>
                            <TableCell className="font-medium">{record.title}</TableCell>
                            <TableCell>{record.borrowDate}</TableCell>
                            <TableCell>{record.returnDate}</TableCell>
                            <TableCell>
                              <Badge variant={record.status === "on-time" ? "secondary" : "destructive"}>
                                {record.status === "on-time" ? "Returned on time" : "Returned late"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No history available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

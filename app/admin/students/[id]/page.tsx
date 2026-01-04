"use client"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Mail, BookOpen, AlertTriangle, DollarSign } from "lucide-react"
import { api } from "@/lib/api"
import { useParams } from "next/navigation"

// Simple in-memory cache to prevent refetching on every navigation
const studentCache: Record<string, any> = {}

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.id as string
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!studentId) return

      // Check cache first
      if (studentCache[studentId]) {
        setStudentData(studentCache[studentId])
        setLoading(false)
        // Optional: re-validate in background? User said "only when I refresh".
        // So we strictly use cache if available.
        return
      }

      try {
        setLoading(true)
        const response = await api.getStudentDetails(studentId)
        setStudentData(response)
        studentCache[studentId] = response // Set cache
      } catch (error) {
        console.error("Failed to fetch student details:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [studentId])

  // Explicit refresh function for the User to click if they want new data
  const refreshData = async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const response = await api.getStudentDetails(studentId)
      setStudentData(response)
      studentCache[studentId] = response
    } catch (error) {
      console.error("Refresh failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!studentData) return <div>Student not found</div>

  const { student, active_borrows, history } = studentData
  const activeCount = active_borrows?.length || 0
  const overdueCount = active_borrows?.filter((b: any) => new Date(b.due_date) < new Date()).length || 0
  const totalFines = 0

  const borrowHistory = history || []

  const handleReturnBook = async (loan: any) => {
    if (!confirm("Mark this book as returned? Fines will be generated if overdue.")) return;

    // Optimistic Update
    const originalData = { ...studentData }

    // 1. Move from active to history
    const now = new Date().toISOString()
    const updatedActive = active_borrows.filter((b: any) => b.id !== loan.id)
    const updatedHistory = [
      { ...loan, status: 'returned', return_date: now },
      ...borrowHistory
    ]

    // Update State Immediately
    const optimisticData = {
      ...studentData,
      active_borrows: updatedActive,
      history: updatedHistory
    }
    setStudentData(optimisticData)
    studentCache[studentId] = optimisticData // Update cache

    try {
      const res = await api.returnBook(loan.id)
      alert(res.message + (res.fine_generated ? ` Fine: ₹${res.fine_amount}` : ""))
      // No reload needed, state is already correct
    } catch (e: any) {
      console.error(e)
      alert("Failed to return book: " + (e.message || "Unknown error"))
      // Revert on error
      setStudentData(originalData)
      studentCache[studentId] = originalData
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
              <p className="text-muted-foreground mt-1">Complete student library profile</p>
            </div>
            <button
              onClick={refreshData}
              className="text-sm border rounded px-3 py-1 hover:bg-muted"
            >
              Refresh Data
            </button>
          </div>

          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{student.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{student.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Student ID</p>
                    <p className="text-sm text-muted-foreground">{student.student_id || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{student.department || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overdueCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
                <DollarSign className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalFines}</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Loans */}
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription>Currently borrowed books</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active_borrows && active_borrows.length > 0 ? (
                    active_borrows.map((loan: any) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.books?.title || "Unknown"}</TableCell>
                        <TableCell>{new Date(loan.borrow_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(loan.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={loan.status === 'overdue' ? "destructive" : "default"}>
                            {loan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-sm text-primary hover:underline"
                            onClick={() => handleReturnBook(loan)}
                          >
                            Return Book
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No active loans
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Borrow History */}
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Past transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Due/Return Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowHistory.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.books?.title || "Unknown"}</TableCell>
                      <TableCell>{new Date(record.borrow_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.return_date ? new Date(record.return_date).toLocaleDateString() : new Date(record.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "overdue"
                              ? "destructive"
                              : record.status === "active" || record.status === "borrowed"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {record.status === "borrowed" ? "Active" :
                            record.status === "returned" ? "Returned" : record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

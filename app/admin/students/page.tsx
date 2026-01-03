"use client"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { api } from "@/lib/api"

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.getAllStudents()
        if (response.students) {
          setStudents(response.students)
        }
      } catch (error) {
        console.error("Failed to fetch students:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
            <p className="text-muted-foreground mt-1">Monitor student library activity</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
              <CardDescription>Student library activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Books Borrowed</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Total Fines</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name || "Student"}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.active_borrows || student.borrowed || 0}</TableCell>
                      <TableCell>
                        <span className={(student.overdue || 0) > 0 ? "text-destructive font-medium" : ""}>
                          {student.overdue || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={(student.fines && student.fines !== "$0" && student.fines !== 0) ? "text-destructive font-medium" : ""}>
                          {student.fines ? (String(student.fines).startsWith('$') ? student.fines : `₹${student.fines}`) : "₹0"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/students/${student.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
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

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, SortAsc, SortDesc, AlertCircle, Banknote, User, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminNav } from "@/components/admin-nav"

interface Student {
  id: string
  name: string
  email: string
  student_id: string
  active_borrows: number
  overdue_borrows: number
  total_fines: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function AdminStudentsPage() {
  const { token } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Student Details Sheet
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student)
    setDetailsLoading(true)
    try {
      const details = await api.getStudentDetails(student.id)
      setStudentDetails(details)
    } catch (error) {
      console.error("Failed to fetch student details:", error)
      toast.error("Failed to load student details")
    } finally {
      setDetailsLoading(false)
    }
  }

  // Filters
  const [hasOverdue, setHasOverdue] = useState(false)
  const [hasFines, setHasFines] = useState(false)
  const [sortBy, setSortBy] = useState("name_asc")

  const fetchStudents = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api.fetchAllStudents(
        token,
        searchQuery,
        hasOverdue ? true : undefined,
        hasFines ? true : undefined,
        sortBy
      )
      setStudents(data.students)
    } catch (error) {
      console.error("Failed to fetch students:", error)
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce search
    const timeout = setTimeout(() => {
      fetchStudents()
    }, 300)
    return () => clearTimeout(timeout)
  }, [token, searchQuery, hasOverdue, hasFines, sortBy])

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <AdminNav />
      <div className="flex-1 container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-muted-foreground">
            Monitor student library activity, performance, and compliance.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] glass">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="activity_desc">Most Active</SelectItem>
                <SelectItem value="overdue_desc">Most Overdue</SelectItem>
                <SelectItem value="fines_desc">Highest Fines</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="glass gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {(hasOverdue || hasFines) && (
                    <span className="flex h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Students</SheetTitle>
                  <SheetDescription>
                    Narrow down the student list based on specific criteria.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overdue"
                      checked={hasOverdue}
                      onCheckedChange={(checked) => setHasOverdue(checked as boolean)}
                    />
                    <Label htmlFor="overdue">Has Overdue Books</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fines"
                      checked={hasFines}
                      onCheckedChange={(checked) => setHasFines(checked as boolean)}
                    />
                    <Label htmlFor="fines">Has Unpaid Fines</Label>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => {
                    setHasOverdue(false)
                    setHasFines(false)
                  }} variant="ghost" size="sm">
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden glass-card"
          >
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-primary font-semibold">Profile</TableHead>
                  <TableHead className="text-primary font-semibold">Email</TableHead>
                  <TableHead className="text-center text-primary font-semibold">Active Loans</TableHead>
                  <TableHead className="text-center text-primary font-semibold">Overdue</TableHead>
                  <TableHead className="text-center text-primary font-semibold">Fines</TableHead>
                  <TableHead className="text-right text-primary font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No students found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <motion.tr
                      key={student.id}
                      variants={item}
                      className="border-white/10 hover:bg-white/5 transition-colors group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {student.name?.[0]?.toUpperCase() || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-foreground">{student.name || "Student"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                          {student.active_borrows}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.overdue_borrows > 0 ? (
                          <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                            {student.overdue_borrows}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {student.total_fines > 0 ? (
                          <span className="text-red-400 font-medium">₹{student.total_fines}</span>
                        ) : (
                          <span className="text-muted-foreground">₹0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleViewStudent(student)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/20 text-primary">
                                    {student.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                                  </AvatarFallback>
                                </Avatar>
                                {student.name}
                              </SheetTitle>
                              <SheetDescription>
                                {student.email} • {student.student_id}
                              </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                  <div className="text-2xl font-bold text-primary">{student.active_borrows}</div>
                                  <div className="text-xs text-muted-foreground">Active Borrows</div>
                                </div>
                                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                  <div className="text-2xl font-bold text-red-400">{student.overdue_borrows}</div>
                                  <div className="text-xs text-muted-foreground">Overdue</div>
                                </div>
                                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                  <div className="text-2xl font-bold text-amber-400">₹{student.total_fines}</div>
                                  <div className="text-xs text-muted-foreground">Total Fines</div>
                                </div>
                              </div>

                              {detailsLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                              ) : studentDetails ? (
                                <>
                                  {/* Active Borrows */}
                                  {studentDetails.active_borrows?.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2 text-primary">Currently Borrowed</h4>
                                      <div className="space-y-2">
                                        {studentDetails.active_borrows.map((borrow: any) => (
                                          <div key={borrow.id} className="flex justify-between items-center p-2 bg-secondary/20 rounded">
                                            <div>
                                              <div className="font-medium text-sm">{borrow.books?.title}</div>
                                              <div className="text-xs text-muted-foreground">{borrow.books?.author}</div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              Due: {new Date(borrow.due_date).toLocaleDateString('en-IN')}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Borrow History */}
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Borrow History</h4>
                                    {studentDetails.history?.length > 0 ? (
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {studentDetails.history.map((borrow: any) => (
                                          <div key={borrow.id} className="flex justify-between items-center p-2 border border-border/50 rounded text-sm">
                                            <div>
                                              <div className="font-medium">{borrow.books?.title}</div>
                                              <div className="text-xs text-muted-foreground">
                                                {new Date(borrow.borrow_date).toLocaleDateString('en-IN')} → {borrow.return_date ? new Date(borrow.return_date).toLocaleDateString('en-IN') : 'Not returned'}
                                              </div>
                                            </div>
                                            <Badge variant={borrow.status === 'returned' ? 'secondary' : 'destructive'} className="text-xs">
                                              {borrow.status}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">No borrow history found</p>
                                    )}
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Search, Filter, ArrowUpDown, FileDown, User, Calendar, BookOpen } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

export default function InventoryPage() {
  const { token } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "title", direction: "asc" })

  // Borrower Details State
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [borrowerDetails, setBorrowerDetails] = useState<any>(null)
  const [isBorrowerSheetOpen, setIsBorrowerSheetOpen] = useState(false)
  const [loadingBorrowers, setLoadingBorrowers] = useState(false)

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Assuming 'token' is available in scope or passed
      await api.addBook(newBook)
      setIsDialogOpen(false)
      fetchBooks()
      setNewBook({ title: "", author: "", isbn: "", category: "", subject: "", total_copies: 1 })
    } catch (error) {
      console.error("Failed to add book:", error)
      alert("Failed to add book")
    }
  }

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      // Assuming 'token' is available in scope or passed
      await api.deleteBook(id)
      fetchBooks()
    } catch (error) {
      console.error("Failed to delete book:", error)
    }
  }

  const handleUpdateQuantity = async (id: string, currentTotal: number, currentAvailable: number, delta: number) => {
    const newTotal = Math.max(0, currentTotal + delta)
    const newAvailable = Math.max(0, currentAvailable + delta)
    try {
      await api.updateBook(id, { total_copies: newTotal, available_copies: newAvailable })
      fetchBooks()
    } catch (error) {
      console.error("Failed to update quantity:", error)
      alert("Failed to update quantity")
    }
  }

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return

    setIsImporting(true)
    const formData = new FormData()
    formData.append('file', importFile)

    try {
      // Assuming 'token' is available in scope or passed
      const result = await api.bulkImportBooks(formData)
      alert(result.message)
      setIsImportDialogOpen(false)
      setImportFile(null)
      fetchBooks()
    } catch (error: any) {
      console.error("Failed to import books:", error)
      alert(`Import failed: ${error.message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }))
  }

  const handleViewBorrowers = async (book: any) => {
    setSelectedBook(book)
    setIsBorrowerSheetOpen(true)
    setLoadingBorrowers(true)
    try {
      const data = await api.getBookBorrowers(book.id)
      setBorrowerDetails(data)
    } catch (error) {
      console.error("Failed to fetch borrowers:", error)
      setBorrowerDetails(null)
    } finally {
      setLoadingBorrowers(false)
    }
  }

  // Form State
  const [newBook, setNewBook] = useState({
    title: "", author: "", isbn: "", category: "", subject: "", total_copies: 1
  })

  // Import State
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    // Debounce search and filter updates
    const timeout = setTimeout(() => {
      fetchBooks()
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery, statusFilter, sortConfig])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      let availability: "available" | "unavailable" | undefined = undefined
      if (statusFilter === "available") availability = "available"
      if (statusFilter === "out_of_stock") availability = "unavailable"

      const sortStr = `${sortConfig.key}_${sortConfig.direction}`

      const response = await api.fetchAllBooks(
        token, // Uses token from useAuth() at line 32
        searchQuery,
        availability,
        undefined, // category
        sortStr
      )

      if (response.books) {
        setBooks(response.books.map((b: any) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          isbn: b.isbn || "N/A",
          category: b.category || "General",
          subject: b.subject,
          total: b.total_copies,
          available: b.available_copies,
          borrowed: b.total_copies - b.available_copies
        })))
      }
    } catch (error: any) {
      console.error("Failed to fetch books:", error)
      if (error.message === "Not authenticated" || error.message.includes("401")) {
        // window.location.href = "/auth/login?error=session_expired";
      }
    } finally {
      setLoading(false)
    }
  }

  // No longer need useMemo for processing books
  const processedBooks = books

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Book Inventory</h1>
              <p className="text-muted-foreground mt-1">Manage library collection and track availability</p>
            </motion.div>
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Import Button */}
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="glass hover:bg-primary/5">
                    <FileDown className="mr-2 h-4 w-4" /> Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass">
                  <DialogHeader>
                    <DialogTitle>Bulk Import Books</DialogTitle>
                    <DialogDescription>
                      Upload an Excel file (.xlsx) with columns: title, author, isbn, category, subject, description, total_copies, rfid_uids
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBulkImport} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Excel File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        required
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1" disabled={isImporting}>
                        {isImporting ? "Importing..." : "Upload & Import"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Book Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Add Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto glass">
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                    <DialogDescription>Enter book details to add to inventory</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddBook} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Book Title</Label>
                      <Input
                        id="title"
                        required
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        required
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        required
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          required
                          value={newBook.category}
                          onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          required
                          value={newBook.subject}
                          onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })}
                          className="bg-secondary/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Total Copies</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        required
                        value={newBook.total_copies}
                        onChange={(e) => setNewBook({ ...newBook, total_copies: parseInt(e.target.value) })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">Add Book</Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, author, or ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-secondary/50 border-white/10 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] bg-secondary/50 border-white/10">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4 opacity-50" />
                          <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Books</SelectItem>
                        <SelectItem value="available">Available Now</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-white/10 overflow-hidden shadow-xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow className="hover:bg-transparent border-white/10">
                      <TableHead className="cursor-pointer hover:text-primary transition-colors text-foreground font-semibold" onClick={() => handleSort("title")}>
                        <div className="flex items-center gap-1">Title <ArrowUpDown className="h-3 w-3" /></div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:text-primary transition-colors text-foreground font-semibold" onClick={() => handleSort("author")}>
                        <div className="flex items-center gap-1">Author <ArrowUpDown className="h-3 w-3" /></div>
                      </TableHead>
                      <TableHead className="text-foreground font-semibold">Category</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Total</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Status</TableHead>
                      <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-48 text-center">
                            <div className="flex justify-center items-center flex-col gap-2">
                              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                              <span className="text-muted-foreground animate-pulse">Loading inventory...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : processedBooks.length > 0 ? (
                        processedBooks.map((book, i) => (
                          <motion.tr
                            key={book.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.03 }}
                            className="group hover:bg-muted/50 transition-colors border-b border-white/5 cursor-pointer"
                            onClick={() => handleViewBorrowers(book)}
                          >
                            <TableCell className="font-medium text-foreground/90">{book.title}</TableCell>
                            <TableCell className="text-muted-foreground">{book.author}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-secondary/30 font-normal">{book.category}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(book.id, book.total, book.available, -1)}
                                  disabled={book.total <= 0}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <span className="text-lg font-bold">−</span>
                                </Button>
                                <span className="w-8 text-center font-medium">{book.total}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(book.id, book.total, book.available, 1)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <span className="text-lg font-bold">+</span>
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`border-0 ${book.available > 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}
                              >
                                {book.available > 0 ? `${book.available} Available` : "Out of Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBook(book.id)}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Search className="h-8 w-8 opacity-20" />
                              <p>No books found matching your criteria.</p>
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
        </div>
      </main>

      {/* Borrower Details Sheet */}
      <Sheet open={isBorrowerSheetOpen} onOpenChange={setIsBorrowerSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedBook?.title}
            </SheetTitle>
            <SheetDescription>
              {selectedBook?.author} • {borrowerDetails?.borrowed_count || 0} currently borrowed
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Book Info */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Copies</span>
                  <p className="font-medium">{borrowerDetails?.book?.total_copies || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Available</span>
                  <p className="font-medium">{borrowerDetails?.book?.available_copies || 0}</p>
                </div>
              </div>
            </div>

            {/* Current Borrowers */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Current Borrowers
              </h4>

              {loadingBorrowers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : borrowerDetails?.current_borrowers?.length > 0 ? (
                <div className="space-y-3">
                  {borrowerDetails.current_borrowers.map((borrower: any) => (
                    <div key={borrower.borrow_id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{borrower.user_name}</p>
                          <p className="text-sm text-muted-foreground">{borrower.student_id}</p>
                          <p className="text-xs text-muted-foreground">{borrower.user_email}</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-600">
                          Borrowed
                        </Badge>
                      </div>
                      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground flex gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Borrowed: {new Date(borrower.borrow_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          Due: {new Date(borrower.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No active borrowers</p>
                  <p className="text-xs">This book is currently available</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

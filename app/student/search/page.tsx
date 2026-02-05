"use client"

import { useState, useEffect } from "react"
import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, Filter, ArrowRight } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

export default function SearchBooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    availability: "all",
    category: "all-categories"
  })

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filters])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (searchQuery) params.query = searchQuery
      if (filters.availability !== "all") params.availability = filters.availability
      if (filters.category !== "all-categories") params.category = filters.category

      const response = await api.searchBooks(params)
      setBooks(response.books || [])
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
              Discover Books
            </h1>
            <p className="text-lg text-muted-foreground">Find resources for your studies from our digital catalog</p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-white/10 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, author, or ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-lg bg-secondary/50 border-white/5 focus-visible:ring-primary transition-all"
                    />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Select defaultValue="all" onValueChange={(val) => setFilters({ ...filters, availability: val })}>
                      <SelectTrigger className="w-1/2 md:w-[180px] h-12 bg-secondary/50 border-white/5 hover:bg-secondary/80">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Availability" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available Now</SelectItem>
                        <SelectItem value="unavailable">Checked Out</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-categories" onValueChange={(val) => setFilters({ ...filters, category: val })}>
                      <SelectTrigger className="w-1/2 md:w-[180px] h-12 bg-secondary/50 border-white/5 hover:bg-secondary/80">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="fiction">Fiction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Book Listing */}
          <div className="space-y-4">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {books.length > 0 ? (
                    books.map((book, i) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        layout
                      >
                        <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-white/5 bg-gradient-to-br from-card to-secondary/30 group">
                          <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative group-hover:from-primary/30 transition-colors">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="absolute top-3 right-3">
                              {book.available > 0 ? (
                                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm border-0">
                                  Available ({book.available})
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-red-500/20 text-red-600 dark:text-red-400 backdrop-blur-sm border-0">
                                  Waitlist
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg leading-tight line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                              {book.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col justify-end pt-0">
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4 mt-2">
                              <div className="bg-secondary/50 rounded px-2 py-1 truncate">{book.subject || "General"}</div>
                              <div className="bg-secondary/50 rounded px-2 py-1 truncate">{book.category || "N/A"}</div>
                            </div>
                            <Link href={`/student/search/${book.id}`} className="mt-auto">
                              <Button className="w-full bg-primary text-white hover:bg-primary/90 transition-all group-hover:shadow-lg">
                                View Details <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground"
                    >
                      <div className="bg-muted/30 p-6 rounded-full mb-4">
                        <Search className="h-10 w-10 opacity-40" />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">No books found</h3>
                      <p>Try adjusting your search terms or filters</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

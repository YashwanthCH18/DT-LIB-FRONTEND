"use client"

import { useState } from "react"
import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useEffect } from "react"

export default function SearchBooksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    availability: "all",
    category: "all-categories"
  })

  useEffect(() => {
    // Debounce search
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
    <div className="min-h-screen flex flex-col">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Search Books</h1>
            <p className="text-muted-foreground mt-1">Discover books and check availability</p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search Library</CardTitle>
              <CardDescription>Find books by title, author, or subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all" onValueChange={(val) => setFilters({ ...filters, availability: val })}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Books</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Not Available</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all-categories" onValueChange={(val) => setFilters({ ...filters, category: val })}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All Categories</SelectItem>
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="se">Software Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Book Listing */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Searching books...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {books.length > 0 ? (
                books.map((book) => (
                  <Card key={book.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        {book.available > 0 ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            Not Available
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">{book.title}</CardTitle>
                      <CardDescription>{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Subject:</span> {book.subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Availability:</span> {book.available}/{book.total} copies
                        </p>
                      </div>
                      <Link href={`/student/search/${book.id}`}>
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No books found matching your criteria
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

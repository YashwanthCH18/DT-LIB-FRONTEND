"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { StudentNav } from "@/components/student-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
// Removed toast import

export default function BookDetailsPage() {
  const params = useParams()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (params.id) {
          const data = await api.getBookDetails(params.id as string)
          setBook(data.book)
        }
      } catch (error) {
        console.error("Failed to fetch book details:", error)
        // Fallback error handling
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [params.id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <StudentNav />
        <div className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <Link href="/student/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/student/search" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Book Image & Status */}
          <div className="space-y-6">
            <div className="aspect-[3/4] relative bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="object-cover w-full h-full" />
              ) : (
                <BookOpen className="h-24 w-24 text-muted-foreground/30" />
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
                {book.available_copies > 0 ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-lg px-3 py-1">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground text-lg px-3 py-1">
                    Not Available
                  </Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground mt-2">{book.author}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Availability</p>
                      <p className="text-2xl font-bold">{book.available_copies}/{book.total_copies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Shelf Location</p>
                      <p className="text-2xl font-bold">{book.department || "General"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About this book</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description || "No description available for this book."}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <span className="font-semibold">ISBN:</span> {book.isbn || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Subject:</span> {book.subject || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Category:</span> {book.category || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Semester:</span> {book.semester || "N/A"}
                </div>
              </div>
            </div>

            {/* Borrow Action Removed as requested */}
          </div>
        </div>
      </main>
    </div>
  )
}

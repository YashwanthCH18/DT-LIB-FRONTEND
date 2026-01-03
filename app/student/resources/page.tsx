"use client"

import { useState, useEffect } from "react"
import { StudentNav } from "@/components/student-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Megaphone } from "lucide-react"
import { api } from "@/lib/api"

export default function ResourcesPage() {
  const [subject, setSubject] = useState("all")
  const [semester, setSemester] = useState("all")
  const [resources, setResources] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [subject, semester])

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (subject && subject !== "all") params.subject = subject
      if (semester && semester !== "all") params.semester = semester

      const response = await api.getResources(params)
      setResources(response || []) // API returns array directly or inside object, verifying from code response data handling
    } catch (error) {
      console.error("Failed to fetch resources:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      // Re-using student notifications for announcements section
      // Ideally we filter for 'announcement' type
      const response = await api.getStudentNotifications()
      if (response.notifications) {
        const ann = response.notifications.filter((n: any) => n.type === 'announcement' || n.type === 'general') // adjust types as needed
        setAnnouncements(ann)
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    }
  }

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const response = await api.downloadResource(id)
      if (response.download_url) {
        // Create a temporary link to download
        const link = document.createElement('a')
        link.href = response.download_url
        link.download = response.filename || fileName || 'download.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download resource")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Resources</h1>
            <p className="text-muted-foreground mt-1">Access CIE papers and academic materials</p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Resources</CardTitle>
              <CardDescription>Find materials by subject and semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <p className="col-span-full text-center text-muted-foreground">Loading resources...</p>
            ) : resources.length > 0 ? (
              resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>
                          {resource.subject} • Semester {resource.semester} • {resource.year}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => handleDownload(resource.id, resource.filename)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">No resources found matching your filters.</p>
            )}
          </div>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-accent" />
                <CardTitle>Announcements & Notices</CardTitle>
              </div>
              <CardDescription>Important updates from the library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            From: Library Admin • {new Date(announcement.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No recent announcements</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

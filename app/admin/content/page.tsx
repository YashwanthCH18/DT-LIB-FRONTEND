

"use client"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

export default function ContentManagementPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSemester, setFilterSemester] = useState("all")
  const [filterSubject, setFilterSubject] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Department options
  const departments = ["MCA", "MBA", "BE CS", "BE Mechanical", "BE Civil", "BE ECE", "BE EEE", "Other"]

  // Upload Form State
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    semester: "",
    department: "",
    file: null as File | null
  })

  useEffect(() => {
    fetchResources()
  }, []) // Initial load

  // Debounced effect for search (optional, or just use button)
  // For now relying on button click or direct call, 
  // but let's make it responsive to enter key on inputs by adding onKeyDown to inputs in UI step if wanted.
  // The user asked for "filtered ... and updated in real time", so let's add an effect:
  useEffect(() => {
    // Optional: debounce this if needed
    const timer = setTimeout(() => {
      fetchResources()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filterSemester, filterSubject, filterDepartment, sortBy])

  const fetchResources = async () => {
    setLoading(true)
    try {
      // Build query params
      const params: Record<string, string> = {}
      if (searchQuery) params.title = searchQuery
      if (filterSemester && filterSemester !== "all") params.semester = filterSemester
      if (filterSubject) params.subject = filterSubject
      if (filterDepartment && filterDepartment !== "all") params.department = filterDepartment
      if (sortBy) params.sort_by = sortBy

      const response = await api.getResources(params)
      // API returns array directly
      if (Array.isArray(response)) {
        setUploadedFiles(response)
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

  const handleUpload = async () => {
    if (!formData.name || !formData.subject || !formData.semester || !formData.department || !formData.file) {
      alert("Please fill in all fields and select a file")
      return
    }

    setUploading(true)
    try {
      const data = new FormData()
      data.append("title", formData.name)
      data.append("subject", formData.subject)
      data.append("semester", formData.semester)
      data.append("department", formData.department)
      data.append("type", "cie_paper") // Valid: cie_paper, syllabus, notes, other
      data.append("file", formData.file)

      await api.uploadResource(data)
      alert("Resource uploaded successfully!")

      // Reset form
      setFormData({
        name: "",
        subject: "",
        semester: "",
        department: "",
        file: null
      })
      // Clear file input manually if needed (using ref or simple reload)
      const fileInput = document.getElementById("file") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      fetchResources()

    } catch (error: any) {
      console.error("Upload failed:", error)
      alert(error.message || "Failed to upload resource")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.deleteResource(id)
      fetchResources()
    } catch (error) {
      console.error("Delete failed", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Content Management</h1>
            <p className="text-muted-foreground mt-1">Upload and manage CIE papers and resources</p>
          </div>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload New Resource</CardTitle>
              <CardDescription>Add CIE papers and academic materials</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resource-name">Resource Name</Label>
                    <Input
                      id="resource-name"
                      placeholder="e.g., Data Structures - CIE Paper 1"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Computer Science"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select onValueChange={(val) => setFormData({ ...formData, semester: val })} value={formData.semester}>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select onValueChange={(val) => setFormData({ ...formData, department: val })} value={formData.department}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File (PDF)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </div>
                <Button type="submit" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Resource"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Resources</CardTitle>
              <CardDescription>Manage existing academic materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by resource name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <div className="w-[140px] shrink-0">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title (A-Z)</SelectItem>
                        <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-[140px] shrink-0">
                    <Select value={filterSemester} onValueChange={setFilterSemester}>
                      <SelectTrigger>
                        <SelectValue placeholder="Semester" />
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
                  <div className="w-[180px] shrink-0">
                    <Input
                      placeholder="Filter Subject..."
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                    />
                  </div>
                  <div className="w-[150px] shrink-0">
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Depts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={fetchResources} variant="secondary">
                    Search
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">Loading resources...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedFiles.length > 0 ? (
                      uploadedFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <a href={file.file_url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                              {file.title}
                            </a>
                          </TableCell>
                          <TableCell>{file.subject}</TableCell>
                          <TableCell>{file.semester}</TableCell>
                          <TableCell>{file.department}</TableCell>
                          <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No resources found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main >
    </div >
  )
}

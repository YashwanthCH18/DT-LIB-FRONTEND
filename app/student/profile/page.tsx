"use client"

import { useState, useEffect } from "react"
import { StudentNav } from "@/components/student-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { api } from "@/lib/api"

export default function StudentProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [pendingRequest, setPendingRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        student_id: "",
        phone: ""
    })
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [profileRes, requestRes] = await Promise.all([
                api.getStudentProfile(),
                api.getProfileRequest()
            ])

            const user = profileRes.profile
            setProfile(user)
            setFormData({
                name: user.name || "",
                email: user.email || "",
                student_id: user.student_id || "",
                phone: user.phone || ""
            })

            if (requestRes.request && requestRes.request.status === 'pending') {
                setPendingRequest(requestRes.request)
            } else {
                setPendingRequest(null)
            }

        } catch (error) {
            console.error("Failed to fetch profile data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage(null)

        try {
            await api.requestProfileUpdate(formData)
            setMessage({ type: 'success', text: 'Profile update request submitted successfully.' })
            fetchData() // Refresh to show pending status
        } catch (error) {
            console.error("Update failed:", error)
            setMessage({ type: 'error', text: 'Failed to submit update request.' })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen flex flex-col">
            <StudentNav />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your personal details here. Changes will require admin approval.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="student_id">Student ID</Label>
                                        <Input
                                            id="student_id"
                                            value={formData.student_id}
                                            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        />
                                    </div>

                                    {message && (
                                        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            {message.text}
                                        </div>
                                    )}

                                    <Button type="submit" disabled={submitting || !!pendingRequest}>
                                        {pendingRequest ? "Request Pending" : "Save Changes"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Role</span>
                                    <span className="text-sm text-muted-foreground capitalize">{profile?.role}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Joined</span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(profile?.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {pendingRequest && (
                                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-2 text-yellow-600 mb-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="font-semibold text-sm">Update Pending</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            You have requested changes to your profile. An admin will review them shortly.
                                        </p>
                                        <div className="mt-2 text-xs">
                                            Requested on: {new Date(pendingRequest.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

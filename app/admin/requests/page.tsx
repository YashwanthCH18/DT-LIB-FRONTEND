"use client"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { api } from "@/lib/api"

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const response = await api.getProfileRequests()
            setRequests(response.requests)
        } catch (error) {
            console.error("Failed to fetch requests:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            await api.processProfileRequest(requestId, action)
            // Remove from list
            setRequests(requests.filter(req => req.id !== requestId))
        } catch (error) {
            console.error(`Failed to ${action} request:`, error)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <AdminNav />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Profile Update Requests</h1>
                    <Button onClick={fetchRequests} variant="outline" size="sm">
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Requests</CardTitle>
                        <CardDescription>Review and approve student profile changes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading requests...</div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No pending requests</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Requested Changes</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="font-medium">{request.user_profiles?.name}</div>
                                                <div className="text-xs text-muted-foreground">{request.user_profiles?.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-md space-y-1 text-sm">
                                                    {Object.entries(request.requested_changes).map(([key, value]) => (
                                                        <div key={key} className="grid grid-cols-2 gap-2">
                                                            <span className="font-semibold capitalize">{key.replace('_', ' ')}:</span>
                                                            <span className="text-muted-foreground">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                                        onClick={() => handleAction(request.id, 'approve')}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                                        onClick={() => handleAction(request.id, 'reject')}
                                                    >
                                                        <X className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

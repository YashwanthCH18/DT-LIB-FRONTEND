"use client"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Send, Settings, Trash2, Megaphone, Clock } from "lucide-react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

export default function NotificationControlPage() {
  const [reminderTiming, setReminderTiming] = useState("2")
  const [overdueFrequency, setOverdueFrequency] = useState("daily")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [recipients, setRecipients] = useState("all")
  const [loading, setLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getRecentAnnouncements()
      if (res.notifications) {
        setAnnouncements(res.notifications)
      }
    } catch (err: any) {
      console.error("Failed to fetch announcements", err)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleBroadcast = async () => {
    if (!title || !message) {
      alert("Please enter title and message")
      return
    }
    setLoading(true)
    try {
      await api.broadcastNotification({
        title,
        message,
        type: "announcement"
      })
      alert("Announcement sent successfully!")
      setTitle("")
      setMessage("")
      fetchAnnouncements()
    } catch (error) {
      console.error("Broadcast failed", error)
      alert("Failed to send announcement")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setConfigLoading(true)
    try {
      await api.updateFineConfig({
        reminder_days: parseInt(reminderTiming),
        overdue_frequency: overdueFrequency
      })
      alert("Settings saved successfully")
    } catch (error) {
      console.error("Failed to save settings", error)
      alert("Failed to save settings")
    } finally {
      setConfigLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Notification Control</h1>
              <p className="text-muted-foreground mt-1">Configure automated reminders and broadcast announcements</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reminder Settings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass border-white/10 shadow-lg h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Automation Rules</CardTitle>
                      <CardDescription>Configure system triggers</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="reminder-days">Due Date Warning</Label>
                    <Select value={reminderTiming} onValueChange={setReminderTiming}>
                      <SelectTrigger id="reminder-days" className="bg-secondary/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day before due</SelectItem>
                        <SelectItem value="2">2 days before due</SelectItem>
                        <SelectItem value="3">3 days before due</SelectItem>
                        <SelectItem value="5">5 days before due</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="overdue-frequency">Overdue Frequency</Label>
                    <Select value={overdueFrequency} onValueChange={setOverdueFrequency}>
                      <SelectTrigger id="overdue-frequency" className="bg-secondary/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Reminder</SelectItem>
                        <SelectItem value="every-2-days">Every 2 Days</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveConfig} disabled={configLoading} className="w-full mt-4">
                    {configLoading ? "Saving..." : "Save Configuration"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Broadcast Announcement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass border-white/10 shadow-lg h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Megaphone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Broadcast</CardTitle>
                      <CardDescription>Send alerts to all students</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="announcement-title">Subject</Label>
                      <Input
                        id="announcement-title"
                        placeholder="e.g., Library Holiday Closure"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-secondary/50 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="announcement-message">Message</Label>
                      <Textarea
                        id="announcement-message"
                        placeholder="Enter announcement details..."
                        rows={4}
                        className="resize-none bg-secondary/50 border-white/10"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={recipients} onValueChange={setRecipients}>
                        <SelectTrigger id="recipient" className="w-[140px] bg-secondary/50 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Everyone</SelectItem>
                          <SelectItem value="overdue">Overdue Only</SelectItem>
                          <SelectItem value="active">Active Loans</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        onClick={handleBroadcast}
                        disabled={loading || !title.trim() || !message.trim()}
                        className={`flex-1 text-white transition-all duration-200 ${title.trim() && message.trim()
                            ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          }`}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {loading ? "Sending..." : "Send Now"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-white/10 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Recent History</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {historyLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : announcements.length > 0 ? (
                      announcements.map((ann: any, index) => (
                        <motion.div
                          key={ann.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-white/5 pb-4 last:border-0 last:pb-0 group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{ann.title || "No Title"}</h3>
                              <span className="text-xs text-muted-foreground">{new Date(ann.created_at).toLocaleDateString()}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                              onClick={async () => {
                                if (!confirm("Are you sure you want to delete this broadcast?")) return;
                                try {
                                  setHistoryLoading(true)
                                  await api.deleteBroadcast({
                                    title: ann.title,
                                    message: ann.message,
                                    type: ann.type
                                  })
                                  fetchAnnouncements()
                                } catch (e) {
                                  console.error(e)
                                  alert("Failed to delete")
                                  setHistoryLoading(false)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md border border-white/5">
                            {ann.message?.replace(/^.*?:/, '').trim() || ann.message}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-6">No announcements sent yet.</p>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Bell, BarChart3, Zap, Scan, Clock, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Smart Library</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#home" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About System
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </nav>
          <Link href="/login" className="md:hidden">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Smart Library Management System
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
              Experience seamless library management with RFID-based borrowing, automated reminders, and real-time book
              availability tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/login?role=student">
                <Button size="lg" className="w-full sm:w-auto">
                  Student Login
                </Button>
              </Link>
              <Link href="/login?role=admin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* System Overview Section */}
        <section id="about" className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">System Overview</h2>
              <p className="text-muted-foreground text-lg">
                Revolutionizing library operations with cutting-edge technology
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Automated Borrow & Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    RFID technology enables instant book scanning and automatic transaction logging
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Bell className="h-8 w-8 text-accent mb-2" />
                  <CardTitle>Due Date Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Smart notifications keep students informed about due dates and overdue books
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-chart-3 mb-2" />
                  <CardTitle>Real-Time Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Check book availability instantly and get notified when books become available
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-chart-4 mb-2" />
                  <CardTitle>Analytics for Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comprehensive insights into borrowing patterns, overdue trends, and more
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg">Simple, efficient, and fully automated</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Scan className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">1. Scan Book</h3>
                <p className="text-sm text-muted-foreground">
                  Use RFID scanner to instantly identify and process books
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">2. System Logs Borrow</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic transaction recording with due date calculation
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Bell className="h-8 w-8 text-chart-3" />
                </div>
                <h3 className="font-semibold text-lg">3. Student Gets Reminder</h3>
                <p className="text-sm text-muted-foreground">Timely notifications before and after due dates</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-chart-4" />
                </div>
                <h3 className="font-semibold text-lg">4. Admin Monitors Analytics</h3>
                <p className="text-sm text-muted-foreground">Real-time insights and comprehensive reporting</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Smart Library Management System - Final Year Project</p>
            <p className="text-xs text-muted-foreground">Built with Next.js and shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Bell, BarChart3, Zap, Scan, Clock, TrendingUp, Shield, GraduationCap, ArrowRight, Library } from "lucide-react"
import { motion } from "framer-motion"
import { GooeyText } from "@/components/ui/gooey-text-morphing"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navbar relative z-10 for interactivity */}
      <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpeg" alt="SMART LIB" className="h-12 w-auto rounded" />
            <span className="font-bold text-2xl tracking-tight">SMART LIB</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "Analytics"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium hover:text-primary transition-all hover:scale-105"
              >
                {item}
              </Link>
            ))}
            <Link href="/login">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-6">
          <motion.div
            className="container mx-auto max-w-5xl text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="h-40 md:h-56 w-full flex items-center justify-center mb-8">
              <GooeyText
                texts={["S.M.A.R.T–LIB", "Smart Management", "and Automation", "For RFID-enabled", "Libraries"]}
                morphTime={1.5}
                cooldownTime={1.5}
                textClassName="bg-gradient-to-r from-primary via-emerald-400 to-accent bg-clip-text text-transparent pb-2"
              />
            </div>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Seamlessly manage your library with RFID automation, real-time tracking,
              and instant notifications. Designed for modern institutions.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              {/* Transformed Login Options - The "Middle" replacement */}
              <Link href="/login?role=student" className="group">
                <div className="relative overflow-hidden rounded-2xl glass-card p-6 w-full sm:w-64 text-left hover:scale-[1.02] transition-transform cursor-pointer border-transparent hover:border-primary/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <GraduationCap className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-bold text-lg">Student Portal</h3>
                  <p className="text-sm text-muted-foreground mt-1">Check books, due dates & history</p>
                  <div className="mt-4 flex items-center text-primary text-sm font-semibold">
                    Login <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link href="/login?role=admin" className="group">
                <div className="relative overflow-hidden rounded-2xl glass-card p-6 w-full sm:w-64 text-left hover:scale-[1.02] transition-transform cursor-pointer border-transparent hover:border-destructive/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Shield className="h-8 w-8 text-destructive mb-3" />
                  <h3 className="font-bold text-lg">Admin Console</h3>
                  <p className="text-sm text-muted-foreground mt-1">Manage inventory, users & logs</p>
                  <div className="mt-4 flex items-center text-destructive text-sm font-semibold">
                    Access <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-secondary/30 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Powerful Features</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to run a modern, efficient library system.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: "RFID Automation",
                  desc: "Instant borrow & return with cutting-edge RFID tag scanning.",
                  color: "text-primary"
                },
                {
                  icon: Bell,
                  title: "Smart Notifications",
                  desc: "Automated email alerts for due dates and overdue fines.",
                  color: "text-accent" // Using accent which acts as secondary vibrant color
                },
                {
                  icon: Clock,
                  title: "Real-Time Sync",
                  desc: "Live inventory updates across all dashboards instantly.",
                  color: "text-chart-4"
                },
                {
                  icon: BarChart3,
                  title: "Deep Analytics",
                  desc: "Visual insights into borrowing trends and inventory health.",
                  color: "text-chart-5"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card p-8 rounded-3xl hover:shadow-2xl hover:shadow-primary/5 transition-all"
                >
                  <div className={`h-14 w-14 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center mb-6 ${feature.color}`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-80">
            <img src="/logo.jpeg" alt="SMART LIB" className="h-8 w-auto rounded" />
            <span className="font-semibold text-lg">SMART LIB</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Final Year Project. Built with Next.js 15 & Shadcn UI.
          </p>
        </div>
      </footer>
    </div>
  )
}

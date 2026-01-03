"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface User {
    user_id: string
    email: string
    name: string
    role: 'student' | 'admin'
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string, expectedRole?: string) => Promise<void>
    signup: (data: {
        email: string
        password: string
        role: string
        name: string
        student_id?: string
    }) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    isStudent: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is already logged in
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token')

        if (!token) {
            setLoading(false)
            return
        }

        try {
            const response = await api.validate()
            setUser({
                user_id: response.user_id,
                email: response.email,
                name: localStorage.getItem('user_name') || response.email,
                role: response.role,
            })
        } catch (error) {
            console.error('Auth validation failed:', error)
            localStorage.removeItem('access_token')
            localStorage.removeItem('user_role')
            localStorage.removeItem('user_name')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string, expectedRole?: string) => {
        try {
            const response = await api.login(email, password)

            // Verify role matches expectation (if provided)
            if (expectedRole && response.role !== expectedRole) {
                // If roles don't match, we shouldn't store the token
                throw new Error(`Access denied: You are not authorized to login as a ${expectedRole}`)
            }

            // Store token and user info
            localStorage.setItem('access_token', response.access_token)
            localStorage.setItem('user_role', response.role)
            localStorage.setItem('user_name', response.name)

            setUser({
                user_id: response.user_id,
                email: response.email,
                name: response.name,
                role: response.role,
            })

            // Redirect based on role
            if (response.role === 'admin') {
                router.push('/admin/dashboard')
            } else {
                router.push('/student/dashboard')
            }
        } catch (error: any) {
            throw new Error(error.message || 'Login failed')
        }
    }

    const signup = async (data: {
        email: string
        password: string
        role: string
        name: string
        student_id?: string
    }) => {
        try {
            await api.signup(data)
            // No auto-login, let the user log in manually
        } catch (error: any) {
            throw new Error(error.message || 'Signup failed')
        }
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_name')
        setUser(null)
        router.push('/login')
    }

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isAdmin: user?.role === 'admin',
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

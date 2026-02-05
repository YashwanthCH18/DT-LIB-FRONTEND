"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface UseRealtimeSubscriptionOptions {
  table: string
  schema?: string
  event?: RealtimeEvent
  onEvent: (payload: any) => void
}

/**
 * Custom hook to subscribe to Supabase Realtime table changes.
 * Automatically cleans up the subscription on unmount.
 * 
 * @example
 * useRealtimeSubscription({
 *   table: "borrows",
 *   event: "*",
 *   onEvent: (payload) => {
 *     console.log("Borrow event:", payload)
 *     refetchData()
 *   }
 * })
 */
export function useRealtimeSubscription({
  table,
  schema = "public",
  event = "*",
  onEvent,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Create a unique channel name
    const channelName = `realtime-${schema}-${table}-${Date.now()}`

    // Subscribe to the table changes
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema,
          table,
        },
        (payload: any) => {
          console.log(`[Realtime] ${table} event:`, payload.eventType, payload)
          onEvent(payload)
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${table} subscription status:`, status)
      })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Unsubscribing from ${table}`)
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, schema, event, onEvent])
}

/**
 * Subscribe to multiple tables at once
 */
export function useMultiTableRealtime(
  tables: string[],
  onEvent: (table: string, payload: any) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channelName = `realtime-multi-${Date.now()}`

    let channel = supabase.channel(channelName)

    // Add subscription for each table
    tables.forEach((table) => {
      channel = channel.on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload: any) => {
          console.log(`[Realtime] ${table} event:`, payload.eventType)
          onEvent(table, payload)
        }
      )
    })

    channel.subscribe((status) => {
      console.log(`[Realtime] Multi-table subscription status:`, status)
    })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Unsubscribing from multi-table`)
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [tables, onEvent])
}

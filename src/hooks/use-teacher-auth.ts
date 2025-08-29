"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { loadJSON, saveJSON } from "@/utils/storage"

const KEY = "teacher" // namespaced via storage util: htt.teacher
const INACTIVITY_MINUTES = 15

export function useTeacherAuth() {
  const [isTeacher, setIsTeacher] = useState(false)
  const logoutTimer = useRef<number | null>(null)

  const clearTimer = () => {
    if (logoutTimer.current) {
      window.clearTimeout(logoutTimer.current)
      logoutTimer.current = null
    }
  }

  const scheduleLogoutAt = useCallback((expiresAt: number) => {
    clearTimer()
    const ms = Math.max(0, expiresAt - Date.now())
    if (ms === 0) {
      // expire immediately
      (async () => {
        await supabase.auth.signOut()
      })()
      return
    }
    logoutTimer.current = window.setTimeout(async () => {
      await supabase.auth.signOut()
    }, ms)
  }, [])

  const setExpiry = useCallback((minutes: number = INACTIVITY_MINUTES) => {
    const expiresAt = Date.now() + minutes * 60_000
    saveJSON(`${KEY}.expiresAt`, expiresAt)
    scheduleLogoutAt(expiresAt)
  }, [scheduleLogoutAt])

  const clearExpiry = useCallback(() => {
    saveJSON(`${KEY}.expiresAt`, 0)
    clearTimer()
  }, [])

  // Initialize from auth state and enforce TTL
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      const expiresAt = loadJSON<number>(`${KEY}.expiresAt`, 0)

      // If expired but a session exists, sign out to enforce TTL
      if (expiresAt && expiresAt < Date.now() && user) {
        await supabase.auth.signOut()
        if (!isMounted) return
        setIsTeacher(false)
        clearExpiry()
        return
      }

      // If user is logged in and not expired, set teacher and schedule logout
      if (user && (!expiresAt || expiresAt > Date.now())) {
        if (!expiresAt) setExpiry(INACTIVITY_MINUTES) // seed TTL if missing
        if (!isMounted) return
        setIsTeacher(true)
        scheduleLogoutAt(loadJSON<number>(`${KEY}.expiresAt`, Date.now()))
      } else {
        if (!isMounted) return
        setIsTeacher(false)
      }
    }

    init()

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        setIsTeacher(true)
        setExpiry(INACTIVITY_MINUTES)
      } else if (event === "SIGNED_OUT") {
        setIsTeacher(false)
        clearExpiry()
      }
    })

    return () => {
      isMounted = false
      clearTimer()
      sub.subscription.unsubscribe()
    }
  }, [clearExpiry, setExpiry, scheduleLogoutAt])

  // Inactivity tracking: reset expiry on user activity when logged in
  useEffect(() => {
    if (!isTeacher) return
    const refreshActivity = () => setExpiry(INACTIVITY_MINUTES)
    const opts = { passive: true } as AddEventListenerOptions
    window.addEventListener("mousemove", refreshActivity, opts)
    window.addEventListener("mousedown", refreshActivity, opts)
    window.addEventListener("keydown", refreshActivity, opts)
    window.addEventListener("scroll", refreshActivity, opts)
    window.addEventListener("touchstart", refreshActivity, opts)
    return () => {
      window.removeEventListener("mousemove", refreshActivity as EventListener)
      window.removeEventListener("mousedown", refreshActivity as EventListener)
      window.removeEventListener("keydown", refreshActivity as EventListener)
      window.removeEventListener("scroll", refreshActivity as EventListener)
      window.removeEventListener("touchstart", refreshActivity as EventListener)
    }
  }, [isTeacher, setExpiry])

  const endTeacherSession = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { isTeacher, endTeacherSession }
}

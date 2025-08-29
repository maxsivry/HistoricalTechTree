"use client"

import type React from "react"

import { useState, useRef } from "react"

export const useTechTreeInteractions = () => {
  const [zoomLevel, setZoomLevel] = useState(0.5)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle zoom in/out
  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) => {
      if (direction === "in" && prev < 2) return prev + 0.1
      if (direction === "out" && prev > 0.5) return prev - 0.1
      return prev
    })
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartDragPosition({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - startDragPosition.x,
      y: e.clientY - startDragPosition.y,
    })
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent the default scroll behavior
    e.preventDefault()

    // Determine zoom direction based on wheel delta
    const direction = e.deltaY < 0 ? "in" : "out"

    // Calculate new zoom level
    const newZoomLevel = direction === "in" ? Math.min(zoomLevel + 0.1, 2) : Math.max(zoomLevel - 0.1, 0.5)

    // Get mouse position relative to the container
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate the point under the mouse in the original coordinate system
    const pointX = mouseX / zoomLevel - position.x / zoomLevel
    const pointY = mouseY / zoomLevel - position.y / zoomLevel

    // Calculate the new position to keep the point under the mouse
    const newPositionX = -pointX * newZoomLevel + mouseX
    const newPositionY = -pointY * newZoomLevel + mouseY

    // Update zoom level and position
    setZoomLevel(newZoomLevel)
    setPosition({ x: newPositionX, y: newPositionY })
  }

  return {
    zoomLevel,
    position,
    setPosition,
    containerRef,
    handleZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  }
}

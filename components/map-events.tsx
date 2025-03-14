"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import type { LeafletMouseEvent } from "leaflet"

interface MapEventsProps {
  onClick: (e: LeafletMouseEvent) => void
}

export default function MapEvents({ onClick }: MapEventsProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    map.on("click", onClick)

    return () => {
      map.off("click", onClick)
    }
  }, [map, onClick])

  return null
}


import type { City } from "@/types/game"

// List of major Swiss cities with coordinates
export const swissCities: City[] = [
  { name: "Zürich", lat: 47.3769, lng: 8.5417 },
  { name: "Geneva", lat: 46.2044, lng: 6.1432 },
  { name: "Basel", lat: 47.5596, lng: 7.5886 },
  { name: "Lausanne", lat: 46.5197, lng: 6.6323 },
  { name: "Bern", lat: 46.948, lng: 7.4474 },
  { name: "Winterthur", lat: 47.5, lng: 8.75 },
  { name: "Lucerne", lat: 47.0502, lng: 8.3093 },
  { name: "St. Gallen", lat: 47.4244, lng: 9.3767 },
  { name: "Lugano", lat: 46.0037, lng: 8.9511 },
  { name: "Biel/Bienne", lat: 47.1368, lng: 7.2467 },
  { name: "Thun", lat: 46.758, lng: 7.628 },
  { name: "Bellinzona", lat: 46.1947, lng: 9.0186 },
  { name: "Neuchâtel", lat: 46.9926, lng: 6.9307 },
  { name: "Chur", lat: 46.85, lng: 9.53 },
  { name: "Sion", lat: 46.2324, lng: 7.36 },
  { name: "Fribourg", lat: 46.8031, lng: 7.1533 },
  { name: "Schaffhausen", lat: 47.6964, lng: 8.6319 },
  { name: "Montreux", lat: 46.4312, lng: 6.9107 },
  { name: "Zug", lat: 47.1662, lng: 8.5154 },
  { name: "Locarno", lat: 46.1692, lng: 8.7946 },
]

// Select a random city from the list
export function getRandomCity(): City {
  const randomIndex = Math.floor(Math.random() * swissCities.length)
  return swissCities[randomIndex]
}

// Get a city by name
export function getCityByName(name: string): City | undefined {
  return swissCities.find((city) => city.name === name)
}


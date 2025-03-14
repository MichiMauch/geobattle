export interface City {
  name: string
  lat: number
  lng: number
}

export interface GameState {
  currentCity: City | null
  score: number
  round: number
  maxRounds: number
  guessedLocation: [number, number] | null
  distance: number | null
  showResults: boolean
}


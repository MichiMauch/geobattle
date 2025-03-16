# 🌍 GeoBattle – The Ultimate Geography Challenge! 🎯

**GeoBattle** is an interactive and challenging geography game where you can test your knowledge of cities, mountains, and landmarks. Place your marker on the map and see how close your guess is to the actual location!

---

## 🔥 How does the game work?

1️⃣ **Guess the Location:** You are given a city, mountain, or landmark in Switzerland.  
2️⃣ **Place Your Marker:** Click on the map where you think the location is.  
3️⃣ **See Your Results:** Find out how close you were and earn points for accurate guesses.  
4️⃣ **Compare Distances:** A line shows the distance between your guess and the real location.

---

## 🚀 Features

✅ **Real Location Data** → Uses an extensive database of Swiss cities, mountains, and landmarks.  
✅ **Intuitive Controls** → Easily place your marker on the map.  
✅ **Learn While Playing** → Improve your knowledge of Swiss geography in a fun way.  
✅ **Challenges & High Scores** → Compete against yourself or friends for the best accuracy.

---

GeoBattle is perfect for anyone who loves geography and wants to improve their map knowledge. Are you ready to test your skills? 🌎🔥

## Features

- Login with Google Account
- Single Player Mode
- Challenge Mode
- Map: Switzerland

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/michimauch/geobattle.git
   ```
2. Navigate to the project directory:
   ```sh
   cd geobattle
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## List of POIs

```sh
Cities: curl -s "http://api.geonames.org/searchJSON?country=CH&featureClass=P&maxRows=1000&username=xyz" | jq -r '.geonames[] | "\(.name),\(.lat),\(.lng)"' > schweiz_staedte.csv

Mountains: curl -s "http://api.geonames.org/searchJSON?country=CH&featureClass=T&maxRows=1000&username=xyz" | jq -r '.geonames[] | "\(.name),\(.lat),\(.lng)"' > schweizer_berge.csv

POI: curl -s "http://api.geonames.org/searchJSON?country=CH&featureClass=S&maxRows=1000&username=michimauch" | jq -r '.geonames[] | "\(.name),\(.lat),\(.lng),\(.fcode)"' > schweizer_sehenswuerdigkeiten.csv
```

## Send Mails

I used Resend here for the Challenger notifications mails (www.resend.com)

## .env.local

TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
RESEND_API_KEY=r

## Usage

To start the game, run:

```sh
npm start
```

# AgriMarketplace

## Backend

The Express API stores produce listings in MongoDB. The local connection string belongs in `backend/.env`; use `backend/.env.example` as the template and keep credentials out of source control.

```bash
cd backend
npm install
npm run dev
```

The API listens on port `5000` by default. `GET /health` reports API/database readiness. Produce endpoints are `GET/POST /api/produce` and `GET/PUT/DELETE /api/produce/:id`.

## Frontend API URL

The web app defaults to `http://localhost:5000/api`. For a physical phone, set `EXPO_PUBLIC_API_URL` in `frontend/.env` to `http://<computer-LAN-IP>:5000/api`, with the phone and computer on the same Wi-Fi network, then restart Expo.
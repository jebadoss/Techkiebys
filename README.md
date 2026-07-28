# TrackWheel — Digital Register (Frontend)

React frontend for the parking attendant app: digital entry/exit register,
SMS-token check-in, QR check-out, last-4-digit phone lookup, overstay alerts,
and cash reconciliation.

## Stack
React 18 · React Router · Axios · react-qr-code · html5-qrcode · Tailwind CSS

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Every request to `/api/*` is proxied to
`http://localhost:8080` (your Spring Boot backend) — see `vite.config.js`.

If the backend isn't running, every page still works: `AuthContext` and each
API call in `src/api/client.js` fall back to local mock data (see
`src/data/mock.js`), so you can demo the full flow without a server.

## Wiring to Spring Boot

Endpoints the frontend expects (`src/api/client.js`), map these to your
`@RestController`s:

| Frontend call                        | Method & path                  |
|---------------------------------------|---------------------------------|
| `authApi.login`                       | `POST /api/auth/login`         |
| `vehicleApi.checkIn`                  | `POST /api/vehicles/check-in`  |
| `vehicleApi.checkOut`                 | `POST /api/vehicles/check-out/{token}` |
| `vehicleApi.search`                   | `GET /api/vehicles/search?q=`  |
| `vehicleApi.active`                   | `GET /api/vehicles/active`     |
| `vehicleApi.history`                  | `GET /api/vehicles/history?date=` |
| `vehicleApi.byPhoneLast4`             | `GET /api/vehicles/search-phone?last4=` |
| `shiftApi.summary` / `shiftApi.close` | `GET/POST /api/shift/*`        |

JWT is read from `localStorage` (`trackwheel_token`) and attached as
`Authorization: Bearer <token>` on every request (see the axios
interceptor). A 401 response auto-redirects to `/login`.

## Structure

```
src/
  api/client.js        axios instance + endpoint helpers
  context/AuthContext   login state, JWT storage
  components/
    TicketStub.jsx      digital token rendered as a paper-ticket stub (QR code)
    Sidebar.jsx          nav shell
    StatCard.jsx
  pages/
    Login.jsx
    Dashboard.jsx        "Live Register" — active vehicles, overstay alerts
    Entry.jsx             check-in flow (bike vs bicycle branching, photo capture)
    Exit.jsx               check-out: token / QR scan / phone-last-4 lookup
    History.jsx            daily log + CSV export
    Shift.jsx               cash drawer reconciliation
  data/mock.js           dev fallback data + fee calculator
```

## Design notes

Palette: ink navy `#1B2430`, paper `#F7F5F0`, safety amber `#FFB020`, teal
`#0F6A63`, alert red `#D64545`. Display type is Space Grotesk, body is
Inter, tokens/data use IBM Plex Mono. The signature element is the
`TicketStub` component — every generated token renders as a perforated
paper-ticket stub with a scannable QR code, echoing the physical token this
app replaces.
"# Techkiebys" 
"# Techkiebys" 

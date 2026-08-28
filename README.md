# TMKOC Random Episode Player & Discovery Engine

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cluster-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Google OAuth](https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Product Hunt](https://img.shields.io/badge/Product_Hunt-Featured-FF6154?style=for-the-badge&logo=producthunt&logoColor=white)](https://www.producthunt.com/products/tmkoc-unseen-episode-player)

**Product Hunt Page**: [https://www.producthunt.com/products/tmkoc-unseen-episode-player](https://www.producthunt.com/products/tmkoc-unseen-episode-player)

A full-stack, enterprise-grade web application built to solve the recommendation algorithm bias for fans of *Taarak Mehta Ka Ooltah Chashmah*. Instead of re-suggesting already-watched popular episodes, this engine maintains server-authoritative, per-user watch histories and serves randomized batches of unseen episodes filtered by era/genre.

---

## Table of Contents

1. [System Overview & Key Features](#system-overview--key-features)
2. [Full-Stack Layered Architecture](#full-stack-layered-architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schemas & Data Models](#database-schemas--data-models)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Environment Variables](#environment-variables)
8. [Local Development & Setup Guide](#local-development--setup-guide)
9. [Database Seeding Guide](#database-seeding-guide)
10. [Security & Production Hardening](#security--production-hardening)

---

## System Overview & Key Features

* **Server-Authoritative Randomness**: Episode filtering and unwatched exclusion logic executes exclusively at the database layer (MongoDB aggregation pipeline). Frontend state cannot bypass or compromise watch history tracking.
* **Google OAuth 2.0 & Dual-Token Strategy**: Single Sign-On using Google Identity Services. Short-lived (15 min) in-memory access tokens paired with `HttpOnly`, `SameSite=Strict` refresh token cookies stored hashed in Redis.
* **YouTube IFrame API Integration**: Embedded video player tracks playback events directly; episode watch status is committed to MongoDB only when playback actually begins (`PLAYING` state), preventing accidental click-logging.
* **Favorites & Public Social Sharing**: Save favorite episodes and share personalized favorites via cryptographic, user-id-blind share tokens (`/share/[shareToken]`).
* **Complete Watch History**: Review, search, and manage personal watch histories with options to clear or rewatch past episodes.
* **High-Performance Redis Caching & Rate Limiting**: Sliding-window rate limiting on sensitive routes (`/api/auth/*`, `/api/episodes/generate`) with hot-path session caching.
* **Automated Production Seeding**: Multi-playlist YouTube Data API v3 seeder with exponential backoff retries, parallel fetching, title-based era classification (`classic`, `golden`, `modern`), and non-destructive reconciliation.

---

## Full-Stack Layered Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Next.js 16)                      │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌───────────────┐  │
│  │   App Router Pages    │ │  Zustand Global Store│ │ Client Engine │  │
│  │ / /favorites /history │ │ authStore, episodeStore│ │ Lenis, Motion │  │
│  └───────────┬───────────┘ └──────────┬───────────┘ └───────┬───────┘  │
└──────────────┼────────────────────────┼─────────────────────┼──────────┘
               │                        │                     │
               ▼                        ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Express 5 Node)                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Security Middleware (Helmet, CORS, HPP, MongoSanitize, RateLimit)│  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│  ┌──────────────────┐ ┌─────────────┴─────┐ ┌───────────────────────┐  │
│  │ Auth Controller  │ │Episode Controller │ │ Favorites Controller  │  │
│  └───────────┬──────┘ └─────────────┬─────┘ └───────────┬───────────┘  │
└──────────────┼──────────────────────┼───────────────────┼──────────────┘
               │                      │                   │
               ▼                      ▼                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER (Redis & MongoDB)                    │
│  ┌──────────────────────────────┐     ┌─────────────────────────────┐  │
│  │         Redis Cache          │     │    MongoDB Replica Set      │  │
│  │ Session Revocation & Limiting│     │ Users, Episodes, History    │  │
│  └──────────────────────────────┘     └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend (`/client`)
* **Framework**: Next.js 16 (App Router with Server & Client Components)
* **UI Library**: React 19, Tailwind CSS v4
* **State Management**: Zustand
* **Animations & FX**: Framer Motion, Lenis Smooth Scroll, Lucide Icons, Embla Carousel / Swiper
* **Validation**: Zod
* **Type Safety**: TypeScript 5

### Backend (`/server`)
* **Runtime**: Node.js v18+ (ES6+ / CommonJS)
* **Web Framework**: Express 5 (Async error handling native)
* **Database**: MongoDB Atlas via Mongoose 9
* **Caching & Sessions**: Redis via ioredis
* **Authentication**: Google Auth Library (`google-auth-library`), JsonWebToken (`jsonwebtoken`)
* **Security & Hardening**: `helmet`, `hpp`, `cors`, `express-rate-limit`, `cookie-parser`, `nanoid`

---

## Project Structure

```
.
├── client/                      # Frontend Next.js Application
│   ├── src/
│   │   ├── app/                 # Next.js App Router Routes
│   │   │   ├── page.tsx         # Home Page (Episode Randomizer Grid)
│   │   │   ├── generate/        # Dedicated Episode Generator
│   │   │   ├── favorites/       # User Favorites Dashboard
│   │   │   ├── history/         # Watch History & Management
│   │   │   ├── share/[token]/   # Public Shared Favorites View
│   │   │   └── 2411admin/       # Admin Dashboard & Entry Logs
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── HeroSection.tsx  # Interactive Banner
│   │   │   ├── EpisodeCard.tsx  # Episode Card with Hover Animation
│   │   │   └── EpisodePlayer.tsx# Embedded YouTube IFrame Wrapper
│   │   ├── features/            # Feature-Based Modules
│   │   │   ├── auth/            # Auth hooks, store, and Google Button
│   │   │   └── episodes/        # Episode state & API hooks
│   │   └── lib/                 # Axios/Fetch API Client & Utilities
│   ├── package.json
│   └── next.config.ts
│
├── server/                      # Backend Express REST API
│   ├── server.js                # Server Entry Point & Graceful Shutdown
│   ├── src/
│   │   ├── app.js               # Express Middleware & Route Registration
│   │   ├── config/              # Environment, DB & Redis Connections
│   │   ├── controllers/         # Request Handlers (Auth, Episodes, etc.)
│   │   ├── middleware/          # JWT Verification, Rate Limiting, Errors
│   │   ├── models/              # Mongoose Schemas (User, Episode, etc.)
│   │   ├── routes/              # Express API Endpoint Routes
│   │   ├── seeds/               # Production Seeder (`importEpisodes.js`)
│   │   └── services/            # Business Logic & DB Queries
│   ├── package.json
│   └── .env.example
│
├── DESIGN-clay.md               # Visual Design System Specification
├── project.md                   # System Architecture Specification
└── README.md                    # Main Project Documentation
```

---

## Database Schemas & Data Models

### 1. User Schema (`users`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | PK, Auto | Primary Key |
| `googleId` | String | Unique, Indexed | Google account `sub` ID |
| `email` | String | Unique, Indexed | User email address |
| `name` | String | Required | Full display name |
| `avatarUrl` | String | Optional | Profile image URL |
| `shareToken` | String | Unique, Indexed | Opaque nanoid string for public share links |
| `createdAt` | Date | Default `Date.now` | Account creation timestamp |

### 2. Episode Schema (`episodes`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | PK, Auto | Primary Key |
| `title` | String | Required, Indexed | Full episode title |
| `genre` | String | Required, Indexed | Era classification: `classic`, `golden`, `modern` |
| `youtubeVideoId` | String | Unique, Indexed | YouTube 11-char video identifier |
| `thumbnailUrl` | String | Required | High-res episode thumbnail URL |
| `durationSeconds` | Number | Default `1200` | Duration in seconds |
| `episodeNumber` | Number | Indexed | Parsed numeric episode index |

### 3. WatchHistory Schema (`watchhistories`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | PK, Auto | Primary Key |
| `userId` | ObjectId | Ref `User`, Indexed | Compound unique index with `episodeId` |
| `episodeId` | ObjectId | Ref `Episode`, Indexed | Watched episode reference |
| `watchedAt` | Date | Default `Date.now` | Date episode playback started |

### 4. Favorite Schema (`favorites`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | PK, Auto | Primary Key |
| `userId` | ObjectId | Ref `User`, Indexed | Compound unique index with `episodeId` |
| `episodeId` | ObjectId | Ref `Episode`, Indexed | Favorited episode reference |
| `addedAt` | Date | Default `Date.now` | Date added to favorites |

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/google` | Public | Verify Google ID token, log in/create user, set HttpOnly refresh cookie |
| `POST` | `/api/auth/refresh` | Cookie | Exchange valid refresh cookie for new access token & rotate refresh token |
| `POST` | `/api/auth/logout` | Auth | Revoke refresh token in Redis & clear auth cookie |
| `GET` | `/api/auth/me` | Auth | Retrieve current authenticated user profile |

### Episode Management (`/api/episodes`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/episodes/generate` | Auth | Fetch 4 random unwatched episodes (Query param: `?genre=classic\|golden\|modern`) |
| `POST` | `/api/episodes/:id/watch` | Auth | Record episode as watched when YouTube player starts playback |
| `GET` | `/api/episodes/history` | Auth | Get current user's complete watch history |
| `DELETE` | `/api/episodes/history` | Auth | Clear current user's watch history |

### Favorites (`/api/favorites`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/favorites` | Auth | Get list of user's favorited episodes |
| `POST` | `/api/favorites/:episodeId` | Auth | Add an episode to favorites |
| `DELETE` | `/api/favorites/:episodeId` | Auth | Remove an episode from favorites |

### Social Sharing (`/api/share`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/share/:shareToken` | Public | Fetch public read-only favorites list by owner's `shareToken` |

---

## Environment Variables

### Server Environment (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Security Secrets (Must be at least 32 characters in production)
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_32chars_min
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_32chars_min
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Databases
MONGODB_URI=mongodb://localhost:27017/tmkoc_episodes
REDIS_URL=redis://localhost:6379

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Optional YouTube Seeder Key
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
```

### Client Environment (`client/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

## Local Development & Setup Guide

### Prerequisites
* **Node.js**: v18.x or higher
* **npm**: v9.x or higher
* **MongoDB**: Running instance locally or MongoDB Atlas Connection URI
* **Redis**: Running instance locally or Redis Cloud URI

---

### Step 1: Clone Repository
```bash
git clone https://github.com/theaatif/tmkoc_radom_episode-finder.git
cd tmkoc_radom_episode-finder
```

---

### Step 2: Configure & Run Backend Server
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Create environment configuration
cp .env.example .env
# Open .env and update MongoDB URI, Redis URL, JWT Secrets, and Google Client ID

# Start development server with Nodemon
npm run dev
```
The server will start on `http://localhost:5000`. Verify with `GET http://localhost:5000/api/health`.

---

### Step 3: Configure & Run Frontend Application
```bash
# Open a new terminal and navigate to client directory
cd client

# Install frontend dependencies
npm install

# Create local environment configuration
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_BASE_URL points to http://localhost:5000/api

# Start Next.js development server
npm run dev
```
The client application will start on `http://localhost:3000`.

---

## Database Seeding Guide

The repository includes a production-grade seeder script (`server/src/seeds/importEpisodes.js`) that populates MongoDB with official TMKOC episodes directly from YouTube playlists using the YouTube Data API v3.

### Features of the Seeder:
* **Automatic Era Classification**: Maps episode numbers to `classic` (Ep 1–500), `golden` (Ep 501–1500), and `modern` (Ep 1501+).
* **Parallel Playlist Ingestion**: Concurrently fetches multiple YouTube playlists.
* **Resilience**: Features exponential-backoff retries and rate-limit backoff (HTTP 429).
* **Non-Destructive Reconciliation**: Upserts episodes based on `youtubeVideoId` without wiping existing watch histories.

### Running the Seeder:
```bash
cd server
# Ensure YOUTUBE_API_KEY is defined in server/.env
npm run seed
```

---

## Security & Production Hardening

1. **Short-Lived Access Tokens**: Access tokens expire in 15 minutes and live exclusively in client React memory (never saved to `localStorage` or `sessionStorage` to mitigate XSS risks).
2. **HttpOnly & Secure Refresh Cookies**: Refresh tokens are transferred inside `HttpOnly`, `SameSite=Strict`, `Secure` cookies and stored SHA-256 hashed inside Redis.
3. **NoSQL Injection Prevention**: Custom query sanitizer handles MongoDB key stripping (`$` and `.`) compatible with Express 5 getters.
4. **Parameter Pollution & Security Headers**: Integrated `helmet` policies, `hpp` query protection, strict CORS origins, and `no-store` API response headers for sensitive user endpoints.
5. **Rate Limiting**: Redis-backed sliding window rate limiter protects `/api/auth/*` against brute-force attacks and limits expensive aggregation queries on `/api/episodes/generate`.

---

## License

This project is open-source and available under the [ISC License](LICENSE).

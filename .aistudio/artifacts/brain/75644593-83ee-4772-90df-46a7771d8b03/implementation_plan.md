# Android PWA Installation & Automatic Vercel Continuous Deployment

A complete deployment, installation, and auto-updating architecture enabling Chronos Flow to be hosted continuously on Vercel and installed directly onto Android devices with silent background updates on every app launch.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices in Phase 1, the app will be optimized for **Android Chrome PWA installation**, continuous deployment via **Vercel connected to GitHub**, and **silent background updates** on launch.

- **Confirmed Hosting**: Vercel connected to GitHub. Every commit/push automatically triggers an optimized Vite build and deploys live in ~30 seconds.
- **Confirmed Target Platform**: Android (Chrome / Chromium). Uses native web app install prompts and Web App Manifest (`standalone` mode) with full-screen, no URL bars.
- **Confirmed Update Strategy**: Silent background auto-update. When you push updates to GitHub/Vercel, the phone app checks for changes on launch, refreshes cached assets in the background, and seamlessly runs the latest version without requiring manual re-installation.
- **Service Worker Cache Invalidation**: `vercel.json` will enforce `Cache-Control: public, max-age=0, must-revalidate` on `sw.js` and `manifest.webmanifest` so Android Chrome never gets stuck on old cached service workers.

---

## 1. Overview & Core Concept

### What It Does
This architecture turns Chronos Flow into a native-feeling Android app powered by Progressive Web App (PWA) standards and continuous deployment on Vercel. 
- You push code changes to your GitHub repository.
- Vercel automatically builds and deploys the new version within seconds to your custom domain or `*.vercel.app` URL.
- When you tap the Chronos Flow icon on your Android home screen, the installed app immediately loads instantly from cache, checks for newly deployed assets in the background, and cleanly swaps in the latest version.
- An in-app **Phone Installation & Vercel Setup Guide** with an interactive QR code generator allows you to easily scan your deployed URL directly with your Android camera and install it in one tap.

### Target Audience & Persona
The user managing daily calendar tasks, alarms, and streaks on an Android phone who wants the convenience of a native app icon and full-screen view combined with the instant iteration speed of web deployment.

### Key Value
- **Zero App Store Overhead**: No Google Play Console fees, review delays, or APK sideloading.
- **Install Once, Always Up to Date**: Any code modification pushed to GitHub updates your phone app automatically.
- **Preserved Local Data**: Alarms, completed tasks, Google OAuth session, and fire streak states persist across updates.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Developer Workflow: Push Updates ]
AI Studio / Local Code -> Git Commit & Push -> GitHub -> Vercel Auto-Build -> Live Production URL

[ User Workflow: Android Install ]
Open Vercel URL in Chrome -> In-App "Install on Android" Banner or Settings Menu -> Tap "Install" -> App Icon Added to Phone Home Screen

[ Daily Use & Auto-Update Flow ]
Tap Chronos Flow icon -> Instant offline launch -> Service Worker queries Vercel for new hash -> New assets downloaded in background -> Silent seamless activation on next session
```

1. **Vercel & Installation Guide Modal**:
   - Accessible via a prominent "Install & Deploy" button in Settings and an intuitive top-right app header icon.
   - Shows a step-by-step checklist for linking GitHub to Vercel.
   - Includes a QR code generator for the live Vercel URL so the user can scan and open it immediately on their Android phone.
   - Android-specific visual instructions (with Chrome's 3-dot menu and "Install app" / "Add to Home screen" illustration).

2. **Android Native Experience**:
   - Launching the app from the home screen opens in `standalone` display mode (no address bar, no browser navigation arrows, native status bar tinted to match `#09090b`).
   - Tactile bottom navigation bar formatted according to the Mobile Touch Apps design standard ($48\text{px}$ touch targets, generous padding).

3. **Silent Update Delivery**:
   - `virtual:pwa-register` registers the service worker with `immediate: true` and `registerType: 'autoUpdate'`.
   - On app launch or visibility change (`document.visibilityState === 'visible'`), the service worker pings the server for asset manifest updates.
   - A quiet "App updated to latest build" micro-indicator briefly displays in Settings to confirm fresh code without disrupting active productivity sessions.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Progressive Web App (PWA) on Vercel vs. Native Android APK (Capacitor/Cordova)
- **Chosen Approach**: PWA on Vercel with Web App Manifest and Service Worker.
- **Why**: Native APKs (even with OTA tools like CodePush) require complex Android SDK setup, signing keystores, and break easily in web-first preview environments. PWAs running on Android Chrome deliver 95% of native capabilities (standalone window, home screen icon, offline storage, vibration, audio alarms) while offering instant, friction-free continuous deployment via Vercel.
- **Alternatives Considered**: 
  - *Native Android APK*: Sideloading requires enabling unknown sources, manual file downloading on each update, and manual re-installation.
  - *Google Play Store*: Requires developer account, payment, and multi-day review cycles for every bug fix.

### Decision 2: Service Worker Update Strategy (Auto-Update vs. Prompt Banner)
- **Chosen Approach**: `registerType: 'autoUpdate'` with immediate client claim (`clientsClaim: true`, `skipWaiting: true`).
- **Why**: As requested by the user ("Update automatically in background on launch"), this eliminates disruptive modal prompts asking the user to refresh.
- **Implementation Detail**: Service worker checks for updates on launch and every 60 minutes.

### Decision 3: Cache Invalidation via `vercel.json`
- **Chosen Approach**: Add `vercel.json` configuring HTTP headers.
- **Why**: Without explicit cache headers, CDNs or browser service worker caches might keep `sw.js` cached for 24 hours. Setting `Cache-Control: public, max-age=0, must-revalidate` for `sw.js` and `manifest.webmanifest` guarantees Android Chrome detects every new Vercel deployment instantly.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GITHUB REPOSITORY                               │
│  - Source code, vite.config.ts, vercel.json, public/ icons & manifest  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ git push
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE HOSTING                             │
│  - npm run build (Vite + vite-plugin-pwa)                              │
│  - Invalidate HTML & sw.js with max-age=0                              │
│  - Long-term cache immutable hashed JS/CSS assets                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS Fetch
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     ANDROID DEVICE (Chrome PWA)                        │
│                                                                        │
│  ┌──────────────────────┐               ┌───────────────────────────┐  │
│  │   Home Screen Icon   │               │   Service Worker (sw.js)  │  │
│  │  - Standalone Window │               │  - Precache app shell     │  │
│  │  - Theme: #09090b    │               │  - Auto-update on launch  │  │
│  └──────────┬───────────┘               └─────────────┬─────────────┘  │
│             │                                         │                │
│             ▼                                         ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    REACT 19 SPA RUNTIME                          │  │
│  │  - App.tsx (State, Alarms, Tasks, Fire Streak)                  │  │
│  │  - Google Calendar OAuth Sync (Firebase Auth + Token Cache)     │  │
│  │  - LocalStorage (Task completion, custom alarms, streaks)       │  │
│  │  - PWAInstallModal / Settings with QR Code & Deployment Guide    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Technical Adjustments Planned

1. **`vercel.json`**:
   - Single-Page App (SPA) rewrite rule (`"rewrites": [{ "source": "/(.*)", "destination": "/" }]`).
   - Cache control headers ensuring `sw.js`, `registerSW.js`, and `manifest.webmanifest` are always revalidated (`max-age=0`).

2. **`src/main.tsx`**:
   - Register virtual service worker via `virtual:pwa-register`.
   - Wire periodic update checks (`setInterval(..., 3600000)`) and visibility change listener (`document.addEventListener('visibilitychange')`).

3. **`src/components/SettingsScreen.tsx` & `src/components/PWAInstallModal.tsx`**:
   - Enhanced Android installation walkthrough with visual cues.
   - Interactive QR code display for the user's Vercel/live URL so they can scan from their phone screen.
   - Direct step-by-step GitHub to Vercel setup checklist with one-click copyable instructions.

4. **`vite.config.ts`**:
   - Ensure `workbox.skipWaiting: true` and `workbox.clientsClaim: true` are active in the `VitePWA` configuration.

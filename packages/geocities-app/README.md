# ~*~RiChArDs HoMePaGe~*~

> A modern React/Next.js application that looks like it escaped from 1996

## 🔥 Features

- **Modern Architecture**: Next.js 14, TypeScript, SASS modules
- **Atomic Design**: Proper component hierarchy (atoms → molecules → organisms → templates)
- **Custom Hooks**: `useIndexedDB`, `useVisitorCounter`, `useGuestbook`
- **IndexedDB Persistence**: Visitor counter and guestbook survive page reloads
- **90s Aesthetic**: All the GeoCities hallmarks you remember (or want to forget)

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: SASS/SCSS Modules
- **State Management**: React hooks + IndexedDB
- **Architecture**: Atomic Design Pattern

## 📁 Project Structure

```
geocities-app/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Home page with splash/main routing
├── components/
│   ├── atoms/              # Basic building blocks
│   │   ├── BlinkText/      # <blink> tag energy
│   │   ├── MarqueeText/    # Scrolling text
│   │   ├── RetroGif/       # Classic animated gifs
│   │   ├── RetroButton/    # Windows 95 style buttons
│   │   ├── RetroInput/     # Inset text inputs
│   │   ├── RetroTextarea/  # Inset textareas
│   │   └── RainbowText/    # Animated rainbow text
│   ├── molecules/          # Combined atoms
│   │   ├── VisitorCounter/ # Hit counter display
│   │   ├── GuestbookForm/  # Sign the guestbook
│   │   ├── GuestbookEntry/ # Individual guestbook entry
│   │   ├── NavLink/        # Navigation links with badges
│   │   └── WebRing/        # Remember web rings?
│   ├── organisms/          # Complex components
│   │   ├── Header/         # Site header with marquee
│   │   ├── Sidebar/        # Navigation, counter, awards
│   │   ├── MainContent/    # About, links, updates
│   │   ├── Guestbook/      # Full guestbook section
│   │   └── Footer/         # Credits and badges
│   └── templates/          # Page layouts
│       ├── SplashScreen/   # ENTER splash page
│       └── MainLayout/     # Main site layout
├── hooks/
│   ├── useIndexedDB.ts     # Generic IndexedDB hook
│   ├── useVisitorCounter.ts # Visitor counter state
│   └── useGuestbook.ts     # Guestbook CRUD
└── styles/
    └── globals.scss        # Global 90s styles
```

## 🏃 Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to enter the time warp.

## ✨ GeoCities Elements Included

- [x] Cheesy "ENTER" splash screen
- [x] Animated cursor trail (sparkles!)
- [x] Blinking text
- [x] Rainbow text
- [x] Marquee scrolling
- [x] Under construction GIFs
- [x] Dancing baby GIF
- [x] Fire GIFs
- [x] Skull GIF
- [x] Visitor counter
- [x] Guestbook
- [x] Web ring
- [x] "Best viewed with Netscape/IE" badges
- [x] Award badges
- [x] Windows 95 style buttons
- [x] Ridge/groove borders everywhere
- [x] Tiled backgrounds
- [x] Comic Sans (via Comic Neue)
- [x] wEiRd CaPiTaLiZaTiOn

## 🎨 Design Philosophy

**The Ironic Stack**: Maximum modern engineering practices wrapped in maximum 90s web chaos. TypeScript strict mode enforcing the type safety of your `<blink>` tag replacement.

Built with genuine affection for the web's weird, wonderful early days.

---

*MaDe WiTh 💕 aNd Notepad.exe*

*(AcTuAlLy MaDe WiTh Next.js, React, TypeScript, SASS & IndexedDB)*

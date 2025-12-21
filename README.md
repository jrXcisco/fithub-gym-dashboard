# FitHub Gym Dashboard

A modern gym management dashboard built with React, TypeScript, and Vite. Features member management, trainer tracking, event scheduling, and more.

## 🚀 Live Demo

**Production URL:** https://fithub-gym-dashboard.netlify.app

### Demo Credentials
- **Email:** `amit.kumar@gmail.com`
- **Password:** `1234567`

## 📋 Features

- **Authentication** - Login/Signup with protected routes
- **Dashboard** - Overview with key metrics and widgets
- **Members Management** - Add, edit, view member details
- **Trainers** - Manage gym trainers
- **Events** - Schedule and track gym events
- **Follow-ups** - Track member follow-ups
- **Resources** - Manage gym resources/equipment

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **React Router** - Routing
- **Lucide React** - Icons

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jrXcisco/fithub-gym-dashboard.git
   cd fithub-gym-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🌿 Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Active development |
| `release` | UAT (User Acceptance Testing) |

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout components (Sidebar, Header)
│   └── ui/            # Reusable UI components
├── features/
│   ├── auth/          # Login/Signup pages
│   ├── dashboard/     # Dashboard page
│   ├── members/       # Members management
│   ├── trainers/      # Trainers management
│   ├── events/        # Events management
│   ├── followups/     # Follow-ups management
│   └── resources/     # Resources management
├── stores/            # Zustand state stores
├── types/             # TypeScript types
└── lib/               # Utility functions
```

## 🔐 Authentication

The app uses Zustand with persist middleware for authentication state. Login state is stored in localStorage.

---

## Original Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

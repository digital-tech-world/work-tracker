# Work Tracker

A fully local, single-user web app for tracking tasks, bookmarks, notes, and daily work logs.

## 🚀 Quick Start

### Windows PowerShell

Use Node.js 22 or newer. The server uses the native `better-sqlite3` package, which provides prebuilt binaries for Node 22 on Windows.

```powershell
cd C:\Users\<your-user>\tracker
npm.cmd install
npm.cmd run db:seed
npm.cmd run dev
```

Open http://localhost:5173 after the development server starts. Do not use `sudo` on Windows. If PowerShell blocks `npm`, use `npm.cmd` as shown above.

### Linux/macOS

The easiest way to get started is to use the provided startup script:

```bash
# Make sure you have Node.js (>=22) and npm installed
chmod +x start.sh   # First time only
./start.sh
```

The script will:
1. Check for Node.js and npm
2. Install dependencies (if needed)
3. Seed the database with default areas
4. Start the development server (API on http://localhost:3001, UI on http://localhost:5173)

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (version 22 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Optional for AI features: [Ollama](https://ollama.ai/) (the app works without it)

## 🔧 What the Script Does

- `./start.sh` runs `npm install` if `node_modules` is missing
- Runs `npm run db:seed` to populate default areas (ignores if already seeded)
- Starts the app with `npm run dev` (concurrently runs Express server and Vite client)

## 🛠️ Manual Setup (Alternative)

If you prefer to run the commands manually:

```bash
# Install dependencies
npm install

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

On Windows, replace each `npm` command with `npm.cmd`.

## 📚 Documentation

For detailed information about features, project structure, API routes, and AI capabilities, see [GOAL.md](GOAL.md).

## 💡 Usage Tips

- Open http://localhost:5173 in your browser
- Use `Ctrl+K` to open the global search
- The sidebar provides navigation to all sections (Tasks, Bookmarks, Notes, Areas, etc.)
- AI features (chat, auto-categorize, similar tasks) work if Ollama is running
- The app gracefully degrades if Ollama is not available

## 🐛 Troubleshooting

- **"command not found: rtk"** – This is from an unrelated token optimization tool; ignore it.
- **`sudo` is not recognized** – `sudo` is a Linux command. Do not use it in Windows PowerShell.
- **PowerShell says running scripts is disabled** – Use `npm.cmd install`, `npm.cmd run db:seed`, and `npm.cmd run dev`. Alternatively, allow local scripts for your user with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- **`better_sqlite3.node` is not a valid Win32 application or bindings cannot be found** – Remove the old native dependency and reinstall it for the active Node version:

	```powershell
	Remove-Item -Recurse -Force node_modules
	npm.cmd install
	npm.cmd run db:seed
	```

	Confirm that `node --version` is 22 or newer. Node 20 or older is not compatible with the current `better-sqlite3` dependency.
- **`no such table: main.tasks`** – The local database was created incompletely. Delete only the local database files and run the seed again:

	```powershell
	Remove-Item -Force data\work-tracker.db,data\work-tracker.db-shm,data\work-tracker.db-wal -ErrorAction SilentlyContinue
	npm.cmd run db:seed
	```

- **Port already in use** – Change `PORT` or `VITE_PORT` in `.env` file.
- **Database errors** – Ensure the `data/` directory is writable (the app creates it automatically).
- **Ollama not detected** – Make sure Ollama is running (`ollama serve`) or set `OLLAMA_HOST` in `.env`.

## 📦 Production Build

To build for production:

```bash
npm run build   # Compiles TypeScript and bundles the client
npm start       # Runs the built server (serves client from dist/)
```

On Windows, use `npm.cmd run build` and `npm.cmd start` if PowerShell blocks `npm.ps1`.

The production server will serve the frontend on the same port as the API.

---

**Happy tracking!** 🎯
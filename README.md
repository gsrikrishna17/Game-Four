================================================================================
        CONNECT FOUR GAME - FULL STACK APPLICATION
================================================================================

A real-time multiplayer Connect Four game built with React frontend and Go 
backend, featuring WebSocket communication, bot gameplay, and persistent 
leaderboards.

================================================================================
TABLE OF CONTENTS
================================================================================

1. Prerequisites
2. Getting Started
   - Method 1: Clone Using VS Code Interface
   - Method 2: Clone Using Terminal
3. Project Setup
   - Backend Setup (Go)
   - Frontend Setup (React)
4. Running the Application
5. Project Structure
6. Features
7. Troubleshooting
8. Technologies Used
9. Additional Resources
10. Contributing
11. License

================================================================================
1. PREREQUISITES
================================================================================

Before cloning the repository, ensure you have the following installed:

- Git: Download from https://git-scm.com/downloads
- Visual Studio Code: Download from https://code.visualstudio.com/
- Node.js (v16 or higher): Download from https://nodejs.org/
- Go (v1.19 or higher): Download from https://go.dev/dl/

================================================================================
2. GETTING STARTED
================================================================================

--------------------------------------------------------------------------------
METHOD 1: CLONE USING VS CODE INTERFACE
--------------------------------------------------------------------------------

STEP 1: Open VS Code
Launch Visual Studio Code on your computer.

STEP 2: Access Clone Command
Press Ctrl + Shift + P (Windows/Linux) or Cmd + Shift + P (Mac) to open the 
Command Palette.

STEP 3: Clone Repository
1. Type "Git: Clone" and press Enter
2. Select "Clone from GitHub"
3. If prompted, sign in to your GitHub account
4. Paste your repository URL: 
   https://github.com/YOUR-USERNAME/connect-four-game
5. Choose a local folder where you want to save the project
6. Click "Select as Repository Destination"

STEP 4: Open Project
When prompted, click "Open" to open the cloned repository in VS Code.

--------------------------------------------------------------------------------
METHOD 2: CLONE USING TERMINAL
--------------------------------------------------------------------------------

STEP 1: Copy Repository URL
1. Go to your GitHub repository: 
   https://github.com/YOUR-USERNAME/connect-four-game
2. Click the "<> Code" button
3. Copy the HTTPS URL

STEP 2: Open Terminal in VS Code
1. Launch VS Code
2. Press Ctrl + ` (backtick) to open the integrated terminal

STEP 3: Navigate to Desired Directory

cd path/to/your/projects

STEP 4: Clone the Repository

git clone https://github.com/YOUR-USERNAME/connect-four-game

STEP 5: Open Project in VS Code

cd connect-four-game
code .

================================================================================
3. PROJECT SETUP
================================================================================

--------------------------------------------------------------------------------
BACKEND SETUP (GO)
--------------------------------------------------------------------------------

1. Navigate to the backend directory:

cd backend

2. Install Go dependencies:

go mod download

3. Initialize the database (SQLite):
   The database will be created automatically when you run the server for 
   the first time.



--------------------------------------------------------------------------------
FRONTEND SETUP (REACT)
--------------------------------------------------------------------------------

1. Open a new terminal in VS Code:
   Click "Terminal → New Terminal"

2. Navigate to the frontend directory:

cd frontend

3. Install Node.js dependencies:

npm install

4. Start the development server:

npm run dev

   The frontend will typically run on http://localhost:5173

5. Access the application:
   Open your browser and navigate to http://localhost:5173

================================================================================
4. RUNNING THE APPLICATION
================================================================================

--------------------------------------------------------------------------------
QUICK START COMMANDS
--------------------------------------------------------------------------------

git clone https://github.com/YOUR-USERNAME/connect-four-game
cd connect-four-game

cd backend
go mod download
go run main.go

cd frontend
npm install
npm run dev

--------------------------------------------------------------------------------
RUNNING BOTH SERVERS
--------------------------------------------------------------------------------

1. Start the backend (Terminal 1):

cd backend && go run main.go

2. Start the frontend (Terminal 2):

cd frontend && npm run dev

3. Open your browser to http://localhost:5173

================================================================================
5. PROJECT STRUCTURE
================================================================================

connect-four-game/
├── backend/
│   ├── main.go
│   ├── analytics.go
│   ├── go.mod
│   └── game.db
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BotGame.jsx
│   │   │   ├── LocalGame.jsx
│   │   │   ├── JoinGame.jsx
│   │   │   ├── GameBoard.jsx
│   │   │   ├── GameResults.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── PlayerNameInput.jsx
│   │   │   └── GameModeSelector.jsx
│   │   ├── styles/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md

================================================================================
6. FEATURES
================================================================================

 Local Multiplayer: Play against another player on the same device
 Bot Gameplay: Challenge an AI opponent with strategic moves
 Online Multiplayer: Real-time gameplay using WebSocket connections
Leaderboard System: Track wins, losses, and win rates
Persistent Storage: SQLite database for game history
Responsive Design: Works on desktop and mobile devices
Game Analytics: Kafka integration for event tracking (optional)

================================================================================
7. TROUBLESHOOTING
================================================================================

--------------------------------------------------------------------------------
GIT NOT RECOGNIZED
--------------------------------------------------------------------------------

If you see "git is not recognized," install Git from https://git-scm.com/ 
and restart VS Code.

--------------------------------------------------------------------------------
AUTHENTICATION ISSUES
--------------------------------------------------------------------------------

If GitHub asks for credentials:
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate a new token with "repo" permissions
3. Use the token as your password when prompted

--------------------------------------------------------------------------------
PORT ALREADY IN USE
--------------------------------------------------------------------------------

Backend (Port 8080):

lsof -i :8080
netstat -ano | findstr :8080

Frontend (Port 5173):
Change port in vite.config.js:

export default {
  server: {
    port: 3000
  }
}

--------------------------------------------------------------------------------
DATABASE ISSUES
--------------------------------------------------------------------------------

If the SQLite database gets corrupted:

cd backend
rm game.db
go run main.go

--------------------------------------------------------------------------------
DEPENDENCIES NOT INSTALLING
--------------------------------------------------------------------------------

Go modules:

cd backend
go clean -modcache
go mod download

NPM packages:

cd frontend
rm -rf node_modules package-lock.json
npm install

================================================================================
8. TECHNOLOGIES USED
================================================================================

BACKEND:
- Go (Golang) - Backend server
- Gorilla WebSocket - Real-time communication
- SQLite - Lightweight database
- Kafka (Optional) - Analytics and event streaming

FRONTEND:
- React - UI framework
- Vite - Build tool and dev server
- CSS Modules - Component styling
- WebSocket API - Real-time game updates

================================================================================
9. ADDITIONAL RESOURCES
================================================================================

- VS Code Git Documentation: 
  https://code.visualstudio.com/docs/sourcecontrol/intro-to-git

- GitHub Cloning Guide: 
  https://docs.github.com/articles/cloning-a-repository

- React Documentation: 
  https://react.dev/

- Go Documentation: 
  https://go.dev/doc/

- WebSocket Guide: 
  https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API

================================================================================
10. CONTRIBUTING
================================================================================

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: git checkout -b feature/AmazingFeature
3. Commit your changes: git commit -m 'Add some AmazingFeature'
4. Push to the branch: git push origin feature/AmazingFeature
5. Open a Pull Request

================================================================================
11. LICENSE
================================================================================

This project is licensed under the MIT License - see the LICENSE file for 
details.

================================================================================
NOTE
================================================================================

Replace "YOUR-USERNAME" with your actual GitHub username throughout this README.

================================================================================
HOW TO CREATE THIS FILE IN VS CODE
================================================================================

1. In VS Code, press Ctrl + N to create a new file
2. Press Ctrl + S to save it
3. Name it "README.txt" in your project root directory
4. Copy the entire content from above
5. Paste it into your README.txt file
6. Save again with Ctrl + S
7. Commit to GitHub:

git add README.txt
git commit -m "Add complete README"
git push origin main


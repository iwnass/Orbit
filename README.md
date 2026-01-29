# Orbit - Local-First Desktop App

A personal productivity and journaling desktop application built with Electron, React, and Tailwind CSS.

## Features

- **Today Page**: Live journal with auto-save and midnight rollover
- **Journal**: Browse past entries with grid view
- **Notes**: Organize notes in 4 categories with attachment support
- **Calendar**: Track job and class hours in month/week view
- **Financial Goals**: Monitor up to 3 savings goals with progress visualization
- **Auto-Updates**: Built-in version management
- **Discord RPC**: Optional Discord presence integration
- **100% Offline**: All data stored locally

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development

Run the app in development mode:

```bash
npm start
```

This will start the React development server and launch the Electron app.

### Building for Production

Build the app for Windows:

```bash
npm run build:win
```

The installer will be created in the `dist/` folder.

### Discord RPC (Optional)

To enable Discord Rich Presence:

1. Create a Discord application at https://discord.com/developers/applications
2. Copy your application's Client ID
3. Replace `YOUR_DISCORD_CLIENT_ID` in `electron/main.js` with your actual client ID

## Project Structure

```
orbit-app/
├── electron/           # Electron main process
│   ├── main.js        # Main process entry point
│   └── preload.js     # Preload script for IPC
├── src/               # React application
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   ├── services/      # Storage and other services
│   ├── utils/         # Helper functions
│   ├── App.js         # Main app component
│   ├── index.js       # React entry point
│   └── index.css      # Global styles
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Data Storage

All data is stored locally in Electron's userData directory:
- Windows: `%APPDATA%/orbit-app`
- macOS: `~/Library/Application Support/orbit-app`
- Linux: `~/.config/orbit-app`

Files stored:
- `today.json` - Current day's journal
- `journal.json` - Past journal entries
- `notes.json` - All notes by category
- `calendar.json` - Hours tracking data
- `goals.json` - Financial goals
- `attachments/` - Note attachments (images, PDFs)

## Technologies Used

- **Electron** - Desktop app framework
- **React 19.1** - UI library
- **Tailwind CSS 3.2** - Styling
- **date-fns** - Date utilities
- **electron-builder** - App packaging
- **electron-updater** - Auto-update functionality
- **discord-rpc** - Discord integration (optional)

## Scripts

- `npm start` - Run in development mode
- `npm run build` - Build React app for production
- `npm run build:electron` - Build the complete Electron app
- `npm run build:win` - Build Windows installer
- `npm run dist` - Build distributable package

## License

MIT

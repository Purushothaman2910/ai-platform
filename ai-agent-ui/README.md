# AI Agent Platform - Chat UI

A production-ready, visually stunning AI Agent Chat UI built with React 18, TypeScript, Material UI, and Framer Motion.

## Features

- **Modern Dark Theme**: Beautiful deep navy color scheme with vibrant indigo accents
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Chat**: Send messages and receive AI responses
- **Session Management**: Create, switch, and delete chat sessions
- **Markdown Support**: Render rich text, code blocks with syntax highlighting
- **Smooth Animations**: Polished micro-interactions powered by Framer Motion
- **TypeScript**: Fully typed codebase for better developer experience
- **React Query**: Efficient server state management with caching and retries

## Tech Stack

- React 18 with TypeScript
- Vite (build tool)
- Material UI (MUI) v5
- Axios for API calls
- React Query (TanStack Query) for state management
- Framer Motion for animations
- React Markdown for markdown rendering
- React Syntax Highlighter for code blocks

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx          # Main chat container
│   │   ├── MessageBubble.tsx       # Individual message component
│   │   ├── ChatInput.tsx           # Message input field
│   │   ├── TypingIndicator.tsx     # AI typing animation
│   │   ├── WelcomeScreen.tsx       # Empty state screen
│   │   └── MessageActions.tsx      # Copy, regenerate buttons
│   ├── layout/
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── Sidebar.tsx             # Session history sidebar
│   │   └── SettingsPanel.tsx       # Settings drawer
│   └── common/
│       ├── Avatar.tsx              # User/AI avatars
│       └── LoadingSpinner.tsx      # Loading states
├── pages/
│   └── ChatPage.tsx                # Main chat page
├── services/
│   ├── api.ts                      # Axios instance
│   ├── chat.service.ts             # Chat API methods
│   └── session.service.ts          # Session management
├── types/
│   └── chat.types.ts               # TypeScript interfaces
├── hooks/
│   ├── useChat.ts                  # Chat logic hook
│   └── useAutoScroll.ts            # Auto-scroll behavior
├── theme/
│   ├── theme.ts                    # MUI theme config
│   └── animations.ts               # Framer Motion variants
├── utils/
│   ├── formatters.ts               # Date/time formatters
│   └── storage.ts                  # LocalStorage helpers
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-agent-ui
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

| Variable            | Description  | Default                 |
| ------------------- | ------------ | ----------------------- |
| `VITE_API_BASE_URL` | API base URL | `http://localhost:3000` |

## API Integration

The UI expects the backend to have the following endpoint:

**POST** `/agent/ask`

Request:

```json
{
  "sessionId": "string",
  "question": "string"
}
```

Response:

```json
{
  "response": "string",
  "sessionId": "string",
  "toolCalls": [],
  "metadata": {
    "tokenCount": 100,
    "processingTime": 1500,
    "serverName": "Products API"
  }
}
```

## Design Highlights

### Color Palette

- Background Primary: `#0A0E27` (deep navy)
- Background Secondary: `#151B3B` (card/sidebar background)
- Accent Primary: `#6366F1` (vibrant indigo)
- Accent Secondary: `#8B5CF6` (purple)

### Typography

- Primary Font: Inter
- Code Font: JetBrains Mono

### Components

- Animated message bubbles with gradient backgrounds
- Typing indicator with bouncing dots
- Glassmorphism welcome screen
- Syntax-highlighted code blocks
- Responsive sidebar with session history

## License

MIT

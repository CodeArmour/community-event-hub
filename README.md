# Community Event Hub

A modern, responsive web application for discovering, creating, and managing community events. Built with Next.js, React, and Tailwind CSS, featuring an AI-powered assistant using Google's Gemini API.

![Community Event Hub Screenshot](/placeholder.svg?height=400&width=800&text=Community+Event+Hub+Screenshot)

## Features

- 🎭 **Event Discovery**: Browse upcoming, popular, and nearby community events
- 📅 **Event Management**: Create, edit, and manage events with detailed information
- 👤 **User Profiles**: Personalized user profiles with event preferences
- 🎫 **Event Registration**: Register for events and receive QR code tickets
- 📊 **Admin Dashboard**: Comprehensive analytics and event management for administrators
- 🤖 **AI Assistant**: Gemini-powered chat assistant for answering questions and providing recommendations
- 📱 **Responsive Design**: Fully responsive interface that works on all devices
- 🌓 **Dark Mode**: Toggle between light and dark themes

## Technologies Used

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **AI Integration**: Google Gemini API
- **Image Upload**: Cloudinary
- **Notifications**: Custom toast notifications with Sonner
- **Markdown Rendering**: React Markdown

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Vercel account (for deployment)
- Google Gemini API key
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/community-event-hub.git
   cd community-event-hub
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   GEMINI_API_KEY=your_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

\`\`\`
community-event-hub/
├── app/                  # Next.js app directory
│   ├── actions/          # Server actions
│   ├── admin/            # Admin dashboard pages
│   ├── auth/             # Authentication pages
│   ├── events/           # Event pages
│   ├── my-events/        # User's events page
│   ├── profile/          # User profile page
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ai-chat/          # AI chat components
│   ├── event/            # Event-related components
│   ├── ui/               # UI components (shadcn)
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and types
│   ├── mock-data.ts      # Mock data for development
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── ...
\`\`\`

## Key Components

### AI Chat

The application features an AI-powered chat assistant built with Google's Gemini API. The chat interface is fully responsive and provides contextual help to users based on their role:

- **Regular users** receive general information about events and platform features
- **Admin users** receive additional context-aware responses with data from the database

The AI chat components are located in `components/ai-chat/` and include:
- `ai-chat.tsx`: Main component that manages state and API calls
- `ai-chat-button.tsx`: Floating button to open the chat
- `ai-chat-dialog.tsx`: Responsive chat dialog
- `message-list.tsx`: Renders chat messages with Markdown support
- `message-input.tsx`: Input field for user messages

The server-side logic for the AI chat is in `app/actions/ai-chat.ts`.

### Event Management

The application provides comprehensive event management features:
- Create new events with detailed information
- Upload event images to Cloudinary
- Edit existing events
- View event analytics
- Generate QR code tickets for registered events

### User Interface

The UI is built with Tailwind CSS and shadcn/ui components, featuring:
- Responsive design that works on all devices
- Dark mode support
- Custom animations with Framer Motion
- Toast notifications for user feedback
- Form validation

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for the AI chat assistant |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Configure the environment variables
4. Deploy

## Future Enhancements

- **Authentication**: Implement NextAuth.js for user authentication
- **Database Integration**: Connect to a database like Supabase or MongoDB
- **Payment Processing**: Add payment processing for paid events
- **Email Notifications**: Send email notifications for event reminders
- **Social Sharing**: Add social media sharing functionality
- **Advanced Search**: Implement full-text search for events
- **Location Services**: Integrate maps and location-based features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Google Gemini API](https://ai.google.dev/)
- [Cloudinary](https://cloudinary.com/)
- [Lucide Icons](https://lucide.dev/)


# 🌐 Community Event Hub

![Next.js](https://img.shields.io/badge/Next.js-14-blue?logo=nextdotjs)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-%2338B2AC.svg?&style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/github/license/yourusername/community-event-hub)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

A modern, responsive web app for discovering, creating, and managing community events. Built with **Next.js**, **React**, and **Tailwind CSS**, featuring an AI-powered assistant using **Google Gemini API**.

![Community Event Hub Screenshot](/placeholder.svg?height=400&width=800&text=Community+Event+Hub+Screenshot)

---

## ✨ Features

- 🎭 **Event Discovery** – Browse upcoming, popular, and nearby events  
- 📅 **Event Management** – Create, edit, and manage events with rich details  
- 👤 **User Profiles** – Personalized user profiles with event preferences  
- 🎫 **Event Registration** – Register and receive QR code tickets  
- 📊 **Admin Dashboard** – Analytics and tools for administrators  
- 🤖 **AI Assistant** – Gemini-powered chat for guidance and recommendations  
- 📱 **Responsive Design** – Works across all screen sizes  
- 🌓 **Dark Mode** – Light/dark theme toggle  

---

## 🛠️ Tech Stack

| Category             | Tools / Frameworks                              |
|----------------------|--------------------------------------------------|
| **Frontend**         | Next.js 14, React, Tailwind CSS, shadcn/ui      |
| **Styling**          | Tailwind CSS, Framer Motion                     |
| **Icons**            | Lucide React                                    |
| **State Management** | React Hooks                                     |
| **AI Integration**   | Google Gemini API                               |
| **Image Uploads**    | Cloudinary                                      |
| **Notifications**    | Sonner                                          |
| **Markdown Support** | React Markdown                                  |

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js 18.x or later  
- npm or yarn  
- Vercel account  
- Google Gemini API key  
- Cloudinary account  

### ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/community-event-hub.git
cd community-event-hub

# Install dependencies
npm install
# or
yarn install
```

### 🔐 Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### ▶️ Run the App

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```bash
community-event-hub/
├── app/
│   ├── actions/        # Server actions
│   ├── admin/          # Admin dashboard
│   ├── auth/           # Authentication
│   ├── events/         # Event pages
│   ├── my-events/      # User events
│   ├── profile/        # User profile
│   ├── globals.css     # Global styles
│   └── layout.tsx      # Root layout
├── components/
│   ├── ai-chat/        # AI chat components
│   ├── event/          # Event UI components
│   ├── ui/             # Shared UI
├── hooks/              # Custom React hooks
├── lib/
│   ├── mock-data.ts    # Mock data
│   ├── types.ts        # Type definitions
│   └── utils.ts        # Utility functions
├── public/             # Static assets
└── ...
```

---

## 💬 AI Chat Assistant

A Gemini-powered chat assistant that provides:

- 🎟️ **Users** – General event questions and platform support  
- 🧠 **Admins** – Context-aware data and event management help  

🧩 Located in `components/ai-chat/`:

- `ai-chat.tsx` – Core logic and API calls  
- `ai-chat-button.tsx` – Floating toggle button  
- `ai-chat-dialog.tsx` – Responsive chat UI  
- `message-list.tsx` – Message rendering with Markdown  
- `message-input.tsx` – Input field with send action  

Server logic: `app/actions/ai-chat.ts`

---

## 🗂️ Event Management

- 🆕 Create new events  
- 🖼️ Upload event images (Cloudinary)  
- ✏️ Edit and delete events  
- 📈 Analytics dashboard for admins  
- 🎟️ QR code ticket generation for attendees  

---

## 🎨 User Interface

- 💠 Tailwind CSS + shadcn/ui  
- 📱 Fully responsive  
- 🌓 Dark mode support  
- 🌀 Framer Motion animations  
- ✅ Client-side validation  
- 🔔 Custom toasts with Sonner  

---

## 🔑 Environment Variables

| Variable                | Description                                      |
|-------------------------|--------------------------------------------------|
| `GEMINI_API_KEY`        | Google Gemini API key                            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                            |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                               |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                            |

---

## 🚀 Deployment

1. Push your code to GitHub  
2. Import into [Vercel](https://vercel.com)  
3. Set environment variables in Vercel dashboard  
4. Click **Deploy** 🚀  

---

## 🔮 Future Enhancements

- 🔐 NextAuth.js authentication  
- 🛢️ Database support (Supabase, MongoDB)  
- 💳 Payment integration  
- 📧 Email notifications  
- 🔗 Social sharing options  
- 🔍 Full-text search  
- 🗺️ Location services (maps, geolocation)  

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)  
- [React](https://reactjs.org/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [shadcn/ui](https://ui.shadcn.com/)  
- [Framer Motion](https://www.framer.com/motion/)  
- [Google Gemini API](https://ai.google.dev/)  
- [Cloudinary](https://cloudinary.com/)  
- [Lucide Icons](https://lucide.dev/)

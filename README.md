# AI TaskMate - Production-Ready Task Management

A modern, production-ready task management application with AI-powered features, offline support, and cloud synchronization.

![AI TaskMate](https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)

## ✨ Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks with priorities, due dates, and tags
- **Smart Filtering**: Filter tasks by Today, Upcoming, High Priority, and Completed status
- **Search**: Powerful search functionality across task titles, descriptions, and tags
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### AI-Powered Features
- **Smart Task Generation**: Natural language input to AI-generated task suggestions
- **Text Summarization**: AI-powered summarization of lengthy task descriptions
- **Fallback Support**: Graceful degradation when AI services are unavailable

### Offline & Sync
- **PWA Support**: Install as a native app with offline functionality
- **IndexedDB Storage**: Offline-first architecture with local data persistence
- **Cloud Sync**: Optional Supabase integration for cross-device synchronization
- **Background Sync**: Automatic synchronization when connectivity is restored

### Security & Performance
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: Server-side validation and sanitization
- **Secure API Keys**: Environment variable management for secrets
- **Caching**: Smart caching strategies for AI responses

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-taskmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Required for AI features
   AI_API_KEY=your_hugging_face_api_key
   
   # Optional for cloud sync
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### AI API Setup (Free)

1. **Hugging Face (Recommended)**
   - Visit [Hugging Face](https://huggingface.co)
   - Create a free account
   - Go to Settings → Access Tokens
   - Create a new token with 'Read' permissions
   - Add to `.env.local` as `AI_API_KEY`

2. **Alternative Providers**
   - OpenRouter: [OpenRouter.ai](https://openrouter.ai)
   - Together AI: [Together.xyz](https://together.xyz)
   - Update `AI_API_ENDPOINT` in environment variables

### Cloud Sync Setup (Optional)

1. **Supabase Setup**
   - Visit [Supabase.com](https://supabase.com)
   - Create a free account and new project
   - Go to Settings → API
   - Copy Project URL and anon public key
   - Add to environment variables

2. **Database Schema**
   ```sql
   create table tasks (
     id uuid primary key,
     title text not null,
     description text,
     due_date timestamptz,
     priority text not null default 'medium',
     tags text[],
     status text not null default 'pending',
     created_at timestamptz default now(),
     updated_at timestamptz default now(),
     user_id uuid references auth.users(id)
   );
   
   alter table tasks enable row level security;
   ```

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Date Handling**: date-fns
- **PWA**: Service Worker + Web App Manifest

### Backend
- **API Routes**: Next.js API routes (Edge/Serverless functions)
- **Rate Limiting**: Upstash Redis or in-memory fallback
- **Validation**: Custom input validation and sanitization
- **AI Integration**: Hugging Face Inference API

### Database
- **Local**: IndexedDB via idb library
- **Cloud**: Supabase PostgreSQL (optional)
- **Sync**: Background sync queue with retry logic

### DevOps
- **Testing**: Jest + React Testing Library + Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (recommended)
- **Monitoring**: Sentry integration ready

## 🧪 Testing

### Unit Tests
```bash
npm test
npm run test:watch
```

### E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Push code to GitHub
   - Connect repository in Vercel dashboard
   - Vercel auto-deploys on push to main branch

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Configure build settings if needed

3. **Custom Domain**
   - Add custom domain in Vercel dashboard
   - Configure DNS settings

### Alternative Deployments

**Netlify**
```bash
npm run build
# Deploy dist/ folder to Netlify
```

**Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance & Monitoring

### Lighthouse Scores Target
- Performance: >80
- Accessibility: >90
- Best Practices: >85
- SEO: >80
- PWA: >80

### Monitoring Setup

1. **Sentry (Error Tracking)**
   ```env
   SENTRY_DSN=your_sentry_dsn
   ```

2. **Vercel Analytics**
   - Automatically enabled on Vercel
   - View in Vercel dashboard

3. **Custom Metrics**
   - API response times
   - AI service availability
   - Sync queue status

## 🔒 Security

### Best Practices Implemented
- API keys stored in environment variables only
- Server-side input validation and sanitization
- Rate limiting on AI endpoints
- CORS configuration
- XSS protection via output sanitization
- Secure headers configuration

### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

## 📱 PWA Features

### Installation
- Install as native app from browser
- Offline functionality
- Background sync
- Push notifications (ready for implementation)

### Service Worker Features
- Cache-first strategy for app shell
- Network-first for API calls
- Background sync for task updates
- Push notification support

## 🛠️ Development

### Project Structure
```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── TaskCard.tsx      # Task display component
│   ├── TaskModal.tsx     # Task creation/editing
│   └── SmartTaskModal.tsx # AI suggestions
├── lib/                   # Utilities and services
│   ├── services/         # Business logic services
│   ├── offline/          # IndexedDB and sync
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript definitions
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   └── icons/           # App icons
├── e2e/                  # Playwright tests
└── __tests__/           # Jest unit tests
```

### Adding New Features

1. **Create Component**
   ```tsx
   // components/NewFeature.tsx
   export function NewFeature() {
     return <div>New Feature</div>;
   }
   ```

2. **Add Types**
   ```typescript
   // lib/types/newFeature.ts
   export interface NewFeature {
     id: string;
     name: string;
   }
   ```

3. **Create Service**
   ```typescript
   // lib/services/NewFeatureService.ts
   export class NewFeatureService {
     static async create(data: CreateNewFeatureInput) {
       // Implementation
     }
   }
   ```

4. **Add Tests**
   ```typescript
   // __tests__/NewFeature.test.tsx
   import { render, screen } from '@testing-library/react';
   import { NewFeature } from '../components/NewFeature';
   
   test('renders new feature', () => {
     render(<NewFeature />);
     expect(screen.getByText('New Feature')).toBeInTheDocument();
   });
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- TypeScript for all new code
- ESLint + Prettier for formatting
- Jest tests for utility functions
- Playwright tests for user flows
- Commit messages following conventional commits

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**AI suggestions not working:**
- Check AI_API_KEY is set correctly
- Verify Hugging Face API key has correct permissions
- Check network connectivity and API rate limits

**Offline sync issues:**
- Ensure service worker is registered
- Check browser compatibility (IndexedDB support)
- Verify Supabase configuration if using cloud sync

**Build failures:**
- Clear node_modules and package-lock.json
- Ensure Node.js version 18+
- Check environment variables are set

### Getting Help
- Open an issue on GitHub
- Check existing documentation
- Review error logs in browser console

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.#   A I _ t a s k m a t e  
 
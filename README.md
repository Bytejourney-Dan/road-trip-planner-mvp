# RoadTrip Planner MVP

An AI-powered road trip planner that generates personalized travel itineraries using ChatGPT and displays them on interactive Google Maps with comprehensive location editing capabilities.

## Features

### Core Planning
- **AI-Powered Itineraries**: ChatGPT generates day-by-day travel plans based on your preferences
- **Interactive Google Maps**: Visual route mapping with detailed attraction markers
- **Smart Route Optimization**: Routes automatically flow through attractions as waypoints
- **Comprehensive Place Data**: Rich attraction details from Google Places API

### Advanced Editing
- **Interactive Location Editing**: Click-to-add custom attractions anywhere on the map
- **Smart Day Assignment**: New attractions automatically assign to the closest day
- **Remove Attractions**: Click any marker to view details and delete option
- **Real-time Updates**: Routes and itineraries refresh instantly with changes
- **Edit Mode Toggle**: Clean interface switches between viewing and editing modes

### User Experience
- **Glassmorphism UI**: Modern, elegant interface with translucent design elements
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Loading States**: Visual feedback during AI processing and route calculation
- **Side-by-side Layout**: Trip form, map view, and itinerary in organized panels

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Wouter** for lightweight client-side routing
- **Shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **TanStack Query** for server state management
- **Vite** for fast development and production builds

### Backend
- **Node.js** with Express.js framework
- **TypeScript** with ES modules
- **Zod** for request/response validation
- **In-memory storage** with interface for future database integration

### AI & Maps Integration
- **OpenAI GPT-4o** for intelligent itinerary generation
- **Google Maps Platform**: Maps JavaScript API, Places API, Geocoding API
- **Google Routes API v2** for driving directions and timing

### Database (Future-Ready)
- **Drizzle ORM** configured for PostgreSQL
- **Neon Database** serverless PostgreSQL integration

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Google Maps API keys (separate for frontend and server)
- OpenAI API key

### Environment Variables
Create a `.env` file with the following variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_MAPS_FRONTEND_API_KEY=your_frontend_maps_key_here
GOOGLE_MAPS_SERVER_API_KEY=your_server_maps_key_here
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/road-trip-planner-mvp.git
cd road-trip-planner-mvp

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage Guide

### Creating a Trip
1. Fill out the trip planning form with:
   - Start and end locations
   - Travel dates
   - Trip duration
   - Interest categories (nature, culture, food, etc.)
   - Roundtrip preference

2. Click "Generate My Trip" to create your AI-powered itinerary

### Customizing Your Trip
1. Click "Edit Locations" button in the bottom-left corner
2. **Add Attractions**: Click anywhere on the map to add custom locations
3. **Remove Attractions**: Click existing markers and use the "Remove Attraction" button
4. **Save Changes**: Click "Update Itinerary" to apply your modifications

### Viewing Your Trip
- **Map View**: Interactive Google Maps with route visualization
- **Itinerary View**: Day-by-day breakdown with attraction details
- **Location Details**: Click markers for photos, ratings, and contact information

## Architecture

### Component Structure
```
client/src/
├── components/
│   ├── trip-form.tsx       # Trip planning form
│   ├── map-view.tsx        # Interactive Google Maps
│   ├── itinerary-view.tsx  # Day-by-day trip display
│   └── ui/                 # Reusable UI components
├── pages/
│   └── home.tsx            # Main application page
├── types/
│   └── trip.ts             # TypeScript type definitions
└── lib/
    └── utils.ts            # Utility functions

server/
├── services/
│   ├── openai.ts           # ChatGPT integration
│   └── maps.ts             # Google Maps APIs
├── routes.ts               # API endpoints
└── storage.ts              # Data storage interface

shared/
└── schema.ts               # Shared type definitions
```

### Data Flow
1. User submits trip form → Backend processes with ChatGPT
2. AI generates itinerary → Google Places API enriches locations
3. Frontend displays on interactive map → Routes calculated via Google Routes API
4. User edits locations → Real-time updates to map and itinerary

## API Integration

### OpenAI Integration
- Model: GPT-4o (latest model)
- Structured JSON responses for consistent itinerary format
- Custom prompts for travel planning domain
- Error handling for rate limits and authentication

### Google Maps Integration
- **Frontend Key**: Maps JavaScript API (domain-restricted)
- **Server Key**: Geocoding and Places API (API-restricted)
- Separate keys following Google's security best practices

## Contributing

### Development Workflow
```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Code Style
- TypeScript for all new code
- Functional components with hooks
- Utility-first CSS with Tailwind
- Comprehensive error handling

## Future Enhancements

- [ ] Database persistence with Drizzle ORM
- [ ] User authentication and saved trips
- [ ] Advanced filtering and search
- [ ] Collaborative trip planning
- [ ] Mobile app with React Native
- [ ] Weather integration
- [ ] Hotel and restaurant booking APIs

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please create a GitHub issue or contact the development team.

---

Built with ❤️ using modern web technologies and AI
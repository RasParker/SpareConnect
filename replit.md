# Parts Finder App

## Overview

A mobile/web application that connects spare parts buyers with dealers at Abossey Okai (Accra, Ghana). The app allows buyers to search for vehicle parts by make/model/year and part name, while dealers can list their inventory and manage their profiles. The system includes trust verification features with dealer badges and contact tracking for improved buyer-dealer connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Single-page application built with React 18 and TypeScript for type safety
- **Wouter**: Lightweight client-side routing library for navigation between pages
- **Vite**: Build tool and development server for fast development experience
- **shadcn/ui + Radix UI**: Component library built on Radix primitives with Tailwind CSS styling
- **TanStack Query**: Data fetching and caching library for API interactions
- **React Hook Form + Zod**: Form management with validation schema

### Backend Architecture
- **Express.js**: Node.js web framework handling API endpoints and middleware
- **TypeScript**: Type-safe server-side development with ESM modules
- **RESTful API**: Standard HTTP methods for CRUD operations on users, dealers, parts, and searches
- **File Upload**: Multer middleware for handling part and profile image uploads
- **In-memory Storage**: Mock storage layer implementing repository pattern for development

### Database Schema
- **Users Table**: Authentication and role management (buyer, dealer, admin)
- **Dealers Table**: Shop information, location, verification status, and ratings
- **Parts Table**: Inventory items with vehicle compatibility and availability status
- **Searches Table**: User search history for saved searches functionality
- **Reviews Table**: Dealer rating and feedback system
- **Contacts Table**: Tracking buyer-dealer interactions

### Authentication & Authorization
- **Role-based Access**: Three user roles (buyer, dealer, admin) with different permissions
- **Session Management**: Basic authentication with local storage for user persistence
- **Protected Routes**: Role-specific page access and API endpoint protection

### Key Features
- **Multi-criteria Search**: Search by vehicle make/model/year and part name
- **Image Upload**: Photo upload for parts with 5MB size limit and image type validation
- **Dealer Verification**: Admin approval system with verified dealer badges
- **Contact Tracking**: Record buyer-dealer interactions (WhatsApp, calls, profile views)
- **Responsive Design**: Mobile-first approach with bottom navigation and card-based UI
- **Real-time Updates**: Optimistic updates and cache invalidation with TanStack Query

### Data Flow
1. **Search Flow**: Users input search criteria → API queries parts table → Returns matching dealers with parts
2. **Dealer Management**: Dealers create profiles → Admin verification → Approved dealers appear in search results
3. **Contact Flow**: Buyers contact dealers → Contact logged → External communication via WhatsApp/phone

## External Dependencies

### Database & Storage
- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database (configured but using mock storage in development)
- **File System**: Local file storage for uploaded images in development

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Lucide React**: Icon library for consistent iconography
- **Fonts**: Google Fonts integration (DM Sans, Geist Mono, Architects Daughter)

### Development Tools
- **Replit Integration**: Development banner, cartographer, and error overlay plugins
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### External Services
- **WhatsApp API**: Deep linking for direct dealer communication
- **Phone Integration**: Tel: protocol for direct calling functionality
- **Image Processing**: Client-side image validation and preview generation

### Utilities & Helpers
- **class-variance-authority**: Type-safe utility for conditional CSS classes
- **date-fns**: Date manipulation and formatting library
- **nanoid**: URL-safe unique ID generation
- **clsx**: Conditional className utility for dynamic styling
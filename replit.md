# DocumentDigger AI - Document Ingestion & Classification System

## Overview

DocumentDigger AI is an intelligent document processing platform that automates document ingestion, classification, and routing through a 4-stage AI-powered pipeline. The system provides comprehensive dark/light theme support, individual stage-specific pages with dedicated AI functionality, and real-time processing capabilities with live status tracking, handling multiple file formats including PDFs, Word documents, and images up to 50MB.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Updates**: WebSocket connections for live document processing updates
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with session-based authentication
- **File Processing**: Multer for file upload handling with 50MB size limits
- **Real-time Communication**: WebSocket server for live updates

### Database Schema
- **Users Table**: Mandatory for Replit Auth (id, email, profile data)
- **Sessions Table**: Session storage for authentication
- **Documents Table**: Core document metadata (filename, size, type, status, classification)
- **Processing Stages Table**: Tracks 4-stage pipeline progress per document

## Key Components

### Document Processing Pipeline
1. **Ingestion Stage**: File upload with drag-and-drop interface, metadata extraction
2. **Extraction Stage**: AI-powered text and entity extraction
3. **Classification Stage**: Document type identification with confidence scoring
4. **Routing Stage**: Automated delivery to target systems

### File Upload System
- Drag-and-drop interface with visual feedback
- Support for PDF, Word documents (DOC/DOCX), and images (JPEG/PNG)
- File size validation (50MB maximum)
- MIME type validation for security
- Real-time upload progress tracking

### Real-time Dashboard
- Live document processing status updates via WebSocket
- Interactive document table with filtering and sorting
- Processing pipeline visualization with stage tracking
- Statistics dashboard showing success rates and processing metrics
- Manual override capabilities for reprocessing failed documents

### Authentication & Authorization
- Replit Auth integration with OpenID Connect
- Session-based authentication with PostgreSQL session storage
- Protected routes with automatic redirect to login
- User profile management with avatar support

## Data Flow

1. **Document Upload**: User drags/drops file → Frontend validates → API endpoint receives file
2. **Processing Initiation**: File saved to uploads directory → Database record created → Processing stages initialized
3. **Pipeline Execution**: Each stage updates database → WebSocket broadcasts progress → Frontend updates in real-time
4. **Completion**: Final classification stored → Document marked complete → User notified via toast/WebSocket

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling
- **drizzle-orm**: Type-safe database ORM with schema management
- **@radix-ui/***: Accessible UI primitives for component library
- **@tanstack/react-query**: Server state management and caching
- **multer**: File upload middleware for Express
- **ws**: WebSocket server implementation

### Development Tools
- **drizzle-kit**: Database schema migrations and management
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production server builds
- **@replit/vite-plugin-***: Replit-specific development tools

### Authentication Stack
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Production Build Process
1. **Frontend Build**: Vite bundles React app with optimizations
2. **Backend Build**: esbuild bundles Node.js server with external packages
3. **Database Migration**: Drizzle applies schema changes
4. **Static Assets**: Frontend builds to `dist/public` for Express serving

### Environment Configuration
- **Development**: Hot reloading with Vite middleware integration
- **Production**: Optimized bundles with static file serving
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Sessions**: Secure session management with SESSION_SECRET

### Replit Integration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale deployment target
- **Port Configuration**: Internal 5000 → External 80
- **File Storage**: Uploads directory for temporary file storage

## Recent Changes

- June 21, 2025: Created comprehensive document processing dashboard with 4-stage pipeline
- Added full application theme support (light/dark/system) with smooth transitions and persistent storage
- Rebranded application to "DocumentDigger AI" with updated branding throughout
- Created dedicated pages for each processing stage (/ingest, /extract, /classify, /route)
- Implemented individual AI-powered functionality for each stage with specialized features
- Added individual upload capabilities and stage-specific processing on each page
- Enhanced UI with comprehensive dark/light theme coverage and smooth animations
- Integrated stage-specific AI features and visual representations
- Added dedicated routing with proper navigation between stage pages

## User Preferences

Preferred communication style: Simple, everyday language.
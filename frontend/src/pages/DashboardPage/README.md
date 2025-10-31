# DashboardPage Component

## Overview
A modern, responsive dashboard page built with React, ShadCN UI components, and Tailwind CSS that displays CRM data from the backend API.

## Features
- **Real-time Data**: Fetches data from backend endpoints (`/api/leads`, `/api/contacts`, `/api/deals`, `/api/activities`)
- **Statistics Cards**: Shows total counts for leads, contacts, deals, and activities
- **Recent Data Tables**: Displays recent leads and deals in organized tables
- **Upcoming Activities**: Shows scheduled activities and tasks
- **Loading States**: Proper loading indicators while fetching data
- **Error Handling**: Toast notifications for errors
- **Responsive Design**: Works on desktop and mobile devices

## Backend Endpoints Used
- `GET /api/leads` - Fetch all leads
- `GET /api/contacts` - Fetch all contacts  
- `GET /api/deals` - Fetch all deals
- `GET /api/activities` - Fetch all activities
- `GET /api/activities/upcoming` - Fetch upcoming activities

## Components Used
- ShadCN UI: Card, Button, Badge, Table
- Heroicons: Various icons for visual elements
- Framer Motion: Smooth animations
- React Hot Toast: Error notifications

## Styling
- Consistent with project theme (light gradient background)
- Uses Tailwind CSS utility classes
- Responsive grid layouts
- Modern card-based design

## Usage
The dashboard is automatically accessible at `/dashboard` for authenticated users via the ProtectedRoute component.

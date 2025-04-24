# Brain App API Documentation

This document outlines all available API endpoints for the Brain App, including request/response formats and authentication requirements.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
  - [Sign Up](#sign-up)
  - [Sign In](#sign-in)
- [Content Management](#content-management)
  - [Get Content](#get-content)
  - [Create Content](#create-content)
- [Brain Sharing](#brain-sharing)
  - [Share Brain](#share-brain)
  - [Access Shared Brain](#access-shared-brain)

## Authentication

Most endpoints require JWT authentication. Include the token in the request header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## User Management

### Sign Up

Create a new user account.

**Endpoint:** `POST /api/v1/signup`

**Request:**

```json
{
  "username": "example_user",
  "password": "secure_password123"
}
```

**Response:**

```json
{
  "message": "User created successfully"
}
```

**Error Responses:**

```json
// 411 - User already exists
{
  "message": "User already exists or error occurred"
}
```

### Sign In

Authenticate and receive a JWT token.

**Endpoint:** `POST /api/v1/signin`

**Request:**

```json
{
  "username": "example_user",
  "password": "secure_password123"
}
```

**Response:**

```json
{
  "message": "Signin successful",
  "token": "your.jwt.token"
}
```

**Error Responses:**

```json
// 404 - User not found
{
  "message": "User not found"
}

// 401 - Invalid password
{
  "message": "Invalid password"
}

// 500 - Server error
{
  "message": "Something went wrong"
}
```

## Content Management

### Get Content

Retrieve all content items with populated tags and user information.

**Endpoint:** `GET /api/v1/content`

**Authentication:** Required

**Response:**

```json
[
  {
    "_id": "content_id",
    "title": "Example Content",
    "link": "https://example.com/resource",
    "tags": [
      {
        "_id": "tag_id",
        "name": "productivity"
      }
    ],
    "userID": {
      "_id": "user_id",
      "username": "example_user"
    }
  }
]
```

**Error Response:**

```json
// 500 - Server error
{
  "error": "Failed to fetch content"
}

// 401 - Authentication error
{
  "message": "Invalid token"
}
```

### Create Content

Add a new content item to your brain.

**Endpoint:** `POST /api/v1/content`

**Authentication:** Required

**Request:**

```json
{
  "title": "Interesting Article",
  "link": "https://example.com/article",
  "tags": ["tag_id_1", "tag_id_2"],
  "userId": "user_id"
}
```

**Response:**

```json
{
  "_id": "new_content_id",
  "title": "Interesting Article",
  "link": "https://example.com/article",
  "tags": ["tag_id_1", "tag_id_2"],
  "userID": "user_id"
}
```

**Error Response:**

```json
// 500 - Server error
{
  "error": "Failed to create content"
}

// 401 - Authentication error
{
  "message": "Invalid token"
}
```

## Brain Sharing

### Share Brain

Create a shareable link for your brain content.

**Endpoint:** `POST /api/v1/brain/share`

**Authentication:** Required

**Request:**

```json
{
  "share": true
}
```

**Response:**

```json
{
  "link": "link_to_open_brain"
}
```

**Error Response:**

```json
// 401 - Authentication error
{
  "message": "Invalid token"
}

// 500 - Server error
{
  "error": "Failed to create share link"
}
```

### Access Shared Brain

Access another user's shared brain content using their share link.

**Endpoint:** `GET /api/v1/brain/:shareLink`

**Authentication:** Not required

**Response:**

```json
{
  "username": "example_user",
  "content": [
    {
      "id": "content_id",
      "type": "document",
      "link": "https://example.com/document",
      "title": "Example Document",
      "tags": ["productivity", "research"]
    },
    {
      "id": "content_id_2",
      "type": "youtube",
      "link": "https://youtube.com/watch?v=example",
      "title": "Helpful Tutorial",
      "tags": ["tutorial", "coding"]
    }
  ]
}
```

**Error Response:**

```json
// 404 - Invalid share link
{
  "error": "Share link not found or sharing is disabled"
}

// 500 - Server error
{
  "error": "Failed to fetch shared content"
}
```

## Content Types

The Brain App supports several content types:

- `document`: Text-based documents
- `tweet`: Twitter/X posts
- `youtube`: YouTube videos
- `link`: General web links/URLs

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file:
   ```
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server: `npm run dev`

# Second Brain API

This is a RESTful API for a "Second Brain" application that allows users to save and organize content from various sources like documents, tweets, YouTube videos, and general links. Users can also share their content collection with others via shareable links.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Content Management](#content-management)
  - [Sharing](#sharing)
- [Testing Guide](#testing-guide)
- [Error Handling](#error-handling)
- [Database Schema](#database-schema)

## Features

- User authentication (signup, signin)
- Content management (create, read, delete)
- Content organization with tags
- Content sharing via unique links
- Content categorization by type (document, tweet, youtube, link)

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## API Endpoints

### Authentication

#### Sign Up

- **URL**: `POST /api/v1/signup`
- **Body**:
  ```json
  {
    "username": "harkirat",
    "password": "Password1!"
  }
  ```
- **Constraints**:
  - Username should be 3-10 letters
  - Password should be 8-20 characters, with at least one uppercase letter, one lowercase letter, one special character, and one number
- **Responses**:
  - `200 OK`: User created successfully
  - `411 Error`: Input validation failed
  - `403 Forbidden`: User already exists
  - `500 Error`: Server error

#### Sign In

- **URL**: `POST /api/v1/signin`
- **Body**:
  ```json
  {
    "username": "harkirat",
    "password": "Password1!"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "token": "jwt_token_here"
    }
    ```
  - `403 Forbidden`: Wrong username/password
  - `500 Error`: Internal server error

### Content Management

#### Create Content

- **URL**: `POST /api/v1/content`
- **Headers**: `Authorization: Bearer jwt_token`
- **Body**:
  ```json
  {
    "type": "document",
    "link": "https://example.com/article",
    "title": "Interesting Article",
    "tags": ["productivity", "tech"]
  }
  ```
- **Note**: Valid types are "document", "tweet", "youtube", "link"

#### Get All Content

- **URL**: `GET /api/v1/content`
- **Headers**: `Authorization: Bearer jwt_token`
- **Response**:
  ```json
  {
    "content": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "type": "document",
        "link": "https://example.com",
        "title": "Example Document",
        "tags": ["productivity", "tech"]
      }
    ]
  }
  ```

#### Delete Content

- **URL**: `DELETE /api/v1/content`
- **Headers**: `Authorization: Bearer jwt_token`
- **Body**:
  ```json
  {
    "contentId": "60d21b4667d0d8992e610c85"
  }
  ```
- **Responses**:
  - `200 OK`: Delete succeeded
  - `403 Forbidden`: Trying to delete a document you don't own
  - `404 Not Found`: Content not found

### Sharing

#### Create Share Link

- **URL**: `POST /api/v1/brain/share`
- **Headers**: `Authorization: Bearer jwt_token`
- **Body**:
  ```json
  {
    "share": true
  }
  ```
- **Response**:
  ```json
  {
    "link": "a1b2c3d4e5f6g7h8i9j0"
  }
  ```

#### Access Shared Content

- **URL**: `GET /api/v1/brain/:shareLink`
- **Response**:
  ```json
  {
    "username": "harkirat",
    "content": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "type": "document",
        "link": "https://example.com",
        "title": "Example Document",
        "tags": ["productivity", "tech"]
      }
    ]
  }
  ```
- **Error Responses**:
  - `404 Not Found`: If the share link is invalid or sharing is disabled

## Testing Guide

### Setting Up Postman

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new collection for Second Brain API
3. Set up environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (to be filled after sign-in)

### Testing Authentication

#### 1. Test User Registration

- **Method**: POST
- **URL**: `{{baseUrl}}/api/v1/signup`
- **Body** (raw JSON):

```json
{
  "username": "testuser",
  "password": "TestPass1!"
}
```

- Try variations with invalid passwords to test validation

#### 2. Test User Login

- **Method**: POST
- **URL**: `{{baseUrl}}/api/v1/signin`
- **Body** (raw JSON):

```json
{
  "username": "testuser",
  "password": "TestPass1!"
}
```

- Save the returned token to your environment variable `token`

### Testing Content Management

#### 3. Add Various Types of Content

- **Method**: POST
- **URL**: `{{baseUrl}}/api/v1/content`
- **Headers**: Authorization: Bearer {{token}}
- **Body for Document**:

```json
{
  "type": "document",
  "link": "https://example.com/whitepaper.pdf",
  "title": "Interesting Whitepaper",
  "tags": ["research", "technology"]
}
```

- **Body for YouTube**:

```json
{
  "type": "youtube",
  "link": "https://youtube.com/watch?v=abcdefg",
  "title": "How to Build a Second Brain",
  "tags": ["productivity", "learning"]
}
```

- **Body for Tweet**:

```json
{
  "type": "tweet",
  "link": "https://twitter.com/username/status/123456789",
  "title": "Insightful Tweet",
  "tags": ["thoughts", "inspiration"]
}
```

#### 4. Retrieve All Content

- **Method**: GET
- **URL**: `{{baseUrl}}/api/v1/content`
- **Headers**: Authorization: Bearer {{token}}
- Save one of the content IDs for the deletion test

#### 5. Delete Content

- **Method**: DELETE
- **URL**: `{{baseUrl}}/api/v1/content`
- **Headers**: Authorization: Bearer {{token}}
- **Body**:

```json
{
  "contentId": "paste_content_id_here"
}
```

### Testing Sharing Functionality

#### 6. Create Share Link

- **Method**: POST
- **URL**: `{{baseUrl}}/api/v1/brain/share`
- **Headers**: Authorization: Bearer {{token}}
- **Body**:

```json
{
  "share": true
}
```

- Save the returned share link

#### 7. Access Shared Brain

- **Method**: GET
- **URL**: `{{baseUrl}}/api/v1/brain/paste_share_link_here`
- No authentication needed - this simulates accessing as a visitor

#### 8. Disable Sharing

- **Method**: POST
- **URL**: `{{baseUrl}}/api/v1/brain/share`
- **Headers**: Authorization: Bearer {{token}}
- **Body**:

```json
{
  "share": false
}
```

#### 9. Verify Sharing is Disabled

- **Method**: GET
- **URL**: `{{baseUrl}}/api/v1/brain/paste_share_link_here`
- Should return 404 error

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `201`: Resource created successfully
- `400`: Bad request (client error)
- `401/403`: Authentication or authorization error
- `404`: Resource not found
- `411`: Validation error
- `500`: Server error

## Database Schema

The application uses four main collections:

### Users

- `username`: String (unique, 3-10 characters)
- `password`: String (hashed)
- `createdAt`: Date

### Content

- `title`: String
- `link`: String
- `type`: String (enum: "document", "tweet", "youtube", "link")
- `tags`: Array of references to Tags
- `userID`: Reference to User
- `createdAt`: Date

### Tags

- `name`: String (unique)

### Shares

- `userId`: Reference to User
- `shareLink`: String (unique)
- `isActive`: Boolean
- `createdAt`: Date

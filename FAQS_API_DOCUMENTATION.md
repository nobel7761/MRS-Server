# FAQs and FAQ Categories API Documentation

This document describes the API endpoints for managing FAQs and FAQ categories in the MRS Server.

## Authentication

### JWT Authentication

Most endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control

- **Public Endpoints**: FAQ categories and FAQs can be read without authentication
- **Protected Endpoints**: Creating, updating, and deleting FAQs require JWT authentication
- **Admin Endpoints**: FAQ category management requires JWT authentication

## FAQ Categories

### Base URL: `/faqs-category`

#### 1. Create FAQ Category

- **POST** `/faqs-category`
- **Description**: Create a new FAQ category
- **Authentication**: Required (JWT)
- **Body**:

```json
{
  "name": "General Questions",
  "order": 1
}
```

- **Required Fields**:
  - `name` (string): Category name (must be unique)
- **Optional Fields**:

  - `order` (number): Display order (default: 0)

- **Response**: Created FAQ category object

#### 2. Get All FAQ Categories

- **GET** `/faqs-category`
- **Description**: Retrieve all FAQ categories sorted by order
- **Authentication**: Not required
- **Response**: Array of FAQ category objects

#### 3. Get FAQ Category by ID

- **GET** `/faqs-category/:id`
- **Description**: Retrieve a specific FAQ category by ID
- **Authentication**: Not required
- **Response**: FAQ category object

#### 4. Update FAQ Category

- **PATCH** `/faqs-category/:id`
- **Description**: Update an existing FAQ category
- **Authentication**: Required (JWT)
- **Body** (partial):

```json
{
  "name": "Updated Category Name",
  "order": 2
}
```

- **Response**: Updated FAQ category object

#### 5. Delete FAQ Category

- **DELETE** `/faqs-category/:id`
- **Description**: Permanently delete an FAQ category
- **Authentication**: Required (JWT)
- **Response**: Success message

## FAQs

### Base URL: `/faqs`

#### 1. Create FAQ

- **POST** `/faqs`
- **Description**: Create a new FAQ under a specific category
- **Authentication**: Required (JWT)
- **Body**:

```json
{
  "categoryId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "question": "What services do you offer?",
  "answer": "We offer comprehensive solutions including...",
  "order": 1
}
```

- **Required Fields**:
  - `categoryId` (string): Valid MongoDB ObjectId of the category
  - `question` (string): FAQ question
  - `answer` (string): FAQ answer
- **Optional Fields**:

  - `order` (number): Display order (default: 0)

- **Response**: Created FAQ object with populated category

#### 2. Get All FAQs

- **GET** `/faqs`
- **Description**: Retrieve all FAQs sorted by order
- **Authentication**: Not required
- **Response**: Array of FAQ objects with populated categories

#### 3. Get FAQs by Category

- **GET** `/faqs?categoryId=64f8a1b2c3d4e5f6a7b8c9d0`
- **Description**: Retrieve all FAQs for a specific category
- **Authentication**: Not required
- **Query Parameters**:
  - `categoryId` (string): MongoDB ObjectId of the category
- **Response**: Array of FAQ objects with populated categories

#### 4. Get FAQs with Categories Structure

- **GET** `/faqs/with-categories`
- **Description**: Retrieve FAQs organized by categories
- **Authentication**: Not required
- **Response**:

```json
[
  {
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "General Questions",
      "order": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "faqs": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "question": "What services do you offer?",
        "answer": "We offer comprehensive solutions...",
        "categoryId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "General Questions",
          "order": 1,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        "order": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

#### 5. Get FAQ by ID

- **GET** `/faqs/:id`
- **Description**: Retrieve a specific FAQ by ID
- **Authentication**: Not required
- **Response**: FAQ object with populated category

#### 6. Update FAQ

- **PATCH** `/faqs/:id`
- **Description**: Update an existing FAQ
- **Authentication**: Required (JWT)
- **Body** (partial):

```json
{
  "question": "Updated question?",
  "answer": "Updated answer",
  "categoryId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "order": 2
}
```

- **Response**: Updated FAQ object with populated category

#### 7. Reorder FAQ

- **PATCH** `/faqs/:id/reorder`
- **Description**: Change the display order of an FAQ
- **Authentication**: Required (JWT)
- **Body**:

```json
{
  "order": 5
}
```

- **Required Fields**:
  - `order` (number): New display order
- **Response**: Updated FAQ object with populated category

#### 8. Delete FAQ

- **DELETE** `/faqs/:id`
- **Description**: Permanently delete an FAQ
- **Authentication**: Required (JWT)
- **Response**: Success message

## Data Models

### FAQ Category Schema

```typescript
{
  _id: ObjectId,
  name: string (required, unique),
  order: number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### FAQ Schema

```typescript
{
  _id: ObjectId,
  categoryId: ObjectId (required, ref: 'FaqsCategory'),
  question: string (required),
  answer: string (required),
  order: number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing or invalid JWT)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

Error response format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Validation Rules

### FAQ Category Validation

- `name`: Required string, must be unique
- `order`: Optional number, defaults to 0

### FAQ Validation

- `categoryId`: Required MongoDB ObjectId, must reference existing category
- `question`: Required string
- `answer`: Required string
- `order`: Optional number, defaults to 0

## Usage Examples

### Frontend Integration

1. **Display FAQ Categories**:

```javascript
const categories = await fetch('/faqs-category').then((r) => r.json());
```

2. **Display FAQs by Category**:

```javascript
const faqs = await fetch('/faqs?categoryId=categoryId').then((r) => r.json());
```

3. **Display FAQs with Categories Structure**:

```javascript
const faqsWithCategories = await fetch('/faqs/with-categories').then((r) =>
  r.json(),
);
```

4. **Admin: Create Category**:

```javascript
const newCategory = await fetch('/faqs-category', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'New Category',
    order: 1,
  }),
}).then((r) => r.json());
```

5. **Admin: Create FAQ**:

```javascript
const newFaq = await fetch('/faqs', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    categoryId: 'categoryId',
    question: 'New question?',
    answer: 'New answer',
    order: 1,
  }),
}).then((r) => r.json());
```

6. **Admin: Update FAQ**:

```javascript
const updatedFaq = await fetch('/faqs/faqId', {
  method: 'PATCH',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'Updated question?',
    answer: 'Updated answer',
  }),
}).then((r) => r.json());
```

7. **Admin: Reorder FAQ**:

```javascript
const reorderedFaq = await fetch('/faqs/faqId/reorder', {
  method: 'PATCH',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    order: 5,
  }),
}).then((r) => r.json());
```

8. **Admin: Delete FAQ**:

```javascript
await fetch('/faqs/faqId', {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer ' + token,
  },
});
```

## Notes

- All timestamps are in ISO 8601 format
- MongoDB ObjectIds are used for all ID fields
- Categories are automatically sorted by the `order` field
- FAQs within each category are automatically sorted by the `order` field
- The `/faqs/with-categories` endpoint provides a hierarchical structure useful for displaying FAQs grouped by category
- JWT tokens expire after 15 minutes and require refresh
- All protected endpoints require a valid JWT token in the Authorization header

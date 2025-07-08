# FAQ Categories API Documentation

This document provides comprehensive API documentation for managing FAQ categories in the MRS Server.

## Base URL

```
https://your-api-domain.com/faqs-category
```

## Authentication

All admin endpoints require JWT authentication with ADMIN role. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Data Model

### FAQ Category Schema

```typescript
{
  _id: string (MongoDB ObjectId),
  name: string (required, unique),
  order: number (default: 0),
  createdAt: string (ISO date),
  updatedAt: string (ISO date)
}
```

## API Endpoints

### 1. Create FAQ Category (Admin Only)

**Endpoint:** `POST /faqs-category`

**Description:** Create a new FAQ category with automatic order handling.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "General Questions",
  "order": 1
}
```

**Field Validation:**

- `name`: Required string, must be unique
- `order`: Optional number (default: 0)

**Success Response (201):**

```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "General Questions",
  "order": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions (not ADMIN)
- `409 Conflict`: Category name already exists

**Conflict Error Example:**

```json
{
  "statusCode": 409,
  "message": "Category with name \"General Questions\" already exists",
  "error": "Conflict"
}
```

### 2. Get All FAQ Categories

**Endpoint:** `GET /faqs-category`

**Description:** Retrieve all FAQ categories sorted by order.

**Headers:** None required

**Query Parameters:** None

**Success Response (200):**

```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "General Questions",
    "order": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Technical Support",
    "order": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Get FAQ Category by ID

**Endpoint:** `GET /faqs-category/:id`

**Description:** Retrieve a specific FAQ category by ID.

**Headers:** None required

**Path Parameters:**

- `id`: MongoDB ObjectId of the category

**Success Response (200):**

```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "General Questions",
  "order": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `404 Not Found`: Category not found

### 4. Update FAQ Category (Admin Only)

**Endpoint:** `PATCH /faqs-category/:id`

**Description:** Update an existing FAQ category with automatic order handling.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters:**

- `id`: MongoDB ObjectId of the category

**Request Body (partial):**

```json
{
  "name": "Updated Category Name",
  "order": 3
}
```

**Field Validation:**

- `name`: Optional string, must be unique if provided
- `order`: Optional number

**Success Response (200):**

```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Updated Category Name",
  "order": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions (not ADMIN)
- `404 Not Found`: Category not found
- `409 Conflict`: Category name already exists

### 5. Delete FAQ Category (Admin Only)

**Endpoint:** `DELETE /faqs-category/:id`

**Description:** Permanently delete an FAQ category and all its related FAQs (cascade delete).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**

- `id`: MongoDB ObjectId of the category

**Success Response (200):**

```json
{
  "message": "Category \"General Questions\" and 5 related FAQs deleted successfully",
  "deletedFaqsCount": 5
}
```

**Response Fields:**

- `message`: Descriptive message about what was deleted
- `deletedFaqsCount`: Number of FAQs that were deleted along with the category

**Error Responses:**

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions (not ADMIN)
- `404 Not Found`: Category not found

**Important Note:** This operation is irreversible. Deleting a category will permanently remove:

1. The category itself
2. All FAQs that belong to this category
3. All associated data cannot be recovered

## Order Handling Logic

The API automatically handles order conflicts:

1. **When creating a category with order N**: All existing categories with order >= N will have their order incremented by 1
2. **When updating a category order to N**: All other categories with order >= N will have their order incremented by 1

**Example:**

- Existing categories: A(order=1), B(order=2), C(order=3)
- Create new category with order=2
- Result: A(order=1), New(order=2), B(order=3), C(order=4)

## Cascade Delete Behavior

When deleting a category, the system automatically:

1. **Finds all FAQs** that belong to the category being deleted
2. **Deletes all related FAQs** first
3. **Deletes the category** itself
4. **Returns a summary** of what was deleted

This ensures data consistency and prevents orphaned FAQs in the system.

## Frontend Integration Examples

### JavaScript/TypeScript Examples

#### 1. Create Category

```typescript
interface CreateCategoryRequest {
  name: string;
  order?: number;
}

interface Category {
  _id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

async function createCategory(
  data: CreateCategoryRequest,
  token: string,
): Promise<Category> {
  const response = await fetch('/faqs-category', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create category');
  }

  return response.json();
}

// Usage
try {
  const newCategory = await createCategory(
    {
      name: 'New Category',
      order: 1,
    },
    jwtToken,
  );
  console.log('Category created:', newCategory);
} catch (error) {
  console.error('Error creating category:', error.message);
}
```

#### 2. Get All Categories

```typescript
async function getAllCategories(): Promise<Category[]> {
  const response = await fetch('/faqs-category');

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

// Usage
const categories = await getAllCategories();
console.log('Categories:', categories);
```

#### 3. Update Category

```typescript
async function updateCategory(
  id: string,
  data: Partial<CreateCategoryRequest>,
  token: string,
): Promise<Category> {
  const response = await fetch(`/faqs-category/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update category');
  }

  return response.json();
}

// Usage
const updatedCategory = await updateCategory(
  'categoryId',
  {
    name: 'Updated Name',
    order: 2,
  },
  jwtToken,
);
```

#### 4. Delete Category

```typescript
interface DeleteCategoryResponse {
  message: string;
  deletedFaqsCount: number;
}

async function deleteCategory(
  id: string,
  token: string,
): Promise<DeleteCategoryResponse> {
  const response = await fetch(`/faqs-category/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete category');
  }

  return response.json();
}

// Usage
try {
  const result = await deleteCategory('categoryId', jwtToken);
  console.log(result.message); // "Category \"General Questions\" and 5 related FAQs deleted successfully"
  console.log(`Deleted ${result.deletedFaqsCount} FAQs`); // "Deleted 5 FAQs"
} catch (error) {
  console.error('Error deleting category:', error.message);
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  createCategory: (data: CreateCategoryRequest) => Promise<void>;
  updateCategory: (
    id: string,
    data: Partial<CreateCategoryRequest>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<DeleteCategoryResponse>;
}

export function useCategories(token: string): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryRequest) => {
    try {
      const newCategory = await createCategory(data, token);
      setCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.order - b.order),
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (
    id: string,
    data: Partial<CreateCategoryRequest>,
  ) => {
    try {
      const updatedCategory = await updateCategory(id, data, token);
      setCategories((prev) =>
        prev
          .map((cat) => (cat._id === id ? updatedCategory : cat))
          .sort((a, b) => a.order - b.order),
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (
    id: string,
  ): Promise<DeleteCategoryResponse> => {
    try {
      const result = await deleteCategory(id, token);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
```

## Error Handling

Always handle these common error scenarios:

1. **409 Conflict**: Category name already exists
2. **401 Unauthorized**: Invalid or expired JWT token
3. **403 Forbidden**: User doesn't have ADMIN role
4. **404 Not Found**: Category ID doesn't exist
5. **400 Bad Request**: Invalid request data

## Testing

Use these test cases to verify your frontend integration:

1. Create category with duplicate name → Should return 409
2. Create category with order conflict → Should automatically reorder
3. Update category name to existing name → Should return 409
4. Update category order → Should automatically reorder others
5. Delete category with FAQs → Should delete category and all related FAQs
6. Delete category without FAQs → Should delete only the category
7. Delete non-existent category → Should return 404
8. Access admin endpoints without token → Should return 401
9. Access admin endpoints with non-admin token → Should return 403

## Important Considerations

### Data Integrity

- **Cascade Delete**: Deleting a category removes all its FAQs
- **No Recovery**: Deleted data cannot be recovered
- **Consistency**: Ensures no orphaned FAQs in the system

### User Experience

- **Confirmation**: Consider showing a confirmation dialog before deleting categories with FAQs
- **Feedback**: Display the number of FAQs that will be deleted
- **Warning**: Inform users about the irreversible nature of the operation

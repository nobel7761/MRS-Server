# Homepage FAQs API Documentation

## Overview

The FAQ system now supports marking specific FAQs to be displayed on the homepage. A maximum of 5 FAQs can be shown on the homepage at any time.

## New Field: `showHomePage`

### Schema Changes

- Added `showHomePage: boolean` field to the FAQ schema
- Default value: `false`
- When `true`, the FAQ will be displayed on the homepage

### Validation Rules

- Maximum 5 FAQs can have `showHomePage: true`
- Attempting to set more than 5 FAQs to show on homepage will result in a `BadRequestException`
- **Order uniqueness**: No two FAQs in the same category can have the same order number

## API Endpoints

### 1. Get Homepage FAQs

**GET** `/faqs/homepage`

Returns all FAQs that are marked to be shown on the homepage (maximum 5).

**Response:**

```json
[
  {
    "_id": "faq_id",
    "question": "What is this service?",
    "answer": "This is a helpful answer.",
    "categoryId": {
      "_id": "category_id",
      "name": "General"
    },
    "order": 1,
    "showHomePage": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. Create FAQ with Homepage Flag

**POST** `/faqs`

**Request Body:**

```json
{
  "categoryId": "category_id",
  "question": "New FAQ question?",
  "answer": "New FAQ answer.",
  "order": 1,
  "showHomePage": true
}
```

**Validation:**

- If `showHomePage: true` and 5 FAQs already have this flag, returns 400 Bad Request
- Error message: "Maximum 5 FAQs can be shown on the homepage. Please remove some existing homepage FAQs first."
- If `order` is provided and another FAQ in the same category already has that order, returns 400 Bad Request
- Error message: "An FAQ with order {order} already exists in this category. Please choose a different order number."

### 3. Update FAQ Homepage Flag

**PATCH** `/faqs/:id`

**Request Body:**

```json
{
  "showHomePage": true,
  "order": 2
}
```

**Validation:**

- Same validation as create endpoint
- Excludes the current FAQ from the count when updating
- Order uniqueness validation excludes the current FAQ being updated

### 4. Reorder FAQ

**PATCH** `/faqs/:id/reorder`

**Request Body:**

```json
{
  "order": 3
}
```

**Validation:**

- Order uniqueness validation within the same category
- Excludes the current FAQ from validation

## Usage Examples

### Setting a FAQ to show on homepage:

```bash
curl -X PATCH http://localhost:3000/faqs/faq_id \
  -H "Content-Type: application/json" \
  -d '{"showHomePage": true}'
```

### Creating FAQ with specific order:

```bash
curl -X POST http://localhost:3000/faqs \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "category_id",
    "question": "New question?",
    "answer": "New answer.",
    "order": 1,
    "showHomePage": false
  }'
```

### Getting homepage FAQs:

```bash
curl -X GET http://localhost:3000/faqs/homepage
```

## Implementation Details

### Service Methods Added:

- `findHomePageFaqs()`: Returns FAQs with `showHomePage: true`
- `validateHomePageLimit(excludeId?)`: Validates the 5-item limit
- `validateOrderUniqueness(categoryId, order, excludeId?)`: Validates order uniqueness within category

### Controller Endpoints Added:

- `GET /faqs/homepage`: Public endpoint to fetch homepage FAQs

### Schema Updates:

- Added `showHomePage` field to FAQ schema
- Updated DTOs to include the new field
- Updated response DTOs to include the new field

## Error Handling

The system will return appropriate error messages when:

1. Trying to set more than 5 FAQs to show on homepage
2. Trying to create/update FAQ with duplicate order number in the same category
3. Invalid FAQ ID provided
4. Invalid category ID provided
5. Missing required fields

## Order Management

### Order Uniqueness Rules:

- Each FAQ within a category must have a unique order number
- Order validation is performed during:
  - FAQ creation
  - FAQ updates (including category changes)
  - FAQ reordering
- When updating an FAQ, the current FAQ is excluded from order validation
- When changing an FAQ's category, order validation is performed against the new category

### Best Practices:

- Use sequential order numbers (1, 2, 3, ...) for better organization
- When reordering, ensure the new order doesn't conflict with existing FAQs
- Consider using the `reorder` endpoint for simple order changes

## Frontend Integration

To integrate with the frontend:

1. Call `GET /faqs/homepage` to fetch FAQs for homepage display
2. Use the returned data to render the FAQ section
3. The response is already sorted by `order` and `createdAt`
4. Maximum 5 items are returned, so no additional limiting is needed
5. Handle order conflicts gracefully by suggesting alternative order numbers

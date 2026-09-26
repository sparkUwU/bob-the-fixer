# SecureBank API Documentation

## GET /health

Authentication:
None

Purpose:
Check if the API is running and responsive.

Parameters:
None

Request Body:
None

Response:
```json
{
  "status": "ok"
}
```
Status Codes:
- `200 OK`: Successful

---

## POST /api/auth/register

Authentication:
None

Purpose:
Register a new user account.

Parameters:
None

Request Body:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 5,
    "username": "newuser",
    "email": "user@example.com",
    "role": "USER",
    "created_at": "2023-10-15T12:00:00Z"
  }
}
```
Status Codes:
- `201 Created`: Successfully registered
- `400 Bad Request`: Missing fields
- `409 Conflict`: Username or email already exists
- `500 Internal Server Error`: Server failure

---

## POST /api/auth/login

Authentication:
None

Purpose:
Authenticate a user and create a session.

Parameters:
None

Request Body:
```json
{
  "username": "Alice",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": 1,
    "username": "Alice",
    "email": "alice@securebank.local",
    "role": "USER",
    "created_at": "2023-10-15T12:00:00Z"
  }
}
```
Status Codes:
- `200 OK`: Successfully logged in (sets `session_token` HttpOnly cookie)
- `400 Bad Request`: Missing credentials
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server failure

---

## POST /api/auth/logout

Authentication:
None (Will clear cookie if present)

Purpose:
Invalidate the current session and clear cookies.

Parameters:
None

Request Body:
None

Response:
```json
{
  "message": "Logged out successfully"
}
```
Status Codes:
- `200 OK`: Successful logout

---

## GET /api/auth/me

Authentication:
Required

Purpose:
Retrieve the currently authenticated user's information.

Parameters:
None

Request Body:
None

Response:
```json
{
  "user": {
    "id": 1,
    "username": "Alice",
    "email": "alice@securebank.local",
    "role": "USER",
    "created_at": "2023-10-15T12:00:00Z"
  }
}
```
Status Codes:
- `200 OK`: User info retrieved
- `401 Unauthorized`: Session invalid or missing

---

## GET /api/accounts/me

Authentication:
Required

Purpose:
Retrieve the bank account details of the authenticated user.

Parameters:
None

Request Body:
None

Response:
```json
{
  "account": {
    "id": 1,
    "user_id": 1,
    "account_number": "ACC-1001",
    "balance": 12500,
    "account_type": "checking"
  }
}
```
Status Codes:
- `200 OK`: Account retrieved
- `401 Unauthorized`: Session invalid or missing
- `404 Not Found`: Account doesn't exist

---

## POST /api/transfers

Authentication:
Required

Purpose:
Transfer funds securely to another account.

Parameters:
None

Request Body:
```json
{
  "to_account_number": "ACC-1002",
  "amount": 150.00,
  "description": "Dinner"
}
```

Response:
```json
{
  "message": "Transfer successful"
}
```
Status Codes:
- `200 OK`: Transfer complete
- `400 Bad Request`: Invalid details, same account, or insufficient funds
- `401 Unauthorized`: Session invalid or missing
- `404 Not Found`: Destination account not found

---

## GET /api/transactions

Authentication:
Required

Purpose:
Retrieve the list of transactions associated with the user's account.

Parameters:
None

Request Body:
None

Response:
```json
{
  "transactions": [
    {
      "id": 1,
      "from_account_id": 1,
      "to_account_id": 2,
      "amount": 500,
      "description": "Rent payment",
      "status": "completed",
      "created_at": "2023-10-15T12:05:00Z"
    }
  ]
}
```
Status Codes:
- `200 OK`: List retrieved successfully
- `401 Unauthorized`: Session invalid or missing
- `404 Not Found`: User account missing

---

## GET /api/transactions/search

Authentication:
Required

Purpose:
Search user transactions by description keyword.

Parameters:
- `q` (query): Search keyword term

Request Body:
None

Response:
```json
{
  "transactions": [
    {
      "id": 1,
      "from_account_id": 1,
      "to_account_id": 2,
      "amount": 500,
      "description": "Rent payment",
      "status": "completed",
      "created_at": "2023-10-15T12:05:00Z"
    }
  ]
}
```
Status Codes:
- `200 OK`: Results returned successfully
- `401 Unauthorized`: Session invalid or missing

---

## GET /api/transactions/:id

Authentication:
Required (User must be part of the transaction)

Purpose:
Retrieve a specific transaction by its ID.

Parameters:
- `id` (path): The numerical identifier of the transaction

Request Body:
None

Response:
```json
{
  "transaction": {
    "id": 1,
    "from_account_id": 1,
    "to_account_id": 2,
    "amount": 500,
    "description": "Rent payment",
    "status": "completed",
    "created_at": "2023-10-15T12:05:00Z"
  }
}
```
Status Codes:
- `200 OK`: Retrieved successfully
- `400 Bad Request`: Invalid ID format
- `401 Unauthorized`: Session invalid or missing
- `403 Forbidden`: User was neither sender nor receiver of this transaction
- `404 Not Found`: Transaction not found

---

## GET /api/users/:id

Authentication:
Required (Must be the user themselves or an ADMIN)

Purpose:
Retrieve a user profile.

Parameters:
- `id` (path): The ID of the user

Request Body:
None

Response:
```json
{
  "user": {
    "id": 1,
    "username": "Alice",
    "email": "alice@securebank.local",
    "role": "USER",
    "created_at": "2023-10-15T12:00:00Z"
  }
}
```
Status Codes:
- `200 OK`: Retrieved successfully
- `401 Unauthorized`: Session invalid or missing
- `403 Forbidden`: Attempting to access another user's profile
- `404 Not Found`: User not found

---

## PUT /api/users/:id

Authentication:
Required (Must be the user themselves or an ADMIN)

Purpose:
Update a user's profile details.

Parameters:
- `id` (path): The ID of the user

Request Body:
```json
{
  "email": "new.email@securebank.local"
}
```

Response:
```json
{
  "message": "Profile updated successfully"
}
```
Status Codes:
- `200 OK`: Updated successfully
- `401 Unauthorized`: Session invalid or missing
- `403 Forbidden`: Attempting to modify another user's profile
- `500 Internal Server Error`: Server failure

---

## POST /api/profile/upload

Authentication:
Required

Purpose:
Upload a user profile avatar or file document.

Parameters:
- `file` (multipart form-data): The uploaded binary/text file payload

Request Body:
`multipart/form-data` with field `file`

Response:
```json
{
  "message": "File uploaded successfully",
  "filename": "123456789-avatar.png",
  "url": "/uploads/123456789-avatar.png"
}
```
Status Codes:
- `200 OK`: File uploaded successfully
- `400 Bad Request`: No file uploaded
- `401 Unauthorized`: Session invalid or missing

---

## GET /api/profile/uploads

Authentication:
Required

Purpose:
Retrieve list of previously uploaded files for the authenticated user.

Parameters:
None

Request Body:
None

Response:
```json
{
  "uploads": [
    {
      "id": 1,
      "user_id": 1,
      "filename": "123456789-avatar.png",
      "filepath": "/app/data/uploads/123456789-avatar.png",
      "uploaded_at": "2023-10-15T12:10:00Z"
    }
  ]
}
```
Status Codes:
- `200 OK`: List of uploads returned
- `401 Unauthorized`: Session invalid or missing

---

## GET /api/admin/users

Authentication:
Required (ADMIN role only)

Purpose:
Retrieve a list of all registered users across the system.

Parameters:
None

Request Body:
None

Response:
```json
{
  "users": [
    {
      "id": 1,
      "username": "Alice",
      "email": "alice@securebank.local",
      "role": "USER",
      "created_at": "2023-10-15T12:00:00Z"
    }
  ]
}
```
Status Codes:
- `200 OK`: Retrieved successfully
- `401 Unauthorized`: Session invalid or missing
- `403 Forbidden`: Normal user attempting admin access

---

## GET /api/admin/transactions

Authentication:
Required (ADMIN role only)

Purpose:
Retrieve a system-wide log of all transactions.

Parameters:
None

Request Body:
None

Response:
```json
{
  "transactions": [
    {
      "id": 1,
      "from_account_id": 1,
      "to_account_id": 2,
      "amount": 500,
      "description": "Rent payment",
      "status": "completed",
      "created_at": "2023-10-15T12:05:00Z"
    }
  ]
}
```
Status Codes:
- `200 OK`: Retrieved successfully
- `401 Unauthorized`: Session invalid or missing
- `403 Forbidden`: Normal user attempting admin access

# Auth

Auth module handles authentication and authorization for internal and client users.

- `lib/user.entity.ts` - Exposes the core `User` entity representing an authenticated Assembly user
- `lib/authenticate.ts` - Handles authentication of Assembly users via request or headers
- `lib/utils.ts` - Utility functions for authentication
# Restaurant API

Backend for a restaurant management system — menu, orders, table bookings, notifications and user accounts.

## Stack

NestJS · MongoDB (Mongoose) · JWT authentication with Passport · bcrypt

## Modules

| Module | What it does |
|---|---|
| `auth` | Registration, login, JWT issuing, role guards |
| `users` | Accounts and roles |
| `menu` | Dishes and categories |
| `orders` | Order placement and status transitions |
| `bookings` | Table reservations |
| `notifications` | Order and booking events |

## Running locally

```bash
npm install
npm run start:dev
```

Needs a MongoDB connection string and a JWT secret in `.env`.

## Notes

Authentication is JWT-based with role guards, so the same endpoints serve customers and staff with different permissions rather than duplicating routes per role.

The React client for this API lives in [restaurant-react](https://github.com/ziadsaid2/restaurant-react).

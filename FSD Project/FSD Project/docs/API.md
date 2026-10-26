# API reference

All routes are under `/api`. JSON errors use `{ "error": "..." }`. Browser requests use the `juniper.sid` HttpOnly session cookie.

## Public

- `GET /health` — API and database health.
- `GET /menu` — active menu items from MongoDB and the tax rate.
- `GET /restaurants` — restaurants currently available for table bookings.
- `GET /reservations/availability?restaurantId=juniper-table&date=YYYY-MM-DD&time=HH:mm&guests=N` — available active tables for the selected restaurant and a 90 minute interval.
- `POST /reservations` — create a pending table request for the selected restaurant, with optional menu items and special requests. A reservation is not confirmed until staff accepts it.
- `GET /reservations/:id/status?token=...` — tracking status using the one time booking token.
- `GET /payments/config` — configured payment options.
- `POST /orders` — create an order using current server menu prices. Requires a customer session.
- `POST /payments/webhook` — Razorpay signed webhook endpoint for `payment.captured`.
- `POST /contact` — save a contact message.

## Authentication and customer account

- `POST /auth/register` — create a customer account with name, email, Indian mobile number, and password.
- `POST /auth/login` / `POST /auth/logout` — customer session.
- `POST /auth/admin-login` — administrator or manager username session.
- `GET /auth/me` — current user.
- `POST /auth/change-password` — change the current password, including a manager's first sign in reset.
- `GET /addresses`, `POST /addresses` — list or add addresses owned by the signed in customer.
- `PUT /addresses/:id`, `DELETE /addresses/:id`, `PATCH /addresses/:id/default` — update, remove, or select the default address. Existing order address snapshots do not change.
- `GET /account/orders`, `GET /account/orders/:id` — current customer's order history and details.
- `POST /account/orders/:id/cancel` — cancel an order while it is awaiting payment or restaurant acceptance.
- `GET /account/reservations` — reservation history linked to the signed in customer.
- `POST /account/reservations/:id/cancel` — cancel an eligible upcoming reservation.
- `GET /notifications` — list the signed in user's latest in-app updates and unread count.
- `PATCH /notifications/:id/read`, `POST /notifications/read-all` — mark only the signed in user's notifications as read.
- `POST /orders/:id/verify-payment`, `POST /orders/:id/complete-demo-payment` — verify configured online checkout or explicitly labelled local demo checkout.
- `GET /orders/:id/status?token=...` — status polling using the one time order tracking token.

## Administrator

- `GET /admin/dashboard` — platform records for the current single restaurant installation.
- `GET /admin/managers`, `POST /admin/managers` — list managers or create an account with a one time temporary password.
- `PATCH /admin/managers/:id` — suspend/reactivate a manager.
- `POST /admin/managers/:id/reset-password` — issue a one time temporary password.
- `PATCH /admin/orders/:id/status`, `PATCH /admin/reservations/:id/status` — validated status changes.
- `GET /admin/audit-logs?limit=50` — latest staff actions with actor, record, and safe change metadata.

## Restaurant manager

Every manager route checks the signed in manager and assigned restaurant on the backend.

- `GET /manager/dashboard` — scoped order, reservation, and captured sales summary.
- `GET /manager/menu`, `POST /manager/menu`, `PATCH /manager/menu/:id`, `DELETE /manager/menu/:id` — manage menu items. Delete marks an item inactive so historical order lines remain intact.
- `GET /manager/tables`, `POST /manager/tables`, `PATCH /manager/tables/:id`, `DELETE /manager/tables/:id` — manage table capacity and availability. Delete disables a table with history preserved.
- `PATCH /manager/orders/:id/status` — update an order through valid lifecycle transitions.
- `PATCH /manager/reservations/:id/status` — accept, reject, seat, complete, or cancel an eligible reservation.

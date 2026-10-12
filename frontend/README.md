# CRN SA Equipment Loan & Hire: Frontend

Community groups use this React frontend to browse and request CRN SA equipment. CRN SA staff use it to approve requests, manage stock, take payments and run reports.

It currently runs on its own, with no backend. [`src/store/AppStore.tsx`](src/store/AppStore.tsx) stands in for the API and keeps its data in the browser's `localStorage`, so the whole journey can be demonstrated in one browser.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

Staff login for the demo: `admin@crnsa.org.au` / `admin123` (the login page has a "Fill in" button).
To restore the sample data, go to **Admin → Account → Reset demo data**.

## Demo script: the main journey

1. **Home**: click **Browse Equipment**.
2. **Catalogue**: open **Large Event Marquee**.
3. **Equipment details**: click a hire date, then a return date, on the calendar. It shows how many units are free for the whole range.
4. **Request to hire**: fill in the form. If you ask for more units than are free, you get an error.
5. **Review**: check the cost and deposit, agree to the conditions and click **Submit**. You get a request ID with status *Pending*.
6. **Staff login → Dashboard**: the new request appears under Pending requests. Click **Review**.
7. **Booking detail**: the stock check shows whether approving would double-book. Click **Approve**.
8. **Booking Status** (public) → **Pay now**: go through the booking summary and a test checkout. The booking becomes *Confirmed*.
9. The equipment's calendar now shows those dates as booked.

## Pages

| Public | Admin (`/admin`, login required) |
| --- | --- |
| `/` Home | `/admin` Dashboard |
| `/equipment` Catalogue (search, category, availability filters) | `/admin/equipment` Equipment list, add/edit, active/inactive |
| `/equipment/:id` Details + availability calendar | `/admin/calendar` Per-day availability for each item |
| `/request` Hire request (details → review → submit) | `/admin/bookings` All/Pending/Approved/Confirmed/Declined/Cancelled |
| `/status` Booking status lookup, cancellation | `/admin/bookings/:id` Approve / decline / cancel, refund deposit |
| `/pay/:id` Booking summary → checkout → confirmation | `/admin/rules` Cancellation, refund, deposit and booking conditions |
| `/about` How it works + booking conditions | `/admin/payments` Payment, deposit, outstanding and refund records |
| | `/admin/reports` Upcoming bookings, utilisation, outstanding deposits (CSV export) |

## Booking rules in the code

- **Booking lifecycle:** Pending → Approved (awaiting payment) → Confirmed (paid). A booking can also end as Declined or Cancelled.
- **Which bookings use up stock:** only Approved and Confirmed bookings. A pending request does not reserve anything.
- **Double-booking check:** a date range is available when, on its busiest day, enough units are left (units in stock minus units already booked). This is checked when a request is submitted, and checked again when staff approve it. The logic is in [`src/lib/availability.ts`](src/lib/availability.ts). The backend must run the same check, inside a transaction.
- **Cancellation refunds** follow the rules on `/admin/rules`. Cancelling more than *N* days before the hire date refunds X% of the hire fee; cancelling later refunds Y%. The deposit is always refunded in full, and a cancellation by staff refunds 100%.

## Replacing the mock pieces

| Mock now | Real system |
| --- | --- |
| `AppStore` actions (`submitRequest`, `approve`, `pay`, …) | Calls to the backend API. Page components only use `useStore()`, so they don't need to change. |
| Test checkout form in `Payment.tsx` | Create a Stripe Checkout Session on the server and redirect to it. A Stripe webhook marks the booking paid. |
| Hard-coded demo staff login | Real authentication with sessions or tokens. |
| Uploaded images saved as data URLs | Upload to file storage and save the URLs. |

## Testing

The frontend uses **Vitest** and **React Testing Library** for automated unit and component testing.

The current test suite contains **59 tests across 6 test files**, covering the main booking rules, form validation, equipment catalogue behaviour and admin booking actions.

### Run the tests

```bash
npm test
```

Runs the full test suite once.

```bash
npm run test:watch
```

Runs Vitest in watch mode and automatically re-runs relevant tests when files change.

For more detailed test output:

```bash
npm test -- --reporter=verbose
```

### Current result

- Test files: 6
- Tests: 59
- Passed: 59
- Failed: 0
- Production type-check/build: passing

### Test coverage

The current tests cover:

- Rental date calculations and date-range overlap
- Rental duration and pricing
- Equipment stock and availability
- Booking validation rules
- Cancellation refund calculations
- Equipment status, condition and image display
- Catalogue search and filtering
- Hire request form validation and submission flow
- Booking status handling
- Admin booking approval and decline actions
- Navigation and key button behaviour

### Test files

```text
src/lib/dates.test.ts
src/lib/availability.test.ts
src/components/ui.test.tsx
src/pages/public/Catalogue.test.tsx
src/pages/public/HireRequest.test.tsx
src/pages/admin/BookingDetail.test.tsx
```

Shared test setup and helpers are located in:

```text
src/test/setup.ts
src/test/renderWithStore.tsx
```

The tests use a small known set of data loaded into the application's localStorage-backed store so that each test runs independently from the others.

## Stack

Vite + React 19 + TypeScript, React Router 7, Tailwind CSS 4, lucide-react icons.

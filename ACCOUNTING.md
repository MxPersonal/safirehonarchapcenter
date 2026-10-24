# حسابداری فروشگاه سفیر هنر | Accounting setup

## What has been built
- Two admin groups: **مدیریت سایت** (categories, products, pages) and **مدیریت فروشگاه** (accounting, orders, quotes, carts, customers).
- Accounting includes period filters, charts for receipts, expenses and cash result, a cost breakdown, transaction history, manual entry form, corrections by reversing entries, and pending-order count.
- KPIs are **cash-based**, not formal accrual-basis profit. Never infer money received from `orders.status` or `orders.total_toman`. Only confirmed receipt entries count as realized collections. Refunds and expenses reduce net cash.
- Accounting APIs are protected by the same signed server-only admin cookie used for `/admin`, with a separate server-only Supabase secret client. Financial data are not sent to customer APIs.

## Deployment prerequisite

Run `supabase/migrations/20261024000100_finance_ledger.sql` in **the Supabase project connected to the actual Vercel deployment**, after the earlier commerce migration. This step was not automatically performed; only two unrelated inactive projects were visible in the connected Supabase account during development.

No new environment variables are necessary if existing `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) are configured in Vercel Production.

## Accounting methodology

| Indicator | Formula |
|---|---|
| فروش وصول‌شده | Posted `sale` entries minus same-type reversing entries |
| سایر دریافتی‌ها | Posted `other_income` minus reversals |
| مجموع خروجی هزینه | Posted `expense` minus reversals |
| استرداد وجه | Posted `refund` minus reversals |
| خالص جریان نقدی | sales + other income - expenses - refunds |
| زیان نقدی دوره | max(0, negative of net cash flow) |

All amounts in **toman**. Accountants need inventory valuation, invoices, taxes, receivables/payables, depreciation, double-entry journals and reconciliation for statutory profit. These are **not** implemented and must not be represented as complete financial accounting.

### Important
- Before recording `sale`, check that payment has actually been received. Orders in pending/awaiting-payment do **not** count.
- Record materials, printing costs and other outlays individually with their true transaction dates.
- Link a financial transaction to an order ID if applicable. Unlinked counter sales are allowed.
- Corrections use append-only reversal entries with reason; no silent deletion of financial history.
- A reversing transaction affects the date of correction (not the original month). Keep this in mind for reports.
- Financial reports are not payment-provider verified; they reflect manually entered transactions.
- For a larger volume than 30,000 entries in a selected window, the API explicitly rejects incomplete reporting rather than returning partial totals.

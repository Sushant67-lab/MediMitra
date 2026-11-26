# Payment & Dispensing Security Specification

## Data Invariants
1. No `dispensing_commands` document for a medicine purchase (non-`TEST-*` ID) can be created unless `paymentTransactionId` references an existing `payment_transactions` document whose `status == 'VERIFIED'`, `dispenseClaimed == false`, `expectedAmountInr == paymentAmount`, `medicineId == medicineId`, and `quantity == requestedQuantity`.
2. Creating a medicine `dispensing_commands` document MUST atomically flip `payment_transactions/{paymentTransactionId}.dispenseClaimed` to `true` and record `claimedCommandId` in the same Firestore transaction/batch (`getAfter()`), preventing a single payment from being replayed multiple times.
3. No unprivileged user or patient can create or update a `payment_transactions` document to `status == 'VERIFIED'`. Only an authenticated verified merchant/admin (`isPaymentAdmin()`) can set `status` to `'VERIFIED'` or `'REJECTED'`.
4. Every submitted 12-digit UPI UTR (`^[0-9]{12}$`) MUST atomically create an immutable `utr_claims/{utr}` document (`allow update, delete: if false`), preventing duplicate or recycled UTR fraud.
5. `dispensing_commands` status updates are restricted to state transitions from `'PENDING'` or `'PROCESSING'` and cannot mutate `paymentTransactionId`, `paymentAmount`, `medicineId`, or `requestedQuantity`.

## Dirty Dozen Payloads (Blocked with `PERMISSION_DENIED`)
1. Unpaid dispense creation: `dispensing_commands/CMD-1` without `paymentTransactionId`.
2. Fake client-declared paid status: `dispensing_commands/CMD-2` with `paymentStatus: 'VERIFIED'` referencing a non-existent `paymentTransactionId`.
3. Pending-UTR premature dispense: `dispensing_commands/CMD-3` referencing a `payment_transactions` doc still in `'PENDING_MERCHANT_VERIFICATION'`.
4. Payment replay attack: `dispensing_commands/CMD-4` referencing a `payment_transactions` doc with `dispenseClaimed == true`.
5. Non-atomic claim bypass: creating `dispensing_commands/CMD-5` without atomically setting `dispenseClaimed: true` on `payment_transactions`.
6. Amount tampering: paying ₹10 (`expectedAmountInr: 10`) and setting `paymentAmount: 100` or `requestedQuantity: 5` on `dispensing_commands`.
7. Direct self-verification on create: creating `payment_transactions/TX-1` with `status: 'VERIFIED'`.
8. Self-verification on update: updating `payment_transactions/TX-1` from `'PENDING_MERCHANT_VERIFICATION'` to `'VERIFIED'` without verified admin Google Auth.
9. Shadow field injection: updating `payment_transactions/TX-1` with extra fields (`isPaid: true` / `bypass: true`).
10. Duplicate UTR reuse: submitting a 12-digit UTR already present in `utr_claims/{utr}` or updating an existing `utr_claims` doc.
11. Invalid/dummy UTR format: submitting `'ABC123'` or `'12345'` instead of 12 numeric digits.
12. Post-completion command tampering: changing `medicineId` or `requestedQuantity` on an existing `dispensing_commands` doc.

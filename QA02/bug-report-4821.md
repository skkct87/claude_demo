# Bug Report — Export Timeout for Large Datasets

| Field            | Value                                                        |
|------------------|--------------------------------------------------------------|
| **Bug ID**       | BUG-4821                                                     |
| **Source**        | Support Ticket #4821                                         |
| **Date Filed**   | 2024-01-16                                                   |
| **Severity**     | Critical (blocks payroll workflow for Enterprise customer)    |
| **Priority**     | P1                                                           |
| **Component**    | Export Service — ExportWorker / Async Queue                  |
| **Version**      | v2.3 (shipped 2024-01-10)                                    |
| **Environment**  | Production                                                   |
| **Reporter**     | QA (escalated from Support Agent)                            |
| **Affected User**| j.morrison@acme-enterprise.com (Acme Enterprise, ~4,200 employees, Enterprise Plan) |

---

## Summary

CSV export fails with `ExportTimeoutException` for accounts with large datasets (~4,200+ rows). The async queue job timeout of 30,000 ms (introduced in v2.3) is insufficient for exports of this size. The customer sees an infinite loading spinner with no error message surfaced in the UI.

---

## Steps to Reproduce

1. Log in as a user belonging to an account with ~4,000+ employee records (e.g., Acme Enterprise with 4,247 rows).
2. Navigate to the **Reports** page.
3. Initiate a **CSV export**.
4. Observe the loading spinner.
5. Wait 30+ seconds.

**Expected Result:** CSV file is generated and downloaded successfully.

**Actual Result:** The export job times out after exactly 30,000 ms. The UI displays an indefinite loading spinner with no error message shown to the user. The export never completes.

---

## Evidence from Logs (`app-2024-01-16.log`)

The customer attempted the export **3 times** — all three failed identically:

| Attempt | Time (UTC)       | Job ID   | Rows Processed | Duration  | Result  |
|---------|------------------|----------|----------------|-----------|---------|
| 1       | 14:23:01         | exp-7824 | 2,891 / 4,247  | 30,001 ms | Timeout |
| 2       | 14:31:44         | exp-7826 | 2,884 / 4,247  | 30,001 ms | Timeout |
| 3       | 15:02:30         | exp-7829 | 2,902 / 4,247  | 30,001 ms | Timeout |

**All other exports on the same day completed successfully:**

| Time (UTC) | Job ID   | User                        | Type | Rows | Duration  | Result    |
|------------|----------|-----------------------------|------|------|-----------|-----------|
| 14:12:41   | exp-7821 | s.chen@beta-corp.com        | CSV  | 142  | 1,240 ms  | Success   |
| 14:14:09   | exp-7822 | admin@gammainc.io           | PDF  | 88   | 2,103 ms  | Success   |
| 14:17:55   | exp-7823 | finance@kappacorp.com       | CSV  | 319  | 3,871 ms  | Success   |
| 14:24:18   | exp-7825 | ops@lambdainc.co            | CSV  | 201  | 2,244 ms  | Success   |
| 14:39:02   | exp-7827 | admin@thetaco.com           | PDF  | 95   | 1,988 ms  | Success   |
| 14:45:17   | exp-7828 | it@epsilonltd.com           | CSV  | 512  | 5,891 ms  | Success   |

---

## Root Cause Analysis

### Processing rate estimation

From the timed-out jobs, the worker processes approximately **~96 rows/second** (avg ~2,892 rows in 30 s). At this rate, exporting 4,247 rows would require **~44 seconds**.

### The regression

| Version | Export Mechanism     | Timeout   | 4,247-row export |
|---------|----------------------|-----------|------------------|
| v2.2    | Synchronous          | 60,000 ms | Would succeed (~44 s < 60 s) |
| **v2.3**| **Async queue**      | **30,000 ms** | **Fails (~44 s > 30 s)** |

The v2.3 async queue migration (Jira: **TS-891**, merged 2024-01-08) introduced a **30-second job timeout**, halving the previous 60-second limit. This is the direct cause of the regression. Any account with more than ~2,900 rows will hit this timeout at current processing speeds.

### UI issue

The timeout error is returned to the client (`ExportController` logs: "Returning timeout error to client"), but the **UI does not surface it** — the spinner continues indefinitely. This is likely a gap in ticket **TS-908** (Export UI progress indicator), which may not handle the error/timeout state.

---

## Impact Assessment

- **Affected accounts:** Any account with more than ~2,900 employee records will be unable to export.  
- **Enterprise plan exposure:** Enterprise accounts can have up to 50,000 records — all large Enterprise accounts are potentially affected.  
- **Business impact for Acme:** Export is used for payroll processing. Inability to export blocks a critical business function.

---

## Recommended Fixes

1. **Immediate (hotfix):** Increase the async queue job timeout to at least 120,000 ms (120 s) to cover the maximum 50,000-row enterprise export with margin. Alternatively, make timeout proportional to row count.
2. **UI fix:** Handle the `ExportTimeoutException` response in the frontend — display a user-facing error message instead of an infinite spinner (review TS-908 implementation).
3. **Long-term:** Implement chunked/streaming export for large datasets so that a single job doesn't need to hold a worker for the full duration.

---

## Related Tickets

- **TS-891** — Export async queue migration (merged 2024-01-08)  
- **TS-902** — PDF rendering service integration (merged 2024-01-09)  
- **TS-908** — Export UI progress indicator (merged 2024-01-10)

---

## Attachments

- `support-ticket-4821.txt` — Original support ticket  
- `logs/app-2024-01-16.log` — Production export logs for 2024-01-16  
- `screenshot.png` (from ticket) — Blurry mobile screenshot showing infinite spinner on Reports page

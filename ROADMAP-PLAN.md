# Roadmap plan

The demo shows the 16 planned product epics, plus a separate **"Coming next"** layer covered by this plan. Each item carries a badge so nobody mistakes a preview for a shipped feature:

- **◆ Approved · before pilot:** approved and scheduled inside the current plan.
- **◇ Roadmap · after pilot:** planned after all 16 epics are finished and the pilot school is live.
- **? Exploring · not decided:** an idea being tested, not a commitment.

**Sources:** competitor and Tier 2/3 market research (27 Oct 2026) and owner decisions (28 Oct 2026).

## Decisions

- **28 Oct 2026:** add these items to the demo, and plan them in the real product after the current epics.
- **28 Oct 2026:** the first pilot is confirmed in **Bihar**, so **Hinglish moves into the current plan** as Story 3.14 (before the pilot). English stays the default language; each user can switch.

## When each item starts

1. **R2 Hinglish:** built as Story 3.14 in Epic 3 (merged by 31 Oct 2026). It's built before the attendance epic, so every later screen ships with Hinglish text.
2. **Everything else (R1, R3–R6):** after Epics 3–16 are finished and the pilot school is live. Each is then planned through BMAD: PRD, then architecture and UX if needed, then epics and stories, with review.

## Items, in priority order

| # | Feature | Why | Status | Shown in the demo at |
|---|---|---|---|---|
| R1 | **UDISE+ / APAAR government export** | Every recognised school must file UDISE+ every year, and APAAR IDs are now required. This is the biggest office pain point in Tier 2/3 schools. | ◇ Roadmap | School Admin → **Government reports** |
| R2 | **Hinglish (Hindi in English letters)** | The first pilot is in **Bihar**. Across North India most staff and parents read and type Hindi in Roman script on their phones ("Aaj ki haaziri", "Fees jama karein"), which is easier for them than formal Devanagari Hindi or English. | ✓ Built · before pilot (Story 3.14) | Language switch → **Hinglish (beta)** |
| R3 | **More regional languages** | Each school can switch on the language its staff and parents use. In order: **Marathi** (try it now: language switch → मराठी), then Bengali, Punjabi, Gujarati and Odia, plus Maithili or Bhojpuri if Bihar schools ask. Each language needs strings, templates and native-speaker review. | ◇ Roadmap | Language switch → **मराठी (roadmap)** |
| R4 | **Two-way WhatsApp for parents** | Parents can ask for leave, fees, results or homework without installing anything (no "app fatigue"). | ? Exploring | 💬 WhatsApp simulator → reply buttons **LEAVE / FEES / RESULT / HOMEWORK** |
| R5 | **Tally accounting export** | Most schools' CAs keep the books in Tally. Exporting receipts as vouchers avoids retyping. | ◇ Roadmap | Accountant → **Tally export** |
| R6 | **Certificates and transfer certificate** | TC, Bonafide and Character certificates are among the office's most frequent paper requests. | ◇ Roadmap | School Admin → **Certificates** |

### What each demo preview does

- **R1:** shows a readiness score across all students and a per-class table (PEN, masked APAAR ID, category, mother tongue) with missing-data flags. It downloads a **synthetic** UDISE+ or APAAR CSV with spreadsheet formulas neutralised.
- **R2:** switches menus, buttons and labels to Hinglish (for example "Haaziri lagayein", "Fees jama karein", "Chhutti manzoori").
- **R3:** switches menus and key labels to Marathi. Other languages appear in this plan only.
- **R4:** shows the parent's reply and an instant auto-reply. LEAVE creates a real absence note, so the teacher's roster shows it and the absence alert is skipped.
- **R5:** shows a voucher preview of today's receipts (Cash or Bank ledger against Fee Income) and downloads a **synthetic** Tally XML file.
- **R6:** you pick the type, section and student, see a letterhead preview, and issue a numbered certificate. A TC is blocked while the student still has fees due.

## Conditions to settle before building

1. **R1 (APAAR is Aadhaar-linked):** this is sensitive personal data under the DPDP Act. It needs a privacy and consent design (consent recorded per student, masked display, an audited export) and legal review. Exact UDISE+ and APAAR file formats must be checked against the current government templates.
2. **R2 Hinglish (approved):** one agreed word list (glossary) fixes spellings such as "haaziri", "chhutti" and "raseed". A Hindi-speaking reviewer from the pilot school checks every string before real use. A missing Hinglish text shows in English. WhatsApp has no Hinglish language code, so Hinglish parent messages need provider approval under Hindi; until then parents get English messages.
3. **R3 other languages:** each needs native-speaker review before real use, so turn one on only when a school actually needs it. Machine translation is acceptable only in demos.
4. **R4:** the current plan gives parents a portal with no chat. Two-way WhatsApp would also need consent, abuse controls and payment-provider rules, so it stays "Exploring" until pilot parents have been asked.
5. **R5:** export only closed days, so Tally never disagrees with the receipt book. Ledger mapping is set once per school.
6. **R6:** certificate numbers must be gapless and audited like receipts. A TC requires dues to be cleared and a "left school" record.

## Not on this roadmap

Transport and GPS, biometric or RFID attendance, payroll and PF/ESI/TDS, hostel, cafeteria, library, inventory, native Android/iOS apps and AI learning content. These are considered only if a pilot school names one as a reason it won't buy.

## Updating the demo when an item is approved or built

Change the item's `status` in `D.roadmapCatalog` (`assets/js/views-public.js`): `roadmap` or `exploring` → `prepilot` (approved) → `planned`, then later `built`. Move it into `D.featureCatalog` once it gets an epic number. The preview screens live in `assets/js/views-roadmap.js`.

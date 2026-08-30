# Restore Point Snapshot Documentation

**Date Created:** August 30, 2026
**Tag:** `v1.0.0-restore-point`
**Branch:** `restore-point-v1`
**Archive:** `backups/restore_point_v1_working_model.tar.gz`

---

## 📌 What is Captured in This Restore Point

1. **Full Mobile Viewport & 100dvh Dynamic Layout**:
   - `h-[100dvh]` root container with clean internal `overflow-y-auto` scrolling.
   - Pinned `flex-none` top navigation bar and dynamic horizontal step navigation banner.
   - `flex-none` bottom mobile navigation bar with `pb-[env(safe-area-inset-bottom)]` safe area support for iOS home indicators.
   - Elimination of clipping or sticky-header overlap bugs.

2. **Core Feature Set**:
   - **Step 1: Instant Affordability Calculator** (DTI, down payment, interest rates, OHCS grant eligibility).
   - **Step 2: Interactive Homebuyer Roadmap** (Milestone tracker, phase progress, checklist actions).
   - **Step 3: Homebuyer & Loan Officer Portal Dashboard** (Property scorecard comparisons, curated homes, document vault, mortgage lab).
   - **Step 4: AI Scenario Summary & Copilot** (Gemini-driven personalized affordability blueprints, curated recommendations, and action plans).
   - **Grant Finder & GeoSphere Partner Hub** (Local housing assistance grants, Realtor matching, and co-branded marketing tools).
   - **24/7 AI Lead Intake & Prequal Chatbot** (Automated consultation scheduling, scenario lead capture, and CRM syncing).

---

## 🔄 How to Restore to This Exact State

### Method 1: Git Restore (Fastest)
Run the following shell command to discard all subsequent changes and restore the working tree to this checkpoint:
```bash
git reset --hard v1.0.0-restore-point
```
Or switch to the restore branch:
```bash
git checkout restore-point-v1
```

### Method 2: Script / Node Restore
Run the built-in restore helper:
```bash
node scripts/restore_checkpoint.cjs
```

### Method 3: Direct Tar Archive Extraction
```bash
tar -xzf backups/restore_point_v1_working_model.tar.gz
```

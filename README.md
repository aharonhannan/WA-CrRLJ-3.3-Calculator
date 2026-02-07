# Washington State Speedy Trial Calculator (CrRLJ 3.3)

**Free online calculator for Washington State "Right to Speedy Trial" deadlines under CrRLJ 3.3**

Calculate trial deadlines for Washington's **courts of limited jurisdiction** (district and municipal courts). CrRLJ 3.3 mandates that trials occur within **60 days** for in-custody defendants and **90 days** for out-of-custody defendants from the date of arraignment. Violations typically result in **dismissal with prejudice**.

## Live Calculator

**[https://aharonhannan.github.io/WA-CrRLJ-3.3-Calculator/](https://aharonhannan.github.io/WA-CrRLJ-3.3-Calculator/)**

## Why Use This Calculator?
- **Handles complex scenarios** - Resets, exclusions, cure periods, and the 30-day minimum rule
- **Visual timeline** - See all critical dates at a glance
- **Free and open source** - MIT licensed

## Features

### Core Functionality
- **Accurate Date Calculations**: Implements all CrRLJ 3.3 requirements including:
  - 60-day limit for defendants detained in jail
  - 90-day limit for defendants not detained
  - Automatic extension to 90 days if defendant released before 60-day limit expires
  - Commencement date resets for various events
  - Excluded period tracking
  - 30-day minimum rule after excluded periods
  - Cure period calculations (14 days detained / 28 days not detained)

### User-Friendly Design
- **Clean Interface**: Professional, attorney-focused design
- **Visual Timeline**: Clear visualization of all critical dates
- **Detailed Breakdown**: Step-by-step calculation explanation
- **Real-time Validation**: Checks if scheduled trial dates are timely

### Additional Features
- **Print Support**: Print-optimized results for court filings
- **Export to Text**: Download calculations as text files
- **Local Storage**: Saves recent calculations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Build Tool**: Vite
- **Framework**: React 18 with hooks
- **Styling**: CSS (adapted from original)
- **Deployment**: GitHub Pages via `gh-pages` package

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

Creates a production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

This builds and deploys to GitHub Pages. The site will be available at:
`https://aharonhannan.github.io/WA-CrRLJ-3.3-Calculator/`

## How to Use

### Basic Steps

1. **Enter Basic Information**
   - Set the arraignment date (initial commencement date)
   - Select custody status (detained vs. not detained)
   - If applicable, enter release date

2. **Add Commencement Date Resets** (if any)
   - Click "+ Add Commencement Date Reset"
   - Select the type of reset event:
     - Waiver
     - Failure to Appear
     - New Trial/Mistrial
     - Appellate Review/Stay
     - Collateral Proceeding
     - Change of Venue
     - Disqualification of Counsel
     - Deferred Prosecution
   - Enter the new commencement date
   - Add notes if needed

3. **Add Excluded Periods** (if any)
   - Click "+ Add Excluded Period"
   - Select the exclusion type:
     - Competency Proceedings
     - Proceedings on Unrelated Charges
     - Continuance
     - Period Between Dismissal and Refiling
     - Disposition of Related Charge
     - Foreign or Federal Custody
     - Juvenile Proceedings
     - Unavoidable/Unforeseen Circumstances
     - Judge Disqualification
   - Enter start and end dates
   - Add notes if needed

4. **Enter Trial Information**
   - Enter the scheduled trial date (to check if timely)
   - Check "Apply Cure Period" if applicable

5. **Calculate**
   - Click "Calculate Trial Deadline"
   - Review the results, timeline, and calculation breakdown

### Understanding the Results

The calculator provides:
- **Status**: Whether the scheduled trial is timely or untimely
- **Trial Deadline**: The last allowable date for trial
- **Timeline**: Visual representation of all events and dates
- **Calculation Breakdown**: Detailed explanation of how the deadline was calculated

## Key CrRLJ 3.3 Rules Implemented

### Time Limits (Section b)
- **Detained in Jail**: 60 days from commencement date
- **Not Detained**: 90 days from commencement date
- **Released Before 60 Days**: Extends to 90 days
- **30-Day Minimum**: After any excluded period ends, trial must be at least 30 days later

### Commencement Date (Section c)
- **Initial**: Date of arraignment per CrRLJ 4.1
- **Resets**: Elapsed time resets to zero on specific events (latest reset applies if multiple)

### Excluded Periods (Section e)
The following periods don't count toward the time limit:
- Competency proceedings
- Proceedings on unrelated charges
- Continuances granted by the court
- Time between dismissal and refiling
- Disposition of related charges
- Foreign/federal custody
- Juvenile proceedings
- Unavoidable/unforeseen circumstances
- 5 days after judge disqualification

### Cure Period (Section g)
- **One-time extension**: Can be granted within 5 days after time limit expires
- **Duration**: 14 days (detained) or 28 days (not detained)
- **Requirement**: Finding that defendant won't be substantially prejudiced

## Important Disclaimers

**This calculator is provided for informational purposes only and does not constitute legal advice.**

- Always verify calculations manually
- Consult the current version of CrRLJ 3.3
- Review relevant case law and local court rules
- Court deadlines may vary based on specific circumstances not captured by this calculator
- When in doubt, consult with experienced counsel

## Rule Reference

Based on **CrRLJ 3.3 (Effective July 9, 2024)**

Key sections:
- (a) General Provisions
- (b) Time for Trial
- (c) Commencement Date
- (d) Trial Settings and Notice
- (e) Excluded Periods
- (f) Continuances
- (g) Cure Period
- (h) Dismissal With Prejudice

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Keywords

Washington speedy trial, CrRLJ 3.3, right to speedy trial, WA criminal defense, time for trial calculator, district court deadline, municipal court deadline, 60 day rule, 90 day rule, speedy trial dismissal, courts of limited jurisdiction, Washington criminal court rules

---

**Version**: 2.0 (React SPA)
**Author**: Aharon Hannan
**Last Updated**: February 2026
**Rule Version**: CrRLJ 3.3 (Effective July 9, 2024)

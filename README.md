# SumWealth - Flexible Investment Calculator

A modular, React-based investment calculator application that allows users to configure multiple calculator types (SIP, Step-Up SIP, SWP, Lumpsum) and view a summary of their investment plan.

## 🚀 Features

- **Multiple Calculator Types:** SIP, Step-Up SIP, SWP, Lumpsum.
- **Single-Step Configuration:** Add and configure calculators in a single modal flow.
- **Responsive Design:** Works seamlessly on mobile, tablet, and desktop.
- **Theming:** Auto-detects system theme (Light/Dark) with manual toggle.
- **Accessibility:** Keyboard navigable, screen reader friendly, and focus management.
- **No External Logic libraries:** Built with pure React Context, Reducers, and CSS Variables.

## 🛠 Tech Stack

- **React 18** (Functional Components, Hooks)
- **TypeScript**
- **Plain CSS** (CSS Variables, Flexbox/Grid)
- **Vite** (Build Tool)

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components (Header, Modal, Inputs)
├── context/          # Global State (Theme, Calculator List)
├── features/         # Feature-specific logic
│   └── calculators/  # Calculator forms, cards, and configuration logic
├── hooks/           # Custom hooks (if any specific ones added)
├── styles/           # Global styles and variables
├── types/            # TypeScript interfaces
└── utils/            # Validators and formatters
```

## 🏃‍♂️ Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

## 🏗 Architecture & Data Flow

1.  **State Management:**
    -   `CalculatorContext` uses `useReducer` to manage the array of configured calculators.
    -   Actions: `ADD_CALCULATOR`, `UPDATE_CALCULATOR`, `DELETE_CALCULATOR`.
    -   `ThemeContext` manages the `data-theme` attribute on the root element.

2.  **Adding a New Calculator Type:**
    1.  Add the type literal to `CalculatorType` in `src/types/index.ts`.
    2.  Define the configuration interface (e.g., `NewCalcConfig`) in `src/types/index.ts`.
    3.  Create a Form Component (e.g., `NewCalcForm.tsx`) in `src/features/calculators/forms/`.
    4.  Update `CalculatorConfigModal.tsx` to include the new type option and render the new form.
    5.  Update `CalculatorCard.tsx` to display the specific details for this new type.
    6.  Add validation logic in `src/utils/validation.ts` if needed.

## 🎨 Theming

The app uses CSS variables defined in `src/styles/variables.css`.
-   **Auto-detection:** On first load, checks system time (6 AM - 6 PM = Light).
-   **Toggle:** User can manually toggle themes, which overrides the auto-detection and saves to `localStorage`.

## 🧮 Calculation Logic

Currently, the "Calculate All" button aggregates the user input and prints the configuration JSON to the browser console. No financial projections are performed in this version.

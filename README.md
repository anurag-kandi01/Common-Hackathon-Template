# Hackathon — [DEV ARENA]

Welcome to the official hackathon repository by [GDG,UCE-OU].
This repository serves as the starting point for all participating teams.
Title of your repository shall be : team-(your team name)

## Team Details

After forking, fill in your team details below in your fork's README

- **Team Name:Graident Desserters
- **Team Lead:Kandi Anurag
- **Team Members:3
  - Member 1:Kandi Anurag  
  - Member 2:Zain Hassan 
  - Member 3:Abdullah Md Khan
    
---


## Getting Started

### Step 1 — Fork this Repository
- Click the **Fork** button at the top right of this page
- Select your GitHub account to fork into
- You will be redirected to your own copy of this repository

### Step 2 — Clone your Fork Locally
```bash
git clone https://github.com/your-username/hackathon-repo
cd hackathon-repo
```

### Step 3 — Start Building
- Work on your project inside your forked repository
- Commit and push your changes regularly

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## Problem Statement

8. FestFlow: AI Agent for Event and Fest Management
Problem Statement:
College fests and events are a coordination nightmare. Volunteers get assigned over WhatsApp,
last-minute dropouts throw entire schedules off, and coordinators spend more time firefighting
logistics than actually running the event. There is no single system that handles registrations,
volunteer coordination, and real-time rescheduling together.
---

## Submission Guidelines

- All code must be pushed to your **forked repository**
- Your repository must be **public**
- **Submission Deadline:** [17th april 3:59pm]

---

## 📋 Rules & Regulations

- Use of AI is permitted
- Use of open source libraries is permitted
- Plagiarism will lead to immediate disqualification
- The decision of the judges will be final

---
## Contact

For any queries, reach out to us at:
- **contact number** : [7981972900]

---

> Good luck to all !# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

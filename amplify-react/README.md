# Frontend App (React + Vite + TypeScript) with AWS Amplify

This is the frontend of our Amplify application, built using **React**, **Vite**, and **TypeScript**. It integrates with AWS Amplify backend (Gen 2).

## Prerequisites
Node.js (>=22.x)

## Configure AWS

### Configure credentials

```bash
aws configure
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://gitlab.asoft-python.com/huyen.cao/aws-training
git checkout develop
cd amplify-react
```

### 2. Install dependencies

```bash
npm install
```

### 3. Pull Amplify outputs

```bash
BRANCH=branch-name APP_ID=backend-app-id npm run generate:outputs
```

### 4. Run the app locally

```bash
npm run dev
```
App will be available at:

```bash
http://localhost:5173
```

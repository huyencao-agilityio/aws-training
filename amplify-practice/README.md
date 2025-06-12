
# Amplify Practice
This is a practice repository for building a application on AWS for the E-commerce app using Amplify.

## Requirement
[Amplify Practice](https://docs.google.com/document/d/10QVZvOZAORbfFw8TETMcolMFSFCySDyrxutMxuP8HOA/edit?tab=t.0)

## Prerequisites
Node.js (>=22.x)

## Project Structure
```bash
amplify-practice/
|
├── amplify/
│   ├── auth/
│   ├── data/
├── package-lock.json
├── package.json/
├── README.md
```

## Setup

### 1. Clone the repository:
```bash
git clone https://gitlab.asoft-python.com/huyen.cao/aws-training
git checkout develop
cd amplify-practice
```

### 2. Install dependencies:
```bash
npm install
```

## Configure AWS

### 1. Configure credentials
```bash
aws configure
```

## Deploy

1. Deploy to AWS:
```bash
npx amplify push
```

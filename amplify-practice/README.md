
# Amplify Practice
This is a practice repository for building a application on AWS for the E-commerce app using Amplify.

## Requirement
[Amplify Practice](https://docs.google.com/document/d/10QVZvOZAORbfFw8TETMcolMFSFCySDyrxutMxuP8HOA/edit?tab=t.0)

## High-level architecture
[High-level architecture](https://drive.google.com/file/d/1PDY3yXcNrZXB10akZI4_znp_z6RyWWNr/view?usp=sharing)

## Prerequisites
Node.js (>=22.x)

## Project Structure

```bash
amplify-practice/
|
├── amplify/
│   ├── auth/
│   ├── custom/
│   ├── data/
│   ├── functions/
│   ├── jobs/
│   ├── shared/
│   ├── storage/
│   ├── utils/
├── bin/
│   ├── set-secrets.sh
├── layers/
│   ├── nodejs/
├── prisma/
│   ├── schema.prisma
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

## Environment variables

| Field | Type | Description | Default | Note |
|:------|:-----|:------------|:-----|:--|
| DATABASE_URL | String | Connection string used to connect to the database for migration| N/A ||
| GOOGLE_CLIENT_ID | String | The Google client id | N/A ||
| GOOGLE_CLIENT_SECRET | String | The Google client secret | N/A ||
| FACEBOOK_CLIENT_ID | String | The Facebook client id | N/A ||
| FACEBOOK_CLIENT_SECRET | String | The Facebook client secret | N/A ||

## Development

To run the Amplify Gen 2 backend sandbox:

1. Add secret value

```bash
npm run set-secrets
```

2. Generate prisma

```bash
npm run prisma:generate
```

3. Install lib for layer

```bash
npm run layer:install
```

4. Build layer

```bash
npm run layer:build
```

5. Build resolver

```bash
npm run resolver:build
```

6. Deploy amplify to Sandbox

```bash
npm run amplify:sandbox
```

7. Migration Database

```bash
npm run prisma:migrate
```

## Deploy

1. Deploy to AWS Amplify Hosting:

```bash
npm run amplify:push
```

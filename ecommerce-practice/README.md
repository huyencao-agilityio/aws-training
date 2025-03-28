# E-commerce practice

## Overview
This guide provides instructions on setting up the environment, running database migrations for practice

## Environment Setup

Create a `.env` file in the root of the project following `env.sample`

## Install Dependencies

To install the necessary dependencies, run the following command in the project directory:

`npm install`

## Run Migrations

To apply database migrations, run the following command:

`
npm run migration:generate
npm run migration:run
`

This will execute all migrations in the migrations directory and update the database schema accordingly.

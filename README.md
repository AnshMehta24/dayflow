# Dayflow - Human Resource Management System

## Problem Statement

The purpose of this document is to define the functional and non-functional requirements
of a Human Resource Management System HRMS . The system aims to digitize and streamline core HR operations such as employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows for admins and HR officers.

## Team

Our team consists of 4 members:
- Ansh Mehta
- Vivek Panchal
- Sahil Isamliya
- Akshay Patel

## Tech Stack

- **Next.js** - React framework for production
- **Prisma** - Next-generation ORM for database management
- **MySQL** - Relational database management system
- **TypeScript** - Typed superset of JavaScript

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up your database and configure Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and Prisma client
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations

## Features

- Employee attendance tracking
- Leave request management
- Employee profile management
- HR dashboard
- User authentication

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Prisma Documentation](https://www.prisma.io/docs) - learn about Prisma ORM
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - learn about TypeScript

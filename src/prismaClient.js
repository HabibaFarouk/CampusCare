// src/prismaClient.js
const { PrismaClient } = require('@prisma/client'); // [cite: 138]

// Initialize a single instance of PrismaClient
const prisma = new PrismaClient();

// Export the instance to be used in controllers
module.exports = prisma; 
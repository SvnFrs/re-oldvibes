#!/bin/bash

echo "🌱 Starting data seeding..."
echo

cd "$(dirname "$0")/.."

echo "Running quick seed script..."
bun run seed:quick

echo
echo "✅ Seeding completed!"

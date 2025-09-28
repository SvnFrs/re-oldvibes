@echo off
echo 🌱 Starting data seeding...
echo.

cd /d "%~dp0.."

echo Running quick seed script...
bun run seed:quick

echo.
echo ✅ Seeding completed!
pause

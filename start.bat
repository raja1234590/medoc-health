@echo off
echo ========================================
echo OPD Token Allocation System - MERN
echo ========================================
echo.

echo Checking if MongoDB is running...
mongosh --eval "db.version()" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: MongoDB might not be running!
    echo.
    echo To start MongoDB:
    echo   net start MongoDB
    echo.
    echo OR use MongoDB Atlas (cloud):
    echo   1. Go to: https://www.mongodb.com/cloud/atlas
    echo   2. Create free cluster
    echo   3. Update .env file with connection string
    echo.
    pause
)

echo.
echo Starting backend server...
echo.
npm run dev

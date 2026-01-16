@echo off
echo Installing dependencies...
call npm install

echo Building project...
call npm run build

echo Starting local development server...
npm run dev

pause

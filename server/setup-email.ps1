# PowerShell script to help setup email credentials

Write-Host "=== ExpenseScope Email Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file in the server directory first."
    exit 1
}

Write-Host "Current .env file contents (email section):" -ForegroundColor Yellow
Get-Content .env | Select-String -Pattern "EMAIL|FRONTEND"

Write-Host ""
Write-Host "=== Instructions ===" -ForegroundColor Cyan
Write-Host "1. Get Gmail App Password:" -ForegroundColor White
Write-Host "   - Go to: https://myaccount.google.com/apppasswords" -ForegroundColor Gray
Write-Host "   - Select 'Mail' and generate password" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Edit server/.env file and replace:" -ForegroundColor White
Write-Host "   EMAIL_USER=your-email@gmail.com" -ForegroundColor Gray
Write-Host "   EMAIL_PASSWORD=your-app-password-here" -ForegroundColor Gray
Write-Host ""
Write-Host "3. With your actual values:" -ForegroundColor White
Write-Host "   EMAIL_USER=actual-email@gmail.com" -ForegroundColor Green
Write-Host "   EMAIL_PASSWORD=16-character-app-password" -ForegroundColor Green
Write-Host ""
Write-Host "4. After saving .env, restart your server" -ForegroundColor White
Write-Host ""
Write-Host "5. Test with: node test-email.js" -ForegroundColor White


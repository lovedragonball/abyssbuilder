# Generate Metadata for DW Image Screenshots
# อ่านรูปทั้งหมดด้วย Gemini Vision API แล้วสร้าง metadata

Write-Host "🚀 Starting metadata generation..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if GEMINI_API_KEY is set
if (-not $env:GEMINI_API_KEY) {
    Write-Host "⚠️  GEMINI_API_KEY not set in environment" -ForegroundColor Yellow
    Write-Host "   Using default API key from script..." -ForegroundColor Gray
}

# Run the Node.js script
Write-Host "📸 Processing all images in DW Image folder..." -ForegroundColor Cyan
Write-Host "   This may take a while (2 seconds per image to avoid rate limiting)" -ForegroundColor Gray
Write-Host ""

node scripts/generate-metadata.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Metadata generation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Review the metadata in 'DW Image/metadata.json'"
    Write-Host "  2. Test OCR with metadata matching enabled"
    Write-Host "  3. Check if confidence scores improved"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Metadata generation failed!" -ForegroundColor Red
    Write-Host "   Check the error messages above" -ForegroundColor Gray
    Write-Host ""
}

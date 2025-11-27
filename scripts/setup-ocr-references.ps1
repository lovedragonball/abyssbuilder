# Setup OCR Reference Images
# คัดลอกรูปตัวอย่างที่ดีที่สุดจาก DW Image folder ไปยัง public/ocr-references/

Write-Host "🖼️  Setting up OCR Reference Images..." -ForegroundColor Cyan

# สร้าง directories
$publicDir = "public\ocr-references"
$characterDir = "$publicDir\character"
$weaponDir = "$publicDir\weapon"

New-Item -ItemType Directory -Force -Path $characterDir | Out-Null
New-Item -ItemType Directory -Force -Path $weaponDir | Out-Null

Write-Host "✅ Created directories" -ForegroundColor Green

# คัดลอกรูปตัวอย่าง character (เลือก 2 รูปที่ดีที่สุด)
# คุณสามารถเปลี่ยนเลขได้ตามรูปที่ต้องการ
$characterExamples = @(
    "DW Image\character\Screenshot_1.png",
    "DW Image\character\Screenshot_2.png"
)

$index = 1
foreach ($source in $characterExamples) {
    if (Test-Path $source) {
        $dest = "$characterDir\example-$index.png"
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "  ✓ Copied character example $index" -ForegroundColor Gray
        $index++
    } else {
        Write-Host "  ⚠️  Not found: $source" -ForegroundColor Yellow
    }
}

# คัดลอกรูปตัวอย่าง weapon (เลือก 2 รูปที่ดีที่สุด)
$weaponExamples = @(
    "DW Image\Melee wepaon\Screenshot_1.png",
    "DW Image\Range weapon\Screenshot_1.png"
)

$index = 1
foreach ($source in $weaponExamples) {
    if (Test-Path $source) {
        $dest = "$weaponDir\example-$index.png"
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "  ✓ Copied weapon example $index" -ForegroundColor Gray
        $index++
    } else {
        Write-Host "  ⚠️  Not found: $source" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ OCR Reference Images setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the copied images in public/ocr-references/"
Write-Host "  2. Replace with better examples if needed"
Write-Host "  3. Test OCR with reference images enabled"
Write-Host ""

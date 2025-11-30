Write-Host "=== PDF.js 3.11.174 CDN Verification ===" -ForegroundColor Cyan
Write-Host ""

$urls = @(
    @{
        Name = "Main Library"
        Url = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    },
    @{
        Name = "Worker File"
        Url = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
    }
)

$allOk = $true

foreach ($item in $urls) {
    Write-Host "$($item.Name): " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $item.Url -Method Head -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "OK (200)" -ForegroundColor Green
            Write-Host "  URL: $($item.Url)" -ForegroundColor Gray
            Write-Host "  Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Gray
            Write-Host "  Content-Length: $($response.Headers.'Content-Length') bytes" -ForegroundColor Gray
        } else {
            Write-Host "UNEXPECTED STATUS ($($response.StatusCode))" -ForegroundColor Yellow
            $allOk = $false
        }
    } catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $allOk = $false
    }
    Write-Host ""
}

if ($allOk) {
    Write-Host "=== All CDN URLs are accessible ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== Some CDN URLs failed ===" -ForegroundColor Red
    exit 1
}

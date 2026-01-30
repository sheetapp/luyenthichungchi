$path = 'e:\2026\Webapp\15. Sát hach CCHN\luyenthichungchixd\app\(main)\thi-thu\[examId]\page.tsx'
$lines = Get-Content -LiteralPath $path
$line = $lines[1213]
$bytes = [System.Text.Encoding]::UTF8.GetBytes($line)
$hex = $bytes | ForEach-Object { '{0:X2}' -f $_ }
Write-Output "Line 1214 content: [$line]"
Write-Output "Hex: $hex"

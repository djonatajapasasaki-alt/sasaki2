
$body = '{"admin_key":"SasakiAdmin2025","email":"djonata.japasasaki@gmail.com","senha":"Sasaki2025"}'
$r = Invoke-RestMethod -Uri 'https://sasaki-indol.vercel.app/admin/criar-usuario' -Method POST -ContentType 'application/json' -Body $body
$r | ConvertTo-Json

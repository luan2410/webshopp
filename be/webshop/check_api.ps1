$baseUrl = "http://localhost:8080/webshop/api"

function Test-Endpoint {
    param($url, $method="GET", $body=$null)
    Write-Host "Testing $url ($method)..." -NoNewline
    try {
        if ($body) {
            $response = Invoke-WebRequest -Uri $url -Method $method -Body $body -ContentType "application/json" -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing
        }
        Write-Host " OK (Status: $($response.StatusCode))" -ForegroundColor Green
        if ($response.Content.Length -lt 500) {
            Write-Host "Response: $($response.Content)"
        } else {
             Write-Host "Response (truncated): $($response.Content.Substring(0, 500))..."
        }
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host $_.Exception.Message
        if ($_.Exception.Response) {
             Write-Host "Status: $($_.Exception.Response.StatusCode)"
        }
    }
}

Test-Endpoint "$baseUrl/hello-world"
Test-Endpoint "$baseUrl/products"
Test-Endpoint "$baseUrl/categories"
Test-Endpoint "$baseUrl/auth/login" "POST" '{"username":"admin", "password":"wrongpassword"}'

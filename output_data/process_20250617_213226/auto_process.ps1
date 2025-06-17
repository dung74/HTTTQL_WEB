
try {
    [System.Reflection.Assembly]::LoadWithPartialName("Microsoft.AnalysisServices") | Out-Null
    $server = New-Object Microsoft.AnalysisServices.Server
    $server.Connect("Data Source=localhost")
    $db = $server.Databases.FindByName("17_6_2026_HTTTQL")
    if ($db -eq $null) {
        Write-Output "ERROR: Database 17_6_2026_HTTTQL not found"
        exit 1
    }
    $db.Process([Microsoft.AnalysisServices.ProcessType]::ProcessFull)
    Write-Output "SUCCESS: Database processed successfully"
    $server.Disconnect()
    exit 0
}
catch {
    Write-Output "ERROR: $_"
    exit 1
}

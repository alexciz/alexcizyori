# Helper script to stage, commit, and push portfolio updates to GitHub
param(
    [string]$Message = "Update portfolio content and viewer enhancements"
)

$gitCmd = "C:\Users\Alexy\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
if (-not (Test-Path $gitCmd)) {
    $gitCmd = "git"
}

$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $repoDir

& $gitCmd add -A
$status = & $gitCmd status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Output "No changes to commit. Working tree is clean."
} else {
    & $gitCmd commit -m "$Message"
    & $gitCmd push origin main
    Write-Output "Successfully pushed latest changes to GitHub."
}

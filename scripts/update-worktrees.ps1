# update-worktrees.ps1
# Rebases every git worktree onto origin/main with one command.
# Run from the repo root: .\scripts\update-worktrees.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = (git rev-parse --show-toplevel).Trim()

Write-Host ""
Write-Host "=== Casino Platform Worktree Updater ===" -ForegroundColor Cyan
Write-Host "Repo root: $RepoRoot"
Write-Host ""

Write-Host "Fetching origin..." -ForegroundColor Cyan
git -C $RepoRoot fetch origin
Write-Host ""

# Parse `git worktree list --porcelain` into structured objects.
$rawLines  = git -C $RepoRoot worktree list --porcelain
$worktrees = @()
$current   = $null

foreach ($line in $rawLines) {
    if ($line -match '^worktree (.+)$') {
        if ($null -ne $current) { $worktrees += $current }
        $current = @{ Path = $Matches[1].Trim(); Branch = ''; HEAD = '' }
    } elseif ($line -match '^branch (.+)$') {
        $current.Branch = $Matches[1].Trim()
    } elseif ($line -match '^HEAD ([0-9a-f]+)$') {
        $current.HEAD = $Matches[1].Trim()
    }
}
if ($null -ne $current) { $worktrees += $current }

$failed = $false

foreach ($wt in $worktrees) {
    $path = $wt.Path
    Write-Host "--- $path" -ForegroundColor Cyan

    # Check for uncommitted changes (staged or unstaged).
    $status = git -C $path status --porcelain 2>&1
    if ($status) {
        Write-Host "  [SKIP] Uncommitted changes — skipping." -ForegroundColor Yellow
        Write-Host ""
        continue
    }

    Write-Host "  Rebasing onto origin/main..." -ForegroundColor Green
    $rebaseOutput = git -C $path rebase origin/main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [FAIL] Rebase failed:" -ForegroundColor Red
        Write-Host $rebaseOutput -ForegroundColor Red
        Write-Host ""
        Write-Host "Stopping. Fix the conflict in: $path" -ForegroundColor Red
        Write-Host "Then run: git -C `"$path`" rebase --continue" -ForegroundColor Yellow
        $failed = $true
        break
    }

    Write-Host "  [OK]" -ForegroundColor Green
    Write-Host ""
}

if (-not $failed) {
    Write-Host "=== All worktrees updated. ===" -ForegroundColor Cyan
}

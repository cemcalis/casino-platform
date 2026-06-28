# update-worktrees.ps1
# Rebases every git worktree onto origin/main with one command.
# Run from repo root: .\scripts\update-worktrees.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = (git rev-parse --show-toplevel).Trim()

Write-Host ""
Write-Host "=== Updating git worktrees ===" -ForegroundColor Cyan
Write-Host "Repo root: $RepoRoot"
Write-Host ""

Write-Host "[FETCH] origin" -ForegroundColor Cyan
git -C $RepoRoot fetch origin

$worktrees = git -C $RepoRoot worktree list --porcelain |
  Where-Object { $_ -like 'worktree *' } |
  ForEach-Object { $_.Replace('worktree ', '') }

foreach ($wt in $worktrees) {
  Write-Host ""
  Write-Host "=== Worktree: $wt ===" -ForegroundColor Cyan

  if (-not (Test-Path $wt)) {
    Write-Host "[SKIP] Path does not exist: $wt" -ForegroundColor Yellow
    continue
  }

  $status = git -C $wt status --porcelain
  if ($status) {
    Write-Host "[SKIP] Dirty worktree, commit or stash first: $wt" -ForegroundColor Yellow
    $status
    continue
  }

  Write-Host "[FETCH] origin" -ForegroundColor Cyan
  git -C $wt fetch origin

  Write-Host "[REBASE] origin/main" -ForegroundColor Cyan
  git -C $wt rebase origin/main

  if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Rebase failed at: $wt" -ForegroundColor Red
    exit 1
  }

  Write-Host "[OK] Updated: $wt" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== All clean worktrees updated ===" -ForegroundColor Cyan

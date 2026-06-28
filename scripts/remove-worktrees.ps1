# remove-worktrees.ps1
# Safely removes all agent worktrees created by create-worktrees.ps1.
# Run from the repo root: .\scripts\remove-worktrees.ps1
#
# A worktree is skipped if it has uncommitted changes, protecting in-progress work.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = (git rev-parse --show-toplevel).Trim()
$ParentDir = Split-Path $RepoRoot -Parent

$Worktrees = @(
    @{ Dir = 'casino-platform-orchestrator'; Branch = 'feature/orchestrator' },
    @{ Dir = 'casino-platform-backend';      Branch = 'feature/backend-agent' },
    @{ Dir = 'casino-platform-frontend';     Branch = 'feature/frontend-agent' },
    @{ Dir = 'casino-platform-devops';       Branch = 'feature/devops-agent' },
    @{ Dir = 'casino-platform-qa';           Branch = 'feature/qa-agent' },
    @{ Dir = 'casino-platform-security';     Branch = 'feature/security-agent' },
    @{ Dir = 'casino-platform-reviewer';     Branch = 'feature/reviewer-agent' }
)

Write-Host ""
Write-Host "=== Casino Platform — Worktree Teardown ===" -ForegroundColor Cyan
Write-Host ""

foreach ($wt in $Worktrees) {
    $TargetPath = Join-Path $ParentDir $wt.Dir
    $Branch     = $wt.Branch

    if (-not (Test-Path $TargetPath)) {
        Write-Host "  [SKIP] $($wt.Dir) does not exist — nothing to remove" -ForegroundColor Yellow
        continue
    }

    # Abort if the worktree has uncommitted changes.
    $Status = git -C $TargetPath status --porcelain 2>$null
    if ($Status) {
        Write-Host "  [WARN] $($wt.Dir) has uncommitted changes — skipping to protect your work" -ForegroundColor Red
        Write-Host "         Commit or stash changes first, then re-run this script." -ForegroundColor Red
        continue
    }

    Write-Host "  [REMOVE] $TargetPath" -ForegroundColor Green
    git -C $RepoRoot worktree remove $TargetPath --force

    # Delete the local branch only if it has no unique commits (fully merged or empty).
    $Ahead = (git -C $RepoRoot rev-list "develop..$Branch" 2>$null | Measure-Object -Line).Lines
    if ($Ahead -eq 0) {
        Write-Host "  [DELETE] branch $Branch (no unique commits)" -ForegroundColor Green
        git -C $RepoRoot branch -d $Branch 2>$null
    } else {
        Write-Host "  [KEEP]   branch $Branch ($Ahead commit(s) ahead of develop — branch preserved)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Remaining worktrees ===" -ForegroundColor Cyan
git -C $RepoRoot worktree list
Write-Host ""
Write-Host "Teardown complete." -ForegroundColor Cyan

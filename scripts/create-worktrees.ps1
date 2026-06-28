# create-worktrees.ps1
# Creates one git worktree per agent role as sibling directories of the repo root.
# Run from the repo root: .\scripts\create-worktrees.ps1

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
Write-Host "=== Casino Platform — Worktree Setup ===" -ForegroundColor Cyan
Write-Host "Repo root : $RepoRoot"
Write-Host "Parent dir: $ParentDir"
Write-Host ""

foreach ($wt in $Worktrees) {
    $TargetPath = Join-Path $ParentDir $wt.Dir
    $Branch     = $wt.Branch

    if (Test-Path $TargetPath) {
        Write-Host "  [SKIP] $($wt.Dir) already exists at $TargetPath" -ForegroundColor Yellow
        continue
    }

    Write-Host "  [ADD]  $Branch -> $TargetPath" -ForegroundColor Green
    git -C $RepoRoot worktree add $TargetPath -b $Branch develop
}

Write-Host ""
Write-Host "=== Worktree list ===" -ForegroundColor Cyan
git -C $RepoRoot worktree list
Write-Host ""
Write-Host "Done. Open each folder in a separate Claude Code session." -ForegroundColor Cyan

#!/usr/bin/env pwsh

# Git Repository Auto-Update Script
# This script automatically adds, commits, and pushes all changes in the repository

Write-Host "Starting Git Repository Auto-Update..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "This directory is not a Git repository!"
    exit 1
}

# Get current git status
Write-Host "Checking current Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if (-not $gitStatus) {
    Write-Host "No changes to commit. Repository is up to date." -ForegroundColor Green
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Cyan
$gitStatus

# Add all changes (respecting .gitignore)
Write-Host "Adding all changes to staging area..." -ForegroundColor Yellow
git add -A

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to add changes to staging area!"
    exit 1
}

Write-Host "All changes added to staging area." -ForegroundColor Green

# Generate a commit message with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Auto-update: $timestamp"

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to commit changes!"
    exit 1
}

# Push changes to remote repository
Write-Host "Pushing changes to remote repository..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push changes to remote repository!"
    exit 1
}

Write-Host "Git repository updated successfully!" -ForegroundColor Green
Write-Host "Commit message: $commitMessage" -ForegroundColor Cyan

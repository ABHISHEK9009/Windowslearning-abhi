# Git Repository Auto-Update Commands

This repository contains automated scripts to update your Git repository with all changes.

## Files Created

- `update-git-repo.ps1` - PowerShell script for automated Git updates
- `update-git.bat` - Batch file for easy execution
- `.gitignore` - Ignores nested git repositories

## How to Use

### Method 1: Run the Batch File (Easiest)
```bash
double-click update-git.bat
```

### Method 2: Run PowerShell Script Directly
```bash
powershell -ExecutionPolicy Bypass -File "update-git-repo.ps1"
```

### Method 3: Run from PowerShell
```powershell
.\update-git-repo.ps1
```

## What the Script Does

1. **Checks Git Status** - Detects any changes in the repository
2. **Adds All Changes** - Stages new files, modifications, and deletions
3. **Commits Changes** - Creates a commit with timestamp
4. **Pushes to Remote** - Updates the remote repository

## Features

- ✅ Automatically handles new files, modifications, and deletions
- ✅ Respects .gitignore (excludes nested git repositories)
- ✅ Timestamped commit messages for tracking
- ✅ Color-coded output for better visibility
- ✅ Error handling and validation

## Example Output

```
Starting Git Repository Auto-Update...
Checking current Git status...
Changes detected:
 D README.md
?? .gitignore
?? update-git-repo.ps1
?? update-git.bat

Adding all changes to staging area...
All changes added to staging area.

Committing changes...
[main 6a553cc] Auto-update: 2026-04-01 15:04:42
 4 files changed, 65 insertions(+)
 create mode 100644 .gitignore
 delete mode 100644 README.md
 create mode 100644 update-git-repo.ps1
 create mode 100644 update-git.bat

Pushing changes to remote repository...
Enumerating objects: 6, done.
...
Git repository updated successfully!
Commit message: Auto-update: 2026-04-01 15:04:42
```

## Requirements

- Git installed and configured
- PowerShell (included with Windows)
- Internet connection for pushing to remote repository

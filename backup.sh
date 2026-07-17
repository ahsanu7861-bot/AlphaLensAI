#!/bin/bash

set -Eeuo pipefail

PROJECT_DIR="/Users/apple/AlphaLensAI"
BACKUP_ROOT="/Users/apple/Documents/AlphaLensAI Backups"
DAILY_DIR="$BACKUP_ROOT/Daily"
LOG_FILE="$HOME/Library/Logs/AlphaLensAI-backup.log"

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
BACKUP_NAME="AlphaLensAI_Backup_${TIMESTAMP}.zip"
BACKUP_PATH="$DAILY_DIR/$BACKUP_NAME"

mkdir -p "$DAILY_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

exec >> "$LOG_FILE" 2>&1

echo ""
echo "=================================================="
echo "AlphaLens AI backup started: $(date)"
echo "=================================================="

cd "$PROJECT_DIR"

if [ ! -d ".git" ]; then
    echo "ERROR: $PROJECT_DIR is not a Git repository."
    exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
    echo "ERROR: GitHub remote 'origin' is not configured."
    exit 1
fi

# Prevent secrets from accidentally being committed.
SECRET_FILES="$(git status --porcelain | awk '{print $2}' | grep -E '(^|/)\.env($|\.)' || true)"

if [ -n "$SECRET_FILES" ]; then
    echo "ERROR: An environment/secrets file is not ignored:"
    echo "$SECRET_FILES"
    echo "Backup stopped to protect API keys."
    exit 1
fi

BRANCH="$(git branch --show-current)"

if [ -z "$BRANCH" ]; then
    echo "ERROR: Git is not currently on a normal branch."
    exit 1
fi

echo "Project: $PROJECT_DIR"
echo "Branch: $BRANCH"

# Add and commit new work.
git add -A

if git diff --cached --quiet; then
    echo "No new project changes to commit."
else
    git commit -m "Automatic daily backup ${TIMESTAMP}"
    echo "Created commit:"
    git log -1 --oneline
fi

# Push local work to GitHub.
echo "Pushing to GitHub..."
git push origin "$BRANCH"

# Create a clean ZIP without large/generated/private files.
echo "Creating ZIP backup..."

ditto \
    -c \
    -k \
    --keepParent \
    --norsrc \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude ".env" \
    --exclude ".env.*" \
    --exclude ".DS_Store" \
    --exclude "*.log" \
    --exclude "*.zip" \
    "$PROJECT_DIR" \
    "$BACKUP_PATH"

# Confirm the ZIP exists and is not empty.
if [ ! -s "$BACKUP_PATH" ]; then
    echo "ERROR: ZIP backup was not created correctly."
    exit 1
fi

# Verify GitHub and local Git contain the same commit.
git fetch origin "$BRANCH"

LOCAL_COMMIT="$(git rev-parse HEAD)"
REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "ERROR: GitHub does not match the local Git commit."
    echo "Local:  $LOCAL_COMMIT"
    echo "Remote: $REMOTE_COMMIT"
    exit 1
fi

echo ""
echo "BACKUP COMPLETED SUCCESSFULLY"
echo "Local Git: $LOCAL_COMMIT"
echo "GitHub: origin/$BRANCH"
echo "Synced ZIP: $BACKUP_PATH"
echo "ZIP size: $(du -h "$BACKUP_PATH" | awk '{print $1}')"
echo "Completed: $(date)"

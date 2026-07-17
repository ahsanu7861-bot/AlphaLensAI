#!/bin/bash

set -e

PROJECT_DIR="/Users/apple/AlphaLensAI"
PROJECT_PARENT="/Users/apple"
PROJECT_NAME="AlphaLensAI"

BACKUP_ROOT="/Users/apple/Documents/AlphaLensAI Backups"
DAILY_DIR="$BACKUP_ROOT/Daily"
LOG_FILE="/Users/apple/Library/Logs/AlphaLensAI-backup.log"

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
BACKUP_NAME="AlphaLensAI_Backup_${TIMESTAMP}.tar.gz"
BACKUP_PATH="$DAILY_DIR/$BACKUP_NAME"

mkdir -p "$DAILY_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

{
    echo ""
    echo "=================================================="
    echo "AlphaLens AI backup started: $(date)"
    echo "=================================================="

    cd "$PROJECT_DIR"

    if [ ! -d ".git" ]; then
        echo "ERROR: AlphaLensAI is not a Git repository."
        exit 1
    fi

    if ! git remote get-url origin >/dev/null 2>&1; then
        echo "ERROR: GitHub remote origin is not configured."
        exit 1
    fi

    BRANCH="$(git branch --show-current)"

    if [ -z "$BRANCH" ]; then
        echo "ERROR: No active Git branch was found."
        exit 1
    fi

    echo "Project: $PROJECT_DIR"
    echo "Branch: $BRANCH"

    # Save all current project changes locally.
    git add -A

    if git diff --cached --quiet; then
        echo "No new project changes to commit."
    else
        git commit -m "Automatic daily backup ${TIMESTAMP}"
        echo "Created Git commit:"
        git log -1 --oneline
    fi

    # Push the current branch to GitHub.
    echo "Pushing project to GitHub..."
    git push origin "$BRANCH"

    # Create the compressed archive.
    echo "Creating compressed backup archive..."

    cd "$PROJECT_PARENT"

    /usr/bin/tar \
        --exclude="$PROJECT_NAME/.git" \
        --exclude="$PROJECT_NAME/node_modules" \
        --exclude="$PROJECT_NAME/*/node_modules" \
        --exclude="$PROJECT_NAME/*/*/node_modules" \
        --exclude="$PROJECT_NAME/.env" \
        --exclude="$PROJECT_NAME/.env.*" \
        --exclude="$PROJECT_NAME/*/.env" \
        --exclude="$PROJECT_NAME/*/.env.*" \
        --exclude="$PROJECT_NAME/*.zip" \
        --exclude="$PROJECT_NAME/*.tar.gz" \
        --exclude="$PROJECT_NAME/*.log" \
        --exclude="$PROJECT_NAME/.DS_Store" \
        -czf "$BACKUP_PATH" \
        "$PROJECT_NAME"

    if [ ! -s "$BACKUP_PATH" ]; then
        echo "ERROR: Backup archive was not created."
        exit 1
    fi

    echo "Testing archive integrity..."

    if ! /usr/bin/tar -tzf "$BACKUP_PATH" >/dev/null; then
        echo "ERROR: Backup archive failed its integrity test."
        rm -f "$BACKUP_PATH"
        exit 1
    fi

    # Verify local Git and GitHub are identical.
    cd "$PROJECT_DIR"

    git fetch origin "$BRANCH"

    LOCAL_COMMIT="$(git rev-parse HEAD)"
    REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "ERROR: Local Git and GitHub do not match."
        echo "Local:  $LOCAL_COMMIT"
        echo "Remote: $REMOTE_COMMIT"
        exit 1
    fi

    echo ""
    echo "=================================================="
    echo "BACKUP COMPLETED SUCCESSFULLY"
    echo "=================================================="
    echo "Local Git: $LOCAL_COMMIT"
    echo "GitHub: origin/$BRANCH"
    echo "Cloud-synced archive: $BACKUP_PATH"
    echo "Archive size: $(du -h "$BACKUP_PATH" | awk '{print $1}')"
    echo "Completed: $(date)"

} 2>&1 | tee -a "$LOG_FILE"

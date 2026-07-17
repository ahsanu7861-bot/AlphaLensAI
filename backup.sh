#!/bin/bash

set -Eeuo pipefail

# ==================================================
# AlphaLens AI — Automatic Three-Copy Backup
# ==================================================
#
# Copies maintained:
# 1. Local Git repository
# 2. GitHub origin branch
# 3. Compressed source archive in the Google
#    Drive-synced Daily backup folder
#
# Archives are created from the committed Git
# snapshot. Untracked files, .env files, node_modules,
# sockets, logs and temporary files are not included.
# ==================================================

PROJECT_DIR="/Users/apple/AlphaLensAI"

BACKUP_ROOT="/Users/apple/Documents/AlphaLensAI Backups"
DAILY_DIR="$BACKUP_ROOT/Daily"
MILESTONES_DIR="$BACKUP_ROOT/Milestones"
RELEASES_DIR="$BACKUP_ROOT/Releases"

LOG_DIR="/Users/apple/Library/Logs"
LOG_FILE="$LOG_DIR/AlphaLensAI-backup.log"

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
BACKUP_NAME="AlphaLensAI_Backup_${TIMESTAMP}.tar.gz"
BACKUP_PATH="$DAILY_DIR/$BACKUP_NAME"

mkdir -p "$DAILY_DIR"
mkdir -p "$MILESTONES_DIR"
mkdir -p "$RELEASES_DIR"
mkdir -p "$LOG_DIR"

# Display output in Terminal while also saving it.
exec > >(tee -a "$LOG_FILE") 2>&1

echo ""
echo "=================================================="
echo "AlphaLens AI backup started"
echo "Time: $(date)"
echo "=================================================="

cd "$PROJECT_DIR"

# ==================================================
# 1. Verify project
# ==================================================

if [ ! -d ".git" ]; then
    echo "ERROR: $PROJECT_DIR is not a Git repository."
    exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
    echo "ERROR: GitHub remote 'origin' is not configured."
    exit 1
fi

BRANCH="$(git branch --show-current)"

if [ -z "$BRANCH" ]; then
    echo "ERROR: Git is not currently on a normal branch."
    exit 1
fi

echo "Project: $PROJECT_DIR"
echo "Branch: $BRANCH"

# ==================================================
# 2. Security checks
# ==================================================

echo "Running security checks..."

TRACKED_ENV_FILES="$(
    git ls-files |
    grep -E '(^|/)\.env($|\.)' ||
    true
)"

if [ -n "$TRACKED_ENV_FILES" ]; then
    echo "ERROR: Environment or secret files are tracked by Git:"
    echo "$TRACKED_ENV_FILES"
    echo ""
    echo "Backup stopped to protect API keys."
    exit 1
fi

TRACKED_KEY_NAMES="$(
    git ls-files |
    grep -Ei '(API_KEY|SECRET_KEY|ACCESS_TOKEN|PRIVATE_KEY)' ||
    true
)"

if [ -n "$TRACKED_KEY_NAMES" ]; then
    echo "ERROR: Suspicious secret-related filenames are tracked by Git:"
    echo "$TRACKED_KEY_NAMES"
    echo ""
    echo "Backup stopped for manual inspection."
    exit 1
fi

# Confirm common secret files are ignored.
for SECRET_PATH in \
    ".env" \
    "backend/.env"
do
    if [ -e "$SECRET_PATH" ]; then
        if ! git check-ignore "$SECRET_PATH" >/dev/null 2>&1; then
            echo "ERROR: $SECRET_PATH exists but is not ignored by Git."
            exit 1
        fi
    fi
done

echo "Security checks passed."

# ==================================================
# 3. Commit current project work locally
# ==================================================

echo "Checking for project changes..."

git add -A

# Recheck after staging in case a secret file was added.
STAGED_ENV_FILES="$(
    git diff --cached --name-only |
    grep -E '(^|/)\.env($|\.)' ||
    true
)"

if [ -n "$STAGED_ENV_FILES" ]; then
    git reset

    echo "ERROR: A secret or environment file was staged:"
    echo "$STAGED_ENV_FILES"
    echo ""
    echo "Nothing was committed."
    exit 1
fi

if git diff --cached --quiet; then
    echo "No new project changes to commit."
else
    COMMIT_MESSAGE="Automatic daily backup ${TIMESTAMP}"

    git commit -m "$COMMIT_MESSAGE"

    echo "Created local Git commit:"
    git log -1 --oneline
fi

# ==================================================
# 4. Push to GitHub
# ==================================================

echo "Pushing $BRANCH to GitHub..."

git push origin "$BRANCH"

echo "Fetching GitHub state for verification..."

git fetch origin "$BRANCH"

LOCAL_COMMIT="$(git rev-parse HEAD)"
REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "ERROR: Local Git and GitHub do not match."
    echo "Local:  $LOCAL_COMMIT"
    echo "Remote: $REMOTE_COMMIT"
    exit 1
fi

echo "Local Git and GitHub are synchronized."

# ==================================================
# 5. Create clean archive from committed Git source
# ==================================================

echo "Creating clean compressed source archive..."

rm -f "$BACKUP_PATH"

git archive \
    --format=tar.gz \
    --prefix="AlphaLensAI/" \
    --output="$BACKUP_PATH" \
    HEAD

if [ ! -f "$BACKUP_PATH" ]; then
    echo "ERROR: Backup archive was not created."
    exit 1
fi

if [ ! -s "$BACKUP_PATH" ]; then
    echo "ERROR: Backup archive is empty."
    rm -f "$BACKUP_PATH"
    exit 1
fi

# ==================================================
# 6. Verify archive integrity
# ==================================================

echo "Testing archive integrity..."

if ! /usr/bin/tar -tzf "$BACKUP_PATH" >/dev/null 2>&1; then
    echo "ERROR: Backup archive failed its integrity test."
    rm -f "$BACKUP_PATH"
    exit 1
fi

ARCHIVE_FILE_COUNT="$(
    /usr/bin/tar -tzf "$BACKUP_PATH" |
    wc -l |
    tr -d ' '
)"

if [ "$ARCHIVE_FILE_COUNT" -eq 0 ]; then
    echo "ERROR: The archive contains no project files."
    rm -f "$BACKUP_PATH"
    exit 1
fi

# Confirm secrets are not present in archive filenames.
ARCHIVED_SECRET_FILES="$(
    /usr/bin/tar -tzf "$BACKUP_PATH" |
    grep -E '(^|/)\.env($|\.)' ||
    true
)"

if [ -n "$ARCHIVED_SECRET_FILES" ]; then
    echo "ERROR: An environment file was found inside the archive:"
    echo "$ARCHIVED_SECRET_FILES"

    rm -f "$BACKUP_PATH"
    exit 1
fi

# ==================================================
# 7. Final verification
# ==================================================

CURRENT_LOCAL_COMMIT="$(git rev-parse HEAD)"
CURRENT_REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

if [ "$CURRENT_LOCAL_COMMIT" != "$CURRENT_REMOTE_COMMIT" ]; then
    echo "ERROR: Git synchronization changed during backup."
    exit 1
fi

ARCHIVE_SIZE="$(du -h "$BACKUP_PATH" | awk '{print $1}')"

echo ""
echo "=================================================="
echo "BACKUP COMPLETED SUCCESSFULLY"
echo "=================================================="
echo "Local Git commit: $CURRENT_LOCAL_COMMIT"
echo "GitHub branch: origin/$BRANCH"
echo "Archive: $BACKUP_PATH"
echo "Archive size: $ARCHIVE_SIZE"
echo "Archived entries: $ARCHIVE_FILE_COUNT"
echo "Completed: $(date)"
echo "=================================================="

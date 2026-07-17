cat > /Users/apple/AlphaLensAI/backup.sh <<'EOF'
#!/bin/bash

set -Eeuo pipefail

PROJECT_DIR="/Users/apple/AlphaLensAI"
PROJECT_PARENT="/Users/apple"
PROJECT_NAME="AlphaLensAI"

BACKUP_ROOT="/Users/apple/Documents/AlphaLensAI Backups"
DAILY_DIR="$BACKUP_ROOT/Daily"
LOG_FILE="$HOME/Library/Logs/AlphaLensAI-backup.log"

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
BACKUP_NAME="AlphaLensAI_Backup_${TIMESTAMP}.zip"
BACKUP_PATH="$DAILY_DIR/$BACKUP_NAME"

mkdir -p "$DAILY_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Show output in Terminal and save it to the log.
exec > >(tee -a "$LOG_FILE") 2>&1

echo ""
echo "=================================================="
echo "AlphaLens AI backup started: $(date)"
echo "=================================================="

cd "$PROJECT_DIR"

# --------------------------------------------------
# Safety checks
# --------------------------------------------------

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

# Stop if any .env file is tracked by Git.
TRACKED_SECRET_FILES="$(git ls-files | grep -E '(^|/)\.env($|\.)' || true)"

if [ -n "$TRACKED_SECRET_FILES" ]; then
    echo "ERROR: The following secret files are tracked by Git:"
    echo "$TRACKED_SECRET_FILES"
    echo "Backup stopped to protect your API keys."
    exit 1
fi

echo "Project: $PROJECT_DIR"
echo "Branch: $BRANCH"

# --------------------------------------------------
# Save work to local Git
# --------------------------------------------------

git add -A

if git diff --cached --quiet; then
    echo "No new project changes to commit."
else
    git commit -m "Automatic daily backup ${TIMESTAMP}"

    echo "Created local Git commit:"
    git log -1 --oneline
fi

# --------------------------------------------------
# Push to GitHub
# --------------------------------------------------

echo "Pushing to GitHub..."
git push origin "$BRANCH"

# --------------------------------------------------
# Create clean ZIP archive
# --------------------------------------------------

echo "Creating ZIP backup..."

cd "$PROJECT_PARENT"

rm -f "$BACKUP_PATH"

/usr/bin/zip -rq "$BACKUP_PATH" "$PROJECT_NAME" \
    -x "$PROJECT_NAME/.git/*" \
       "$PROJECT_NAME/node_modules/*" \
       "$PROJECT_NAME/*/node_modules/*" \
       "$PROJECT_NAME/*/*/node_modules/*" \
       "$PROJECT_NAME/.env" \
       "$PROJECT_NAME/.env.*" \
       "$PROJECT_NAME/*/.env" \
       "$PROJECT_NAME/*/.env.*" \
       "$PROJECT_NAME/*/*/.env" \
       "$PROJECT_NAME/*/*/.env.*" \
       "$PROJECT_NAME/*.zip" \
       "$PROJECT_NAME/*/*.zip" \
       "$PROJECT_NAME/*/*/*.zip" \
       "$PROJECT_NAME/*.log" \
       "$PROJECT_NAME/*/*.log" \
       "$PROJECT_NAME/*/*/*.log" \
       "$PROJECT_NAME/.DS_Store" \
       "$PROJECT_NAME/*/.DS_Store" \
       "$PROJECT_NAME/*/*/.DS_Store"

if [ ! -s "$BACKUP_PATH" ]; then
    echo "ERROR: ZIP backup was not created correctly."
    exit 1
fi

# --------------------------------------------------
# Test ZIP integrity
# --------------------------------------------------

echo "Testing ZIP integrity..."

if ! /usr/bin/unzip -tq "$BACKUP_PATH" >/dev/null; then
    echo "ERROR: The ZIP file failed its integrity test."
    exit 1
fi

# --------------------------------------------------
# Verify GitHub matches local Git
# --------------------------------------------------

cd "$PROJECT_DIR"

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
echo "=================================================="
echo "BACKUP COMPLETED SUCCESSFULLY"
echo "=================================================="
echo "Local Git: $LOCAL_COMMIT"
echo "GitHub: origin/$BRANCH"
echo "Synced ZIP: $BACKUP_PATH"
echo "ZIP size: $(du -h "$BACKUP_PATH" | awk '{print $1}')"
echo "Completed: $(date)"
EOF

chmod +x /Users/apple/AlphaLensAI/backup.sh
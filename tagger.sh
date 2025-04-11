#!/bin/bash

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <version> [paths...] [--push]"
  echo "Example: $0 2.3.4 path/to/dir1 path/to/file2 --push"
  exit 1
fi

# Extract version number (first argument)
VERSION=$1
shift

# Initialize variables
PUSH=false
PATHS=()

# Process remaining arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --push)
      PUSH=true
      echo "Push flag enabled: branches will be force-pushed to origin"
      ;;
    *)
      PATHS+=("$1")
      ;;
  esac
  shift
done

# Configure branch prefix
PREFIX="release"

# Convert version to branch name by replacing non-alphanumeric chars with dashes
EXACT_BRANCH_NAME="${PREFIX}-$(echo $VERSION | sed 's/[^[:alnum:]]/-/g')"

# Check if version is a pure semver without suffixes (like 2.3.4 without -rc1 etc.)
if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  # Extract major, minor, and patch components
  MAJOR=$(echo $VERSION | cut -d. -f1)
  MINOR=$(echo $VERSION | cut -d. -f2)
  PATCH=$(echo $VERSION | cut -d. -f3)
  
  # Create specialized branch names
  PATCH_BRANCH_NAME="${PREFIX}-${MAJOR}-${MINOR}-${PATCH}"
  MINOR_BRANCH_NAME="${PREFIX}-${MAJOR}-${MINOR}-x"
  MAJOR_BRANCH_NAME="${PREFIX}-${MAJOR}-x"
else
  # For versions with suffixes, these specialized branches aren't created
  PATCH_BRANCH_NAME=""
  MINOR_BRANCH_NAME=""
  MAJOR_BRANCH_NAME=""
fi

# Output extracted parameters
echo "Version: $VERSION"
echo "Exact branch name: $EXACT_BRANCH_NAME"
if [[ -n $PATCH_BRANCH_NAME ]]; then
  echo "Patch branch name: $PATCH_BRANCH_NAME"
  echo "Minor branch name: $MINOR_BRANCH_NAME"
  echo "Major branch name: $MAJOR_BRANCH_NAME"
fi
echo "Push flag: $PUSH"
echo "Number of paths: ${#PATHS[@]}"
if [ ${#PATHS[@]} -gt 0 ]; then
  echo "Paths:"
  for path in "${PATHS[@]}"; do
    echo "  - $path"
  done
fi

# Store the current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Create a temporary directory only if we have files to copy
if [ ${#PATHS[@]} -gt 0 ]; then
  # Create a temporary directory to store copies of the files
  TEMP_DIR=$(mktemp -d)
  echo "Creating temporary copies of files at $TEMP_DIR"

  # Copy all specified files to the temporary directory
  for path in "${PATHS[@]}"; do
    # Create directory structure in temp dir
    mkdir -p "$TEMP_DIR/$(dirname "$path")"
    # Copy the file
    cp "$path" "$TEMP_DIR/$path"
    echo "Copied $path to $TEMP_DIR/$path"
  done
fi

# Create commit message
COMMIT_MSG="Update for version $VERSION"

# Function to create or update a branch and commit changes
create_or_update_branch() {
  local branch_name=$1
  
  echo "Processing branch: $branch_name"
  
  # Check if branch exists
  if git show-ref --verify --quiet refs/heads/$branch_name; then
    # Branch exists, reset it from main
    echo "Branch $branch_name exists, resetting from main..."
    git checkout main
    git branch -D $branch_name
    git checkout -b $branch_name
  else
    # Create new branch from main
    echo "Creating new branch $branch_name from main..."
    git checkout main
    git checkout -b $branch_name
  fi
  
  # Copy files from temp directory back to working directory if we have any
  if [ ${#PATHS[@]} -gt 0 ]; then
    for path in "${PATHS[@]}"; do
      # Create directory structure if needed
      mkdir -p "$(dirname "$path")"
      # Copy the file back from temp
      cp "$TEMP_DIR/$path" "$path"
      echo "Restored $path from $TEMP_DIR/$path"
    done
    
    # Add files to git, even if they're in .gitignore
    echo "Adding files to git staging area in branch $branch_name..."
    for path in "${PATHS[@]}"; do
      git add --force "$path"
    done
    
    # Commit changes
    git commit -m "$COMMIT_MSG"
  else
    # Create an empty commit when no files are specified
    git commit --allow-empty -m "$COMMIT_MSG"
  fi
  
  # Push if requested
  if [ "$PUSH" = true ]; then
    echo "Force-pushing branch $branch_name to origin..."
    git push -f origin $branch_name
    echo "Successfully pushed $branch_name to origin."
  fi
}

# Process each branch
echo "Creating/updating branches and committing changes..."

# Always process the exact branch
create_or_update_branch $EXACT_BRANCH_NAME

# Process other branches if they exist
if [[ -n $PATCH_BRANCH_NAME ]]; then
  create_or_update_branch $PATCH_BRANCH_NAME
  create_or_update_branch $MINOR_BRANCH_NAME
  create_or_update_branch $MAJOR_BRANCH_NAME
fi

# Clean up temporary directory if it was created
if [ ${#PATHS[@]} -gt 0 ]; then
  echo "Cleaning up temporary files..."
  rm -rf "$TEMP_DIR"
fi

# Return to the original branch
echo "Returning to original branch: $CURRENT_BRANCH"
git checkout $CURRENT_BRANCH

if [ "$PUSH" = true ]; then
  echo "All branches have been force-pushed to origin."
fi

echo "Done!"
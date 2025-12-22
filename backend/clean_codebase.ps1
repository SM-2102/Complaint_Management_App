# Set the target directory (defaults to current directory if not provided)
param (
    [string]$TargetDir = "D:\DAD_OFFICE\Complaint_Management_App\backend\src"
)

Write-Host "Cleaning Python codebase in: $TargetDir"

# # Step 1: Remove unused imports and variables
# Write-Host "Running autoflake..."
# autoflake --in-place --remove-unused-variables --remove-all-unused-imports -r $TargetDir

# Step 2: Sort and organize imports
Write-Host "Running isort..."
isort $TargetDir

# Step 3: Format code to PEP8 standards
Write-Host "Running black..."
black $TargetDir

Write-Host "✅ Codebase cleaned successfully!"
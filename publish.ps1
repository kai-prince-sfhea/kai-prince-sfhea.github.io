# Commit and push changes in each submodule, then update and push main repo

# Request Commit Message
$commitMsg = Read-Host "Enter commit message"

# Run Quarto render first
quarto render

# List of submodules
$submodules = @("papers/GeneralisedErdosConjecture", "papers/MathsNotes")

foreach ($sub in $submodules) {
    Set-Location $sub
    git add .
    git commit -m "$commitMsg"  # Remove if no changes
    git pull --strategy-option=ours origin main  # Use 'ours' strategy to keep local changes
    git push origin main
    Set-Location ../..
}

# Now update submodule references in main repo
git add .
git commit -m "$commitMsg"
git push
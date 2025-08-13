# GitHub Repository Setup Guide

## Step 1: Create GitHub Repository
1. Go to https://github.com and sign in to your account
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Set repository name: `road-trip-planner-mvp`
5. Set visibility: **Public**
6. Leave "Initialize with README" **unchecked** (we already have files)
7. Click "Create repository"

## Step 2: Connect Local Repository to GitHub
Run these commands in your terminal (in the project root):

```bash
# Configure Git user (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Check current Git status
git status

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: AI-powered road trip planner with interactive editing"

# Set main branch as default
git branch -M main

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/road-trip-planner-mvp.git

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Repository Setup
1. Refresh your GitHub repository page
2. You should see all project files uploaded
3. The README.md will display the project description

## Daily Git Workflow

### Making Changes and Committing
```bash
# Check what files have changed
git status

# Add specific files
git add filename.tsx
# OR add all changed files
git add .

# Commit with descriptive message
git commit -m "Add feature: interactive location editing"

# Push to GitHub
git push origin main
```

### Viewing History
```bash
# See commit history
git log --oneline

# See what changed in last commit
git show

# See differences before committing
git diff
```

### Branch Management (for features)
```bash
# Create and switch to new branch
git checkout -b feature/new-feature-name

# Work on your feature, then commit
git add .
git commit -m "Implement new feature"

# Switch back to main
git checkout main

# Merge feature branch
git merge feature/new-feature-name

# Push changes
git push origin main

# Delete feature branch (optional)
git branch -d feature/new-feature-name
```

### Good Commit Message Examples
- `feat: add location editing functionality`
- `fix: resolve Google Maps API key loading issue`
- `style: improve glassmorphism UI effects`
- `docs: update README with setup instructions`
- `refactor: optimize route calculation performance`

### Common Git Commands
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes to a file
git checkout -- filename.tsx

# See remote repository info
git remote -v

# Pull latest changes from GitHub
git pull origin main

# Create .gitignore for future files
echo "filename.txt" >> .gitignore
```

## Security Best Practices

### Files to NEVER commit:
- `.env` files (contains API keys)
- `node_modules/` (dependencies)
- Personal credentials or passwords
- Database files with real data

### Our .gitignore already protects:
✅ Environment variables (`.env*`)
✅ Dependencies (`node_modules/`)
✅ Build outputs (`dist/`, `build/`)
✅ IDE files (`.vscode/`, `.idea/`)
✅ OS files (`.DS_Store`)
✅ API keys and secrets

## Troubleshooting

### If you get authentication errors:
1. Use GitHub Personal Access Token instead of password
2. Generate token at: https://github.com/settings/tokens
3. Use token as password when prompted

### If repository already exists:
```bash
# Force push (be careful!)
git push -f origin main
```

### If you need to change remote URL:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/road-trip-planner-mvp.git
```

## Next Steps After Setup
1. ✅ Repository created and connected
2. ✅ All code pushed to GitHub
3. ✅ .gitignore protecting sensitive files
4. 📝 Add collaborators if working in a team
5. 📝 Set up GitHub Actions for CI/CD (optional)
6. 📝 Create issues for future features
7. 📝 Set up branch protection rules (optional)

---

Your repository will be available at:
`https://github.com/YOUR_USERNAME/road-trip-planner-mvp`
# Setting Up Your Project with Git and GitHub

This guide will walk you through the process of setting up your Canoe Scoreboard project with Git and GitHub, from installing Git to pushing your code to a GitHub repository.

## 1. Installing Git for Windows

1. Download Git for Windows from the official website: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer and follow the installation wizard:
   - Accept the license agreement
   - Choose the installation location (default is fine)
   - Select components (default options are recommended)
   - Choose the default editor (Notepad is easiest if you're new to Git)
   - Adjust your PATH environment (recommended: "Git from the command line and also from 3rd-party software")
   - Choose HTTPS transport backend (default: OpenSSL)
   - Configure line ending conversions (recommended: "Checkout Windows-style, commit Unix-style line endings")
   - Configure terminal emulator (default: MinTTY)
   - Configure extra options (defaults are fine)
   - Configure experimental options (none needed)
3. Click Install and wait for the installation to complete
4. After installation, open a new Command Prompt or PowerShell window to verify Git is installed by typing:
   ```
   git --version
   ```
   You should see the Git version number if installation was successful.

## 2. Setting Up Git Identity

Configure your Git identity (use your GitHub email if you already have an account):

```
git config --global user.name "Jakub Bican"
git config --global user.email "your.email@example.com"
```

## 3. Initializing Git in Your Project

1. Open a Command Prompt or PowerShell window
2. Navigate to your project directory:
   ```
   cd path\to\your\csk_scoreboard
   ```
3. Initialize Git:
   ```
   git init
   ```
4. Add all your project files to Git:
   ```
   git add .
   ```
5. Make your first commit:
   ```
   git commit -m "Initial commit: Canoe Scoreboard application"
   ```

## 4. Creating a GitHub Repository

1. Sign in to your GitHub account (or create one at [github.com](https://github.com) if you don't have one)
2. Click the '+' icon in the top-right corner and select "New repository"
3. Enter repository name: "csk_scoreboard"
4. Add a description (optional): "A modern, responsive web application for displaying canoe competition scoreboards"
5. Choose visibility (Public or Private)
6. Do NOT initialize with a README, .gitignore, or license (since you're pushing an existing repository)
7. Click "Create repository"

## 5. Connecting Your Local Repository to GitHub

After creating the GitHub repository, you'll see instructions for pushing an existing repository. Follow these commands:

```
git remote add origin https://github.com/jakubbican/canoe-scoreboard.git
git branch -M main
git push -u origin main
```

## 6. GitHub Authentication

When pushing for the first time, you'll be prompted to authenticate:

### Option 1: Using GitHub CLI (Recommended)
1. Install GitHub CLI from: [https://cli.github.com/](https://cli.github.com/)
2. Authenticate with:
   ```
   gh auth login
   ```
3. Follow the prompts to complete authentication

### Option 2: Using Personal Access Token
1. In GitHub, go to Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name, set expiration, and select repo permissions
4. Generate the token and copy it
5. When prompted for your password when pushing, use this token instead

## 7. Verifying Your Setup in VS Code

1. In VS Code, look for the Source Control icon in the left sidebar (looks like a branch)
2. Click on it to see Git integration features
3. You should see your committed files and any changes you make to the project

## 8. Basic Git Workflow for Future Changes

1. Make changes to your files
2. Stage changes: `git add .` (or stage specific files: `git add filename`)
3. Commit changes: `git commit -m "Descriptive message about changes"`
4. Push to GitHub: `git push`

## Additional Resources

- [GitHub Desktop](https://desktop.github.com/) - A GUI alternative for Git operations
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Interactive Git Learning](https://learngitbranching.js.org/)

---

Note: If you encounter any issues during this process, refer to the [GitHub Help documentation](https://docs.github.com/en) or reach out for assistance.
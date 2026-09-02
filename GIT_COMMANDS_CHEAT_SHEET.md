# 🛠️ The Ultimate Git Handbook & Scenario Cheat Sheet

A comprehensive, scenario-based reference guide for every Git command you will ever need — from daily workflows and branch management to disaster recovery and secret removal.

---

## 📑 Table of Contents
1. [🚨 Emergency & Disaster Recovery (Secrets, Mistakes & Undos)](#1--emergency--disaster-recovery)
2. [📦 Daily Workflow (Stage, Commit, Push, Pull)](#2--daily-workflow)
3. [🌿 Branching & Switching](#3--branching--switching)
4. [🔀 Merging & Conflict Resolution](#4--merging--conflict-resolution)
5. [🔄 Rebasing & Squashing Commits](#5--rebasing--squashing-commits)
6. [💾 Stashing (Temporary Work Saving)](#6--stashing-temporary-work-saving)
7. [🔍 Inspecting, Diffs & History (Log, Blame, Bisect)](#7--inspecting-diffs--history)
8. [🌐 Remote Repository Management](#8--remote-repository-management)
9. [🏷️ Tags & Releases](#9--tags--releases)
10. [🧹 Cleaning & Repository Maintenance](#10--cleaning--repository-maintenance)
11. [⚡ Pro Aliases & Configuration](#11--pro-aliases--configuration)
12. [💬 Git Commit Comments & Message Standards (All Scenarios)](#12--git-commit-comments--message-standards)

---

## 1. 🚨 Emergency & Disaster Recovery

### Scenario 1.1: I accidentally committed `.env` or sensitive files, but HAVEN'T pushed yet
```bash
# 1. Stop tracking the file without deleting it from your disk
git rm --cached .env
# For subfolders (e.g., FrontEnd/.env, BackEnd/.env):
git rm --cached FrontEnd/.env BackEnd/.env

# 2. Add to .gitignore so it never gets tracked again
echo "**/.env*" >> .gitignore

# 3. Amend the previous commit or create a new commit
git commit --amend -m "chore: remove sensitive files"
```

---

### Scenario 1.2: I accidentally pushed `.env` to GitHub (Current Branch)
```bash
# 1. Remove file from git index
git rm --cached FrontEnd/.env FrontEnd/.env.* BackEnd/.env BackEnd/.env.*

# 2. Stage gitignore and commit
git add .gitignore
git commit -m "chore: remove tracked env files and update gitignore"

# 3. Push fix to remote branch
git push origin <branch-name>
```

---

### Scenario 1.3: I want to purge `.env` from ALL PAST COMMIT HISTORY completely
> [!CAUTION]
> This rewrites commit history. Make sure your team is aware before force pushing.

```bash
# Option A: Built-in Git Filter Branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch FrontEnd/.env BackEnd/.env .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push the cleaned history to remote:
git push origin --force --all

# Option B: Fast BFG Repo-Cleaner
npx bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```

---

### Scenario 1.4: I committed the wrong files or made a typo in the commit message (NOT pushed)
```bash
# Change the last commit message:
git commit --amend -m "new and corrected commit message"

# Add a forgotten file into the last commit without changing message:
git add missed-file.js
git commit --amend --no-edit
```

---

### Scenario 1.5: I want to undo my last commit
```bash
# Soft Reset: Keeps all your code changes staged (safe & recommended)
git reset --soft HEAD~1

# Mixed Reset (default): Keeps your code changes in working directory (unstaged)
git reset HEAD~1

# Hard Reset (DANGER): Destroys all code changes in the last commit!
git reset --hard HEAD~1
```

---

### Scenario 1.6: I made a mess in my local files and want to discard ALL uncommitted changes
```bash
# Discard all changes in tracked files
git restore .
# (Older git syntax equivalent: git checkout .)

# Discard changes to a specific file
git restore path/to/file.js

# Delete all untracked files and folders
git clean -fd
```

---

### Scenario 1.7: A bad commit is already pushed to production, and I want to revert it cleanly
```bash
# Creates a NEW commit that safely reverses the changes of <commit-hash>
git revert <commit-hash>
git push origin <branch-name>
```

---

## 2. 📦 Daily Workflow

| Task / Scenario | Command |
| :--- | :--- |
| Check status of files | `git status` or `git status -s` (compact) |
| Stage all changes (new, modified, deleted) | `git add .` or `git add -A` |
| Stage a specific file | `git add src/app.js` |
| Stage parts of a file interactively | `git add -p src/app.js` |
| Commit with message | `git commit -m "feat: add user authentication"` |
| Commit all tracked modified files directly | `git commit -am "fix: correct navbar alignment"` |
| Push to remote branch | `git push origin <branch-name>` |
| Set upstream and push (first time) | `git push -u origin <branch-name>` |
| Pull latest changes from remote | `git pull origin <branch-name>` |
| Pull and rebase instead of merge | `git pull --rebase origin <branch-name>` |
| Download latest commits without merging | `git fetch origin` |

---

## 3. 🌿 Branching & Switching

### Scenario 3.1: Create, switch, and list branches
```bash
# Create and switch to a new branch (modern syntax)
git switch -c feature/auth-module
# (Older syntax: git checkout -b feature/auth-module)

# Switch to an existing branch
git switch main
# (Older syntax: git checkout main)

# Switch back to the previous branch you were just on
git switch -

# List all local branches
git branch

# List all local AND remote branches
git branch -a
```

---

### Scenario 3.2: Renaming & Deleting branches
```bash
# Rename current branch locally:
git branch -m new-branch-name

# Rename another branch:
git branch -m old-name new-name

# Delete a local branch (safe - warns if unmerged):
git branch -d feature/old-feature

# Force delete a local branch (even if unmerged):
git branch -D feature/old-feature

# Delete a remote branch on GitHub:
git push origin --delete feature/old-feature
```

---

## 4. 🔀 Merging & Conflict Resolution

### Scenario 4.1: Merge a feature branch into main
```bash
# 1. Switch to the target branch
git switch main

# 2. Update target branch
git pull origin main

# 3. Merge your feature branch
git merge feature/chat-module

# 4. Push merged result
git push origin main
```

---

### Scenario 4.2: Handling Merge Conflicts
```bash
# 1. View files in conflict state
git status

# 2. Open conflicting files, look for conflict markers:
# <<<<<<< HEAD (your current branch code)
# =======
# >>>>>>> feature/branch (incoming code)

# 3. Edit files to resolve conflict, then stage them
git add src/resolved-file.js

# 4. Finalize the merge commit
git commit -m "merge: resolve conflicts between main and feature/chat-module"

# To abort a broken merge and return to previous state:
git merge --abort
```

---

## 5. 🔄 Rebasing & Squashing Commits

### Scenario 5.1: Keep feature branch updated with main (Clean linear history)
```bash
# On your feature branch:
git switch feature/new-ui
git fetch origin

# Replay your feature commits on top of latest main:
git rebase origin/main

# If conflicts occur:
# 1. Fix conflicts in files
# 2. git add <resolved-files>
# 3. git rebase --continue
# (Or abort: git rebase --abort)
```

---

### Scenario 5.2: Squash the last N commits into a single clean commit
```bash
# Interactively rebase the last 4 commits:
git rebase -i HEAD~4

# An editor will open:
# pick 1a2b3c First commit
# s 4d5e6f Second commit    <-- Change 'pick' to 's' (squash)
# s 7g8h9i Third commit     <-- Change 'pick' to 's' (squash)
# s 0j1k2l Fourth commit    <-- Change 'pick' to 's' (squash)

# Save & close editor -> Set your final clean commit message!
```

---

## 6. 💾 Stashing (Temporary Work Saving)

Use stash when you need to switch branches urgently without losing uncommitted progress.

```bash
# Save current unstaged & staged changes to stash with a message
git stash push -m "wip: halfway through payment integration"

# Stash including untracked files
git stash -u

# View list of all saved stashes
git stash list

# Restore the most recent stash and remove it from stash list
git stash pop

# Restore a specific stash without removing it from stash list
git stash apply stash@{1}

# View changes stored inside a stash
git stash show -p stash@{0}

# Delete the most recent stash
git stash drop

# Delete all stashes
git stash clear
```

---

## 7. 🔍 Inspecting, Diffs & History

```bash
# Beautiful one-line tree graph of commit history
git log --graph --oneline --decorate --all

# View last 5 commits with file change summaries
git log -n 5 --stat

# View commit history of a specific file
git log -p path/to/file.js

# See what changes are unstaged (working directory vs staged)
git diff

# See what changes are staged (ready to commit)
git diff --staged

# See differences between two branches
git diff main..feature/chat

# Find who changed each line in a file and when
git blame path/to/file.js

# Find which commit introduced a bug using binary search
git bisect start
git bisect bad                 # Current version has bug
git bisect good <commit-hash>  # This past commit was working fine
# Git checks out commits automatically -> Test code -> Mark 'git bisect good' or 'git bisect bad'
git bisect reset               # Finish bisect session
```

---

## 8. 🌐 Remote Repository Management

```bash
# List remotes with URLs
git remote -v

# Add a new remote (e.g. upstream fork)
git remote add upstream https://github.com/OriginalOwner/Repo.git

# Change the URL of an existing remote
git remote set-url origin https://github.com/Mr-A12k/Payilagam.git

# Clean up local references to deleted remote branches
git remote prune origin
# Or fetch and prune together:
git fetch -p
```

---

## 9. 🏷️ Tags & Releases

```bash
# List all tags
git tag

# Create an annotated release tag
git tag -a v1.0.0 -m "Release version 1.0.0 (Karkalam Live Launch)"

# Create a lightweight tag
git tag v1.0.1

# Push a specific tag to remote
git push origin v1.0.0

# Push all local tags to remote
git push origin --tags

# Delete a local tag
git tag -d v1.0.0

# Delete a remote tag on GitHub
git push origin --delete v1.0.0
```

---

## 10. 🧹 Cleaning & Repository Maintenance

```bash
# Preview what untracked files will be deleted (Dry run - safe)
git clean -nd

# Force delete all untracked files and folders
git clean -fd

# Clean ignored files as well (e.g., build artifacts)
git clean -fdx

# Optimize repo & reclaim disk space
git gc --prune=now --aggressive

# View git reflog (history of every HEAD movement - lifesaving for lost commits)
git reflog
```

---

## 11. ⚡ Pro Aliases & Configuration

Run these once to turbocharge your terminal productivity:

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name to main
git config --global init.defaultBranch main

# Handle line endings smoothly on Windows
git config --global core.autocrlf true

# Handy shortcuts (Aliases):
git config --global alias.st "status -s"
git config --global alias.cm "commit -m"
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.lg "log --graph --oneline --decorate --all"
git config --global alias.unstage "restore --staged"
git config --global alias.last "log -1 HEAD --stat"
```

Now you can run:
- `git st` instead of `git status -s`
- `git lg` for an instant visual tree graph
- `git cm "message"` instead of `git commit -m`

---

## 12. 💬 Git Commit Comments & Message Standards

Writing clear, standard Git commit messages (comments) makes project collaboration effortless, automated changelogs possible, and debugging with `git log` / `git bisect` fast.

### 📐 The Standard Conventional Commit Structure
```
<type>(<optional-scope>): <imperative short description>

[optional detailed body explaining WHY and WHAT changed]

[optional footer: issue references, breaking changes]
```

---

### 🏷️ All Commit Types & When to Use Them

| Type | Prefix / Emoji | When to Use | Example |
| :--- | :--- | :--- | :--- |
| **Feature** | `feat:` ✨ | Adding new functionality to the app | `feat(auth): add google oauth login` |
| **Bug Fix** | `fix:` 🐛 | Fixing a bug or unexpected behavior | `fix(cart): prevent double charging on checkout` |
| **Documentation** | `docs:` 📝 | Changes only to documentation, README, guides | `docs(readme): add docker setup instructions` |
| **Styling & UI** | `style:` 💄 | CSS, spacing, colors, themes, no logic changes | `style(navbar): adjust glassmorphism blur and padding` |
| **Refactor** | `refactor:` ♻️ | Code restructuring that neither fixes bugs nor adds features | `refactor(services): extract common axios helper` |
| **Performance** | `perf:` ⚡ | Performance optimization to speed up code | `perf(database): add index on user email column` |
| **Testing** | `test:` 🧪 | Adding missing tests or correcting existing tests | `test(auth): add unit tests for jwt validation` |
| **Build & Dependencies** | `build:` 📦 | npm packages, build tools, Vite / Webpack config | `build(deps): update react to v19.2.0` |
| **CI / CD** | `ci:` 🤖 | GitHub Actions, deployment pipelines, workflows | `ci(github): add automated test pipeline` |
| **Chore & Config** | `chore:` 🧹 | Routine tasks, `.gitignore`, configs, housekeeping | `chore(gitignore): ignore local env files` |
| **Security** | `security:` 🔒 | Fixing security vulnerabilities or removing leaked keys | `security(env): remove tracked production secrets` |
| **Revert** | `revert:` ⏪ | Reverting a previous commit | `revert(api): revert breaking course schema change` |
| **Work In Progress** | `wip:` 🚧 | Temporary checkpoint commit (before squashing) | `wip: halfway through socket notification system` |

---

### 🎯 Ready-to-Use Commit Comments for Common Scenarios

#### 1. 🎨 Frontend & UI Development
```bash
git commit -m "feat(ui): implement responsive dark mode theme toggle"
git commit -m "style(sidebar): update active link highlight and icon spacing"
git commit -m "fix(landing): resolve mobile hamburger menu collapse bug"
git commit -m "feat(compiler): add monaco editor language selector"
```

#### 2. ⚙️ Backend API & Controllers
```bash
git commit -m "feat(api): create course enrollment and syllabus endpoints"
git commit -m "fix(socket): handle socket reconnection on network drops"
git commit -m "refactor(middleware): optimize rate limiter memory usage"
git commit -m "feat(ai): integrate ollama llama-3.2 streaming chat service"
```

#### 3. 🗄️ Database, Prisma & Migrations
```bash
git commit -m "feat(db): add problem tags and difficulty enum to schema"
git commit -m "fix(prisma): add cascade delete constraint to user submissions"
git commit -m "chore(db): seed initial tamil programming problems data"
```

#### 4. 🔐 Authentication & Security
```bash
git commit -m "feat(auth): implement jwt token generation and bcrypt password hashing"
git commit -m "security(cors): restrict allowed origins to vercel and local ports"
git commit -m "security(env): purge tracked env files and update root gitignore"
```

#### 5. 🚀 Deployment, Vercel & Render
```bash
git commit -m "chore(deployment): add vercel spa rewrite configuration"
git commit -m "chore(render): configure start and build scripts in package.json"
git commit -m "docs(deploy): update deployment guide with render and vercel steps"
```

#### 6. 🚨 Hotfixes & Critical Bugs
```bash
git commit -m "fix(auth)!: resolve critical token expiration crash on login"
git commit -m "fix(db): prevent deadlocks during concurrent student submission writes"
```

---

### 📝 Multi-line Detailed Commit Message Template

When making significant features or changes, write a multi-line commit:

```bash
git commit -m "feat(practice): add live code compiler sandbox

- Added Monaco Editor with syntax highlighting for Python and JavaScript
- Integrated backend execution runner with sandboxed worker
- Added testcase comparison table with runtime metrics
- Handled infinite loop timeouts gracefully with 5-second cutoff

Closes #14"
```

---

### 🌟 The 5 Golden Rules of Great Commit Comments

1. **Use the Imperative Mood**: Write `"add feature"` or `"fix bug"`, NOT `"added feature"` or `"fixing bug"`. (Think: *"If applied, this commit will..."*).
2. **Keep the First Line Short**: Aim for **50-72 characters** max for the header line.
3. **Separate Subject from Body**: Leave a blank line between the title and the detailed explanation.
4. **Explain the 'Why' & 'What'**: The code diff shows *how* it changed; your commit message should explain *why* it was changed.
5. **Mark Breaking Changes with `!`**: e.g., `feat(api)!: migrate auth payload format`.


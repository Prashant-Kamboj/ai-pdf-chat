---
name: git-commit
description: >
  Stages all changes and creates a conventional commit message in the format
  type(scope): description. Use this skill whenever the user says "commit my
  changes", "commit this", "save my changes to git", or anything that implies
  they want to create a git commit. Triggers even if the user doesn't mention
  a commit message — the skill will figure it out automatically from the diff.
---

# Git Commit Skill

Stages all changes, infers a conventional commit message from the diff, shows
it to the user for approval, then commits.

---

## Workflow (follow in order, do not skip steps)

### Step 1 — Check git status

```bash
git status --short
```

- If the output is empty → tell the user "Nothing to commit, working tree is clean" and stop.
- If there are untracked or modified files → continue.

---

### Step 2 — Read the diff

```bash
git diff HEAD
```

Also run this to catch untracked files that aren't yet staged:

```bash
git status --short
```

Study both outputs carefully. You need to understand:
- **What changed** (new feature, bug fix, style tweak, etc.)
- **Which files/folders changed** (to infer the scope)

---

### Step 3 — Infer the commit type

Pick exactly one type based on what the diff shows:

| Type | When to use |
|---|---|
| `feat` | A new feature or page visible to the user |
| `fix` | A bug fix |
| `refactor` | Code restructure with no behaviour change |
| `style` | CSS, Tailwind, formatting — no logic change |
| `chore` | Config, deps, tooling, `.env`, `package.json` |
| `docs` | README, comments, documentation only |
| `test` | Adding or fixing tests |

If multiple types apply, pick the most significant one.

---

### Step 4 — Infer the scope from file paths

Look at which directories the changed files live in. Map them like this:

| Changed path contains | Scope to use |
|---|---|
| `app/auth/`, `login`, `register`, `session` | `auth` |
| `app/dashboard/` | `dashboard` |
| `app/api/` | `api` |
| `components/ui/` | `ui` |
| `components/` (other) | `components` |
| `lib/`, `utils/` | `lib` |
| `styles/`, `.css`, Tailwind config | `styles` |
| `public/` | `assets` |
| `middleware`, `proxy.ts` | `middleware` |
| Root config files (`next.config`, `tsconfig`, etc.) | `config` |
| `package.json`, `package-lock.json` | `deps` |
| Multiple unrelated areas | omit scope entirely |

If changes span more than 2 unrelated scopes, leave scope blank.

---

### Step 5 — Write the commit message

Format:

```
type(scope): short description in lowercase, imperative mood

- optional bullet if more context is needed
- keep bullets short and factual
```

Rules:
- Subject line **under 72 characters**
- Use **imperative mood** — "add", "fix", "update", not "added", "fixed", "updated"
- All **lowercase** except proper nouns
- No full stop at the end of the subject line
- Only add bullet points if the change is complex enough to need explanation
- Do **not** mention file names in the subject line unless essential

Good examples:
```
feat(auth): add login page with supabase session handling

fix(api): handle null response from pinecone retriever

chore(deps): update langchain to v0.3.5

style(ui): fix button alignment on mobile

refactor(lib): extract pinecone client into singleton
```

Bad examples:
```
updated stuff                         ← too vague
feat(auth): Added the login page.     ← past tense, capital, full stop
fix: fixed bug in components/auth/LoginForm.tsx  ← file name in subject
```

---

### Step 6 — Show the message and ask for approval

Present the message clearly in a code block and ask:

> Here's the commit message I've drafted:
>
> ```
> feat(auth): add login page with supabase session handling
> ```
>
> Does this look good, or would you like to change anything?

Wait for the user to reply. Do **not** run git commands yet.

Accept responses like: "yes", "looks good", "go ahead", "ship it", "do it".

If the user suggests changes, update the message and confirm once more before proceeding.

---

### Step 7 — Stage and commit

Once approved, run both commands:

```bash
git add .
git commit -m "type(scope): description"
```

If there are bullet points in the message, use `-m` twice:

```bash
git add .
git commit -m "feat(auth): add login with supabase" -m "- adds server-side session via cookies
- removes localStorage dependency"
```

---

### Step 8 — Confirm success

After committing, run:

```bash
git log --oneline -1
```

Show the user the output so they can see the commit was created, e.g.:

> ✓ Committed: `a3f92bc feat(auth): add login page with supabase session handling`

---

## Edge cases

**Merge conflicts present** → tell the user to resolve conflicts first, do not stage or commit.

**On a detached HEAD** → warn the user before committing.

**Binary files changed only** → use `chore(assets):` as the type and scope.

**Only whitespace/formatting changes** → use `style:` with no scope.

**`package-lock.json` changed alongside real code** → ignore it for scope inference, focus on the real code changes.

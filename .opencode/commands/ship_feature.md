---

description: Commit, push, create PR, squash merge, and clean up the current feature branch
allowed-tools: Read, Bash, mcp__github__create_pull_request, mcp__github__merge_pull_request, mcp__github__delete_branch
------------------------------------------------------------------------------------------------------------------------

# /ship-feature

Ship the current feature branch into the repository's default branch.

## 1. Identify branches

Run:

```bash
git branch --show-current
git remote show origin
git fetch origin
```

Store the current branch as `CURRENT_BRANCH`.

Determine the repository's default branch as `BASE_BRANCH` (`main` or `master`).

Rules:

* If `CURRENT_BRANCH` is `main` or `master`, STOP. Never ship directly from the base branch.
* Do not assume `main`; detect the actual default branch.
* GitHub's default branch is authoritative when available.

Report:

```text
✓ Current branch — <CURRENT_BRANCH>
✓ Base branch — <BASE_BRANCH>
```

## 2. Verify GitHub MCP

Before PR operations, verify GitHub MCP is connected.

If unavailable, STOP and say exactly:

```text
GitHub MCP is not connected. Run /mcp to check connection.
```

## 3. Inspect changes

Run:

```bash
git status
git diff
git diff --staged
git log origin/<BASE_BRANCH>..HEAD --oneline
git log HEAD..origin/<BASE_BRANCH> --oneline
```

Look for relevant project specifications in:

```text
.specs/
specs/
docs/
.claude/specs/
```

Use the relevant spec when available, but never assume a specific project structure.

Determine what was actually developed from the spec, code changes, tests, and recent commits.

## 4. Check conflicts

Verify that `CURRENT_BRANCH` can merge into the latest `origin/<BASE_BRANCH>` without conflicts.

If conflicts exist, STOP.

Report:

```text
⚠ Merge conflicts detected between <CURRENT_BRANCH> and <BASE_BRANCH>.
Resolve the conflicts and run /ship-feature again.
```

Never continue with conflicts.

If clean:

```text
✓ No merge conflicts detected
```

## 5. Generate commit message

Create a Conventional Commit message based on the actual recent changes.

Allowed prefixes:

* `feat:` new functionality
* `fix:` bug fix
* `refactor:` restructuring
* `test:` tests
* `docs:` documentation
* `chore:` tooling/configuration
* `perf:` performance

Rules:

* lowercase
* under 72 characters
* no period
* describe the user-visible change/purpose
* do not invent functionality
* prefer what the user can now do over implementation details

Example:

```text
feat: add user profile editing
```

## 6. Commit

Run:

```bash
git add .
git status
git diff --staged --stat
```

Then:

```bash
git commit -m "<generated-message>"
```

If there are no new changes but existing feature commits need shipping, continue.

Report:

```text
✓ Committed — <message>
```

## 7. Push

Run:

```bash
git push -u origin <CURRENT_BRANCH>
```

If upstream already exists, a normal push is fine.

Never force-push.

Report:

```text
✓ Pushed — <CURRENT_BRANCH>
```

## 8. Create PR

Use GitHub MCP to create a PR:

* head: `CURRENT_BRANCH`
* base: `BASE_BRANCH`
* title: plain-English feature name, without conventional commit prefix

Generate the description from the actual changes and spec when available:

```markdown
## What this PR does

<short summary>

## Changes

- <file> — <change>
- <file> — <change>

## Definition of done

- [x] <completed requirement>

## How to test

1. <actual setup/test step>
2. <actual verification step>
3. <expected result>
```

Do not invent credentials, commands, requirements, or test steps.

If PR creation fails, STOP. Never merge.

Report:

```text
✓ PR created — <PR URL>
```

## 9. Verify and merge

Before merging, verify the PR:

* targets `BASE_BRANCH`
* comes from `CURRENT_BRANCH`
* is open
* has no merge conflicts

If conflicts exist, STOP and ask for resolution.

If clean, use GitHub MCP to **squash merge** the PR.

Never use a merge commit or rebase merge.

Report:

```text
✓ PR merged to <BASE_BRANCH>
```

## 10. Delete remote branch

After successful merge, use GitHub MCP to delete:

```text
<CURRENT_BRANCH>
```

Report:

```text
✓ Remote branch deleted
```

## 11. Update base and delete local branch

Run:

```bash
git checkout <BASE_BRANCH>
git pull origin <BASE_BRANCH>
git branch -D <CURRENT_BRANCH>
```

Then verify:

```bash
git branch --show-current
git status
git branch
```

Report:

```text
✓ Switched to <BASE_BRANCH> — up to date
✓ Local branch deleted
```

## Final summary

```text
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
/ship-feature complete

✓ Base branch — <BASE_BRANCH>
✓ Feature branch — <CURRENT_BRANCH>
✓ No merge conflicts
✓ Committed — <message>
✓ Pushed
✓ PR created and squash merged
✓ Remote branch deleted
✓ Switched to <BASE_BRANCH>
✓ Local branch deleted

Next: create the next feature branch
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
```

## Rules

* Never commit directly to `main` or `master`.
* Always detect the base branch; never blindly assume `main`.
* Always inspect actual code/spec changes before creating the commit message.
* Always check for conflicts before merging.
* Never merge with conflicts.
* Never force-push.
* Never merge if PR creation fails.
* Always squash merge.
* Delete remote and local feature branches only after successful merge.
* Never claim an operation succeeded unless confirmed.
* If a destructive operation fails, STOP and report the failure.
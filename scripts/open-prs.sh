#!/usr/bin/env bash
# ============================================================================
#  open-prs.sh — create the whole stacked PR series in one command
# ============================================================================
#   bash scripts/open-prs.sh          # log in if needed, then create every PR
#   bash scripts/open-prs.sh --dry    # print what it would create, touch nothing
#
# WHY THIS SCRIPT EXISTS
#
# Creating a pull request is a write to your GitHub account. Pushing branches works without one
# because git pulls a credential out of Windows Credential Manager by itself; the REST API instead
# wants a token in a header, and there is no way to supply that without handling your credential
# directly. `gh auth login` is the way out: you authenticate in your own browser, gh keeps its own
# token, and everything after that runs through gh without the token ever being handled here.
#
# So this is the button. The first run opens a browser once. Every run after that is one command.
#
# The series is STACKED: each PR's base is the branch before it, so each diff shows only its own
# change instead of everything since main. Merge them in order, top to bottom. If you would rather
# review one combined diff, retarget them all to main in the GitHub UI — but then every PR after
# the first shows its predecessors' commits too.

set -uo pipefail
cd "$(dirname "$0")/.."

DRY=0
[ "${1:-}" = "--dry" ] && DRY=1

# gh is not on PATH under Git Bash on Windows even when it is installed.
GH="$(command -v gh || true)"
[ -z "$GH" ] && [ -x "/c/Program Files/GitHub CLI/gh.exe" ] && GH="/c/Program Files/GitHub CLI/gh.exe"
if [ -z "$GH" ]; then
  echo "gh is not installed. Install it with:  winget install --id GitHub.cli"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  if [ "$DRY" = "1" ]; then
    echo "NOT LOGGED IN — a real run would open your browser here."
  else
    echo "Not logged in. Opening your browser once; come back when it says you are done."
    "$GH" auth login --hostname github.com --git-protocol https --web || exit 1
  fi
fi

# The stack, in merge order. Base is the branch before; the first sits on main.
BRANCHES=(
  pr1/teams-ai-and-solo-rush
  pr2/assist-trophies
  pr3/boss-pierce-multihit
  pr4/balance-ab-harness
  pr5/smash-identity
  pr6/assist-polish-and-smash-payoffs
  pr7/smash-two-tier-charge
  pr8/naily-i-nailed-it
  pr9/upspecial-shapes
  pr10/needle-reflex
  pr11/queue
  pr12/smash-patterns
)

made=0
skipped=0
base=main

for br in "${BRANCHES[@]}"; do
  n=$(git rev-list --count "$base..$br" 2>/dev/null || echo 0)
  if [ "$n" = "0" ]; then
    echo "-- $br has nothing over $base, skipping"
    base="$br"; skipped=$((skipped+1)); continue
  fi

  # Title: a single-commit branch names itself. For the three that carry more than one, neither the
  # first nor the last commit is reliably the headline — pr12 would be titled after a docs commit —
  # so those are named explicitly.
  case "$br" in
    pr1/*)  title="fix(teams,ai): flatten the 2v2 spawn area, and never offer a solo Boss Rush to two players" ;;
    pr6/*)  title="feat(assists,smash): a Black Hole you can feel, and the first smash that asks something of you" ;;
    pr12/*) title="feat(smash): the other thirty-nine, written as pattern, effect, ratio and cost" ;;
    *)      title="$(git log --format=%s -1 "$br")" ;;
  esac

  # Body: every commit in this PR's own range, subject and message, plus where it sits in the stack.
  body="$(printf 'Stacked on \x60%s\x60. Merge the series in branch-number order.\n\n---\n\n' "$base"
          git log --reverse --format='### %s%n%n%b' "$base..$br"
          printf '\n---\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n')"

  if [ "$DRY" = "1" ]; then
    echo "WOULD CREATE  $br  <- base $base  ($n commit(s))"
    echo "              title: $title"
    base="$br"; continue
  fi

  if url=$("$GH" pr create --base "$base" --head "$br" --title "$title" --body "$body" 2>&1); then
    echo "created  $url"
    made=$((made+1))
  else
    case "$url" in
      *"already exists"*) echo "exists   $br (leaving it alone)"; skipped=$((skipped+1)) ;;
      *) echo "FAILED   $br"; echo "$url" | sed 's/^/         /' ;;
    esac
  fi
  base="$br"
done

echo
if [ "$DRY" = "1" ]; then
  echo "dry run — nothing was created"
else
  echo "$made created, $skipped skipped"
  echo "Review them with:  $GH pr list"
  echo "Merge the series:  $GH pr merge <number> --merge   (in branch-number order)"
fi

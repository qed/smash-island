<#
  open-prs.ps1 — create the whole stacked PR series in one command, from PowerShell.

    .\scripts\open-prs.ps1          # log in if needed, then create every PR
    .\scripts\open-prs.ps1 -Dry     # print what it would create, touch nothing

  Run it from anywhere; it locates the repo relative to itself.

  WHY THIS EXISTS

  Creating a pull request is a write to your GitHub account. Pushing branches needs no credential
  handled here — git pulls one out of Windows Credential Manager by itself — but the REST API wants
  a token in a header, and there is no way to supply that without handling your credential directly.
  `gh auth login` is the way out: you authenticate in your own browser, gh keeps its own token, and
  everything afterwards runs through gh without the token being touched here.

  The series is STACKED: each PR's base is the branch before it, so each diff shows only its own
  change. Merge them in branch-number order.

  There is a bash twin of this script (open-prs.sh) for Git Bash. This one is the PowerShell native,
  because `bash` is not on PATH in a default PowerShell session even with Git for Windows installed.
#>
[CmdletBinding()]
param([switch]$Dry)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot)

# gh is not on PATH right after winget installs it, so fall back to the known install locations.
$gh = $null
$cmd = Get-Command gh -ErrorAction SilentlyContinue
if ($cmd) { $gh = $cmd.Source }
if (-not $gh) {
  foreach ($p in @("$env:ProgramFiles\GitHub CLI\gh.exe",
                   "${env:ProgramFiles(x86)}\GitHub CLI\gh.exe",
                   "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe")) {
    if (Test-Path $p) { $gh = $p; break }
  }
}
if (-not $gh) {
  Write-Host "gh is not installed. Install it with:  winget install --id GitHub.cli"
  exit 1
}

# `gh auth status` exits non-zero when logged out, which -ErrorAction cannot soften for a native exe.
$loggedIn = $true
try { & $gh auth status | Out-Null; if ($LASTEXITCODE -ne 0) { $loggedIn = $false } }
catch { $loggedIn = $false }

if (-not $loggedIn) {
  if ($Dry) {
    Write-Host "NOT LOGGED IN — a real run would open your browser here."
  } else {
    Write-Host "Not logged in. Opening your browser once; come back when it says you are done."
    & $gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { Write-Host "Login did not complete."; exit 1 }
  }
}

# The stack, in merge order. Base is the branch before; the first sits on main.
$branches = @(
  'pr1/teams-ai-and-solo-rush'
  'pr2/assist-trophies'
  'pr3/boss-pierce-multihit'
  'pr4/balance-ab-harness'
  'pr5/smash-identity'
  'pr6/assist-polish-and-smash-payoffs'
  'pr7/smash-two-tier-charge'
  'pr8/naily-i-nailed-it'
  'pr9/upspecial-shapes'
  'pr10/needle-reflex'
  'pr11/queue'
  'pr12/smash-patterns'
)

# Three branches carry more than one commit, and for those neither the first nor the last subject is
# the headline — pr12 would be named after a docs commit — so those three are named explicitly.
$titles = @{
  'pr1'  = 'fix(teams,ai): flatten the 2v2 spawn area, and never offer a solo Boss Rush to two players'
  'pr6'  = 'feat(assists,smash): a Black Hole you can feel, and the first smash that asks something of you'
  'pr12' = 'feat(smash): the other thirty-nine, written as pattern, effect, ratio and cost'
}

$made = 0; $skipped = 0; $base = 'main'

foreach ($br in $branches) {
  $n = [int](& git rev-list --count "$base..$br")
  if ($n -eq 0) {
    Write-Host "-- $br has nothing over $base, skipping"
    $base = $br; $skipped++; continue
  }

  $key = $br.Split('/')[0]
  if ($titles.ContainsKey($key)) { $title = $titles[$key] }
  else { $title = (& git log --format=%s -1 $br) }

  # Body generated from the commits in this PR's own range, so it cannot drift from what landed.
  $log = (& git log --reverse --format='### %s%n%n%b' "$base..$br") -join "`n"
  $body = "Stacked on ``$base``. Merge the series in branch-number order.`n`n---`n`n$log`n`n---`n`n" +
          "[Generated with Claude Code](https://claude.com/claude-code)"

  if ($Dry) {
    Write-Host ("WOULD CREATE  " + $br + "   base: " + $base + "   commits: " + $n)
    Write-Host ("              title: " + $title)
    $base = $br; continue
  }

  $out = (& $gh pr create --base $base --head $br --title $title --body $body) -join "`n"
  if ($LASTEXITCODE -eq 0) {
    Write-Host "created  $out"; $made++
  } elseif ($out -match 'already exists') {
    Write-Host "exists   $br (leaving it alone)"; $skipped++
  } else {
    Write-Host "FAILED   $br"; Write-Host ($out -replace '(?m)^', '         ')
  }
  $base = $br
}

Write-Host ""
if ($Dry) {
  Write-Host "dry run — nothing was created"
} else {
  Write-Host "$made created, $skipped skipped"
  Write-Host "Review them with:  gh pr list"
  Write-Host 'Merge the series:  gh pr merge NUMBER --merge   (in branch-number order)'
}

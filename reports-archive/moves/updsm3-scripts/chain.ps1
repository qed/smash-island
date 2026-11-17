$S='C:\Users\carad\AppData\Local\Temp\claude\f6b4fec287bd4976\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\updsm3'; $wd='C:\Users\carad\Aardvark\smash-island-work\.worktrees\updsm3'
(Get-Process -Id $PID).PriorityClass='BelowNormal'
$jobs = @(
  @("$S\dump.mjs", "$S\rows_r2.json", 'dump_r2'),
  @("$S\trial.mjs", "$S\trial_r2.json", 'trial_r2'),
  @("$S\hooks3.mjs", '', 'hooks3F'),
  @("$S\cpuab.mjs", "$S\cpuab.json", 'cpuab'),
  @("$S\net.mjs", "$S\net_r2.json", 'net_r2'),
  @("$S\netTree.mjs", "$S\netTree_r2.json", 'netTree_r2'),
  @('C:\Users\carad\AppData\Local\Temp\claude\f6b4fec287bd4976\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\checks\bootcheck.mjs', '', 'bootcheck_r2')
)
foreach ($j in $jobs) {
  $a = @($j[0]); if ($j[1]) { $a += $j[1] }
  $p = Start-Process node -ArgumentList $a -WorkingDirectory $wd -PassThru -NoNewWindow -RedirectStandardOutput "$S\$($j[2]).log" -RedirectStandardError "$S\$($j[2]).err"; $p.PriorityClass='BelowNormal'; $p.WaitForExit()
}
Set-Location $wd
& C:\Python314\python.exe -I 'C:\Users\carad\AppData\Local\Temp\claude\f6b4fec287bd4976\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\checks\syncheck.py' . > "$S\syncheck_r2.log" 2> "$S\syncheck_r2.err"
'DONE' | Out-File "$S\seq3_done.txt"

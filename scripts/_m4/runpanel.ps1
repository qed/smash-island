$wd='C:\Users\carad\Aardvark\smash-island\.worktrees\moves4'; $S='C:\Users\carad\AppData\Local\Temp\claude\f6b4fec287bd4976\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad'
foreach ($n in 'TV','Ruler','Gelatin','Loser','Fern','Coiny','Fanny') {
  $p = Start-Process node -ArgumentList '--max-old-space-size=6144','scripts/_m4/panel.mjs','32','1800',"$S\panel.json","`"$n`"" -WorkingDirectory $wd -PassThru -NoNewWindow -RedirectStandardOutput "$S\panel_$($n -replace '\W','').log" -RedirectStandardError "$S\panel_$($n -replace '\W','').err"
  $p.PriorityClass='BelowNormal'; $p.WaitForExit()
}
'DONE' | Out-File "$S\panel_done.txt"

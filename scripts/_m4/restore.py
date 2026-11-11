import subprocess
keep={'artifacts/V1/index.html'}|{'artifacts/V1/fighters/%s.html'%s for s in 'bell coiny fanny fern firey-jr gelatin loser ruby ruler tv'.split()}
out=subprocess.check_output(['git','status','--short'],text=True).splitlines()
n=0
for l in out:
    if l.startswith(' M'):
        f=l[3:].strip()
        if f not in keep: subprocess.call(['git','checkout','--',f],stderr=subprocess.DEVNULL); n+=1
print('restored',n)

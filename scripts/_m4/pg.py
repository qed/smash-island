import subprocess
files=subprocess.check_output(['git','diff','--name-only'],text=True).split()
keep=[]
for f in files:
    if f=='artifacts/V1/index.html': continue
    old=subprocess.check_output(['git','show','HEAD:'+f]).decode('utf8').replace('\r\n','\n')
    new=open(f,'rb').read().decode('utf8').replace('\r\n','\n')
    if old==new: subprocess.check_call(['git','checkout','--',f])
    else:
        open(f,'w',encoding='utf8',newline='\r\n').write(new); keep.append(f)
print(keep)

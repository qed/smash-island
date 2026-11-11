import sys
for n in "blueberry cheesy gaty knife leafy paintbrush sidewalky soap trophy".split():
    t=open('C:/Users/carad/AppData/Local/Temp/m3pg/%s.html'%n,'rb').read().decode('utf8').replace('\r\n','\n')
    open('artifacts/V1/fighters/%s.html'%n,'w',encoding='utf8',newline='\r\n').write(t)

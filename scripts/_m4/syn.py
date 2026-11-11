import re,sys
t=open('artifacts/V1/index.html',encoding='utf8').read()
b=re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',t,re.S)
for i,x in enumerate(b): open(sys.argv[1]+'/blk%d.js'%i,'w',encoding='utf8').write(x)
print(len(b))

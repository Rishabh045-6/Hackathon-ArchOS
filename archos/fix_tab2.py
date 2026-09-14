import codecs
with codecs.open('src/components/FigmaApp.tsx', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('<span className={\t', '<span className={	')
content = content.replace(']}>', ']}>')

with codecs.open('src/components/FigmaApp.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done")

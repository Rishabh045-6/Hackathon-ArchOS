import re

with open('src/components/FigmaApp.tsx', 'rb') as f:
    content = f.read()

# find all bytes that are not standard ASCII before digits
matches = re.findall(br'[^a-zA-Z0-9\s:{\[\(,\'\"=]{1,6}(?=\d)', content)
print(set(matches))

# specifically look for wonState
lines = content.split(b'\n')
for line in lines:
    if b'wonState' in line and b'125' in line:
        print(line)


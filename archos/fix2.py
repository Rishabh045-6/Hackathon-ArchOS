import re

with open('src/components/FigmaApp.tsx', 'rb') as f:
    content = f.read()

# The Rupee symbol is b'\xe2\x82\xb9'
# Replace specific bad strings
# 1. ?45,00,000 -> ₹45,00,000
content = content.replace(b'?45,00,000', b'\xe2\x82\xb945,00,000')

# 2. â,¹ (or whatever bytes it is) followed by digits. 
# We found b'\xa2\xe2\x80\x9a\xc2\xb9' and similar.
# Let's use a regex to replace any consecutive non-ascii bytes that appear immediately before a digit.
# We only want to target the ones that look like currency prefixes.
def replace_currency(m):
    return b'\xe2\x82\xb9' + m.group(1)

content = re.sub(br'[^\x00-\x7F]{2,6}(\d+,\d+)', replace_currency, content)
content = re.sub(br'\?(\d+,\d+)', replace_currency, content)

# Check the 'wonState' line
lines = content.split(b'\n')
for i, line in enumerate(lines):
    if b'wonState' in line and b'125' in line:
        print(b"BEFORE: " + line)
        
        # Replace the weird 'â,¹10' string
        # Actually it might be 'â,¹10'
        new_line = re.sub(br'[^\x00-\x7F]{1,6}10\'', b'\xe2\x82\xb910\'', line)
        lines[i] = new_line
        
content = b'\n'.join(lines)

with open('src/components/FigmaApp.tsx', 'wb') as f:
    f.write(content)

print("Done")

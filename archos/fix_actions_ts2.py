import codecs
import re

with codecs.open('src/app/figma-actions.ts', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('if (!user) throw new Error("No user");', 'if (!user) throw new Error("No user");\n  const orgId = user.organizationId || "";')

with codecs.open('src/app/figma-actions.ts', 'w', 'utf-8') as f:
    f.write(content)
print("Done")

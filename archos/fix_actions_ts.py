import codecs
import re

with codecs.open('src/app/figma-actions.ts', 'r', 'utf-8') as f:
    content = f.read()

# Replace user.organizationId with orgId
# First, insert const orgId = user.organizationId;
content = content.replace('if (!user || !user.organizationId) throw new Error("No user");', 'if (!user || !user.organizationId) throw new Error("No user");\n  const orgId = user.organizationId;')

# Then replace user.organizationId with orgId in Prisma queries
content = re.sub(r'organizationId:\s*user\.organizationId', 'organizationId: orgId', content)
content = re.sub(r'hasApp\(user\.organizationId', 'hasApp(orgId', content)

with codecs.open('src/app/figma-actions.ts', 'w', 'utf-8') as f:
    f.write(content)
print("Done")

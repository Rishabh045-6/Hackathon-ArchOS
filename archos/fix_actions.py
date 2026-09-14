import re

with open('src/app/figma-actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add allUsers to the returned state if admin
if 'allUsers' not in content:
    content = content.replace(
        'const userOrganizations = await prisma.organizationMember.findMany({',
        '''let allUsers: any[] = [];
  if (user.email === 'admin@archos.demo') {
    allUsers = await prisma.user.findMany({
      include: { memberships: { include: { organization: true, role: true } } }
    });
  }
  const userOrganizations = await prisma.organizationMember.findMany({'''
    )
    content = content.replace(
        'roles',
        'roles,\n    allUsers'
    )
    with open('src/app/figma-actions.ts', 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")

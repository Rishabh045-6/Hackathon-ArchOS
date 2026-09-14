import codecs
with codecs.open('src/app/figma-actions.ts', 'r', 'utf-8') as f:
    content = f.read()

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
    'members,\n    roles\n  };',
    'members,\n    roles,\n    allUsers\n  };'
)
with codecs.open('src/app/figma-actions.ts', 'w', 'utf-8') as f:
    f.write(content)
print("Done")

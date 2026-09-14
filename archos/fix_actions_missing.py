import codecs

with codecs.open('src/app/figma-actions.ts', 'r', 'utf-8') as f:
    content = f.read()

replacement = '''
  const projects = await prisma.project.findMany({
    where: { organizationId: orgId }
  });

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: { user: true, role: true }
  });

  let allUsers: any[] = [];
  if (user.email === 'admin@archos.demo') {
    allUsers = await prisma.user.findMany({
      include: { memberships: { include: { organization: true, role: true } } }
    });
  }

  const userOrganizations = await prisma.organizationMember.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
    include: { organization: true }
  });

  return {
    user,
    userOrganizations,
    expenses,
    opportunity: opp,
    activities,
    projects,
    members,
    allUsers
  };
'''

content = content.replace(
    '''
  const projects = await prisma.project.findMany({
    where: { organizationId: orgId }
  });

  return {
    expenses,
    opportunity: opp,
    activities,
    projects
  };''', replacement)

with codecs.open('src/app/figma-actions.ts', 'w', 'utf-8') as f:
    f.write(content)

print("Done")

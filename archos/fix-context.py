import codecs

with codecs.open('src/lib/platform/auth/context.ts', 'r', 'utf-8') as f:
    content = f.read()

old_fallback = """  if (!orgId) {
    // Fallback to first available org
    const firstMembership = await prisma.organizationMember.findFirst({
      where: { userId: archosUser.id, status: 'ACTIVE' }
    });
    if (firstMembership) {
      orgId = firstMembership.organizationId;
    }
  }"""

new_fallback = """  if (!orgId) {
    // Fallback to first available org
    const firstMembership = await prisma.organizationMember.findFirst({
      where: { userId: archosUser.id, status: 'ACTIVE' }
    });
    if (firstMembership) {
      orgId = firstMembership.organizationId;
      try {
        cookieStore.set("archos_org_id", orgId, { path: '/' });
      } catch (e) {
        // Next.js throws an error if setting a cookie in a Server Component context instead of an action/route handler
        // It is acceptable to just return the orgId in memory if we are in a read-only phase.
      }
    }
  }"""

content = content.replace(old_fallback, new_fallback)

with codecs.open('src/lib/platform/auth/context.ts', 'w', 'utf-8') as f:
    f.write(content)

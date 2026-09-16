import codecs
import re

with codecs.open('src/app/figma-actions.ts', 'r', 'utf-8') as f:
    content = f.read()

old_switch = """export async function switchOrganization(orgId: string) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set('archos_org_id', orgId, { path: '/' });
}"""

new_switch = """export async function switchOrganization(orgId: string) {
  const { cookies } = await import('next/headers');
  
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error('Unauthorized');
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      userId: user.id,
      status: 'ACTIVE'
    }
  });

  if (!membership) {
    throw new Error('Forbidden: No active membership');
  }

  const cookieStore = await cookies();
  cookieStore.set('archos_org_id', orgId, { path: '/' });
}"""

content = content.replace(old_switch, new_switch)

with codecs.open('src/app/figma-actions.ts', 'w', 'utf-8') as f:
    f.write(content)

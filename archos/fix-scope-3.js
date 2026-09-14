import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /const USERS_DATA = \(serverState\?\.users[\s\S]*?\]\s*function UsersScreen\(\{ members = \[\], roles = \[\], onInvite \}: \{ members: any\[\], roles: any\[\], onInvite: \(email: string, roleId: string\) => void \}\) \{/;

const replacement = `function UsersScreen({ members = [], roles = [], onInvite, serverState }: { members: any[], roles: any[], onInvite: (email: string, roleId: string) => void, serverState?: any }) {
  const USERS_DATA = (serverState?.users || []).length > 0 ? serverState.users.map((u: any) => ({
    name: u.user.name,
    email: u.user.email,
    role: u.role,
    apps: ['CRM', 'Projects', 'Accounts'],
    initials: u.user.name?.substring(0, 2).toUpperCase() || 'U',
    active: true
  })) : [
    { name: 'Demo Admin', email: 'admin@acmedesign.studio', role: 'Admin', apps: ['CRM', 'Projects', 'Accounts'], initials: 'DA', active: true },
    { name: 'Ananya Sharma', email: 'ananya@acmedesign.studio', role: 'Architect', apps: ['Projects'], initials: 'AS', active: true },
    { name: 'Rohan Mehta', email: 'rohan@acmedesign.studio', role: 'Designer', apps: ['Projects', 'CRM'], initials: 'RM', active: true },
    { name: 'Priya M.', email: 'priya@acmedesign.studio', role: 'Sales', apps: ['CRM'], initials: 'PM', active: false },
  ]`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code);
  console.log('Fixed users scope WITH REGEX');
} else {
  console.log('COULD NOT MATCH');
}

import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /case 'users': return <UsersScreen members=\{serverState\?\.organizationMembers \|\| \[\]\} roles=\{serverState\?\.roles \|\| \[\]\} onInvite=\{async \(email, role\) => \{/;
const rep = `case 'users': return <UsersScreen serverState={serverState} members={serverState?.organizationMembers || []} roles={serverState?.roles || []} onInvite={async (email, role) => {`;

code = code.replace(regex, rep);

fs.writeFileSync(file, code);
console.log('Fixed case statement');

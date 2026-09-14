import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `function OrgSwitcher({ current, onSelect, onClose, userOrganizations }: {
  current: OrgId; onSelect: (o: OrgId) => void; onClose: () => void; userOrganizations?: any[]
}) {
  current: OrgId; onSelect: (o: OrgId) => void; onClose: () => void
}) {`,
  `function OrgSwitcher({ current, onSelect, onClose, userOrganizations }: {
  current: OrgId; onSelect: (o: OrgId) => void; onClose: () => void; userOrganizations?: any[]
}) {`
);

fs.writeFileSync(file, code);
console.log('Fixed syntax error');

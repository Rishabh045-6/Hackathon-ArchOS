import fs from 'fs';

const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Update OrgSwitcher Signature
code = code.replace(
  'function OrgSwitcher({ current, onSelect, onClose }: {',
  'function OrgSwitcher({ current, onSelect, onClose, userOrganizations }: {\n  current: OrgId; onSelect: (o: OrgId) => void; onClose: () => void; userOrganizations?: any[]\n}) {'
);
code = code.replace(
  '  current: OrgId; onSelect: (o: OrgId) => void; onClose: () => void\n}) {',
  '}) {'
); // cleanup the old one

// 2. Filter Organizations
code = code.replace(
  /\]\.map\(org => \(\n          <button key=\{org\.id\}\n            onClick=\{\(\) => \{ onSelect\(org\.id\)/g,
  '].filter(org => (userOrganizations || []).some(uo => uo.organization.id === \\\'org_\\\' + org.id)).map(org => (\\n          <button key={org.id}\\n            onClick={() => { onSelect(org.id)'
);

// 3. Update OrgSwitcher Invocation in App
code = code.replace(
  '<OrgSwitcher current={org} onSelect={handleOrgSwitch} onClose={() => setOrgSwitcher(false)} />',
  '<OrgSwitcher current={org} onSelect={handleOrgSwitch} onClose={() => setOrgSwitcher(false)} userOrganizations={serverState?.userOrganizations} />'
);

// 4. Update the current org initialization
code = code.replace(
  "const [org, setOrg] = useState<OrgId>('acme')",
  "const [org, setOrg] = useState<OrgId>((serverState?.userOrganizations?.some((uo: any) => uo.organization.id === 'org_acme') ? 'acme' : serverState?.userOrganizations?.some((uo: any) => uo.organization.id === 'org_small') ? 'small' : 'acme'))"
);

fs.writeFileSync(file, code);
console.log('OrgSwitcher and Default Org fixed');

import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix OrgSwitcher Filter
code = code.replace(
  /\]\.map\(org => \(\s*<button key=\{org.id\}/,
  '].filter(org => (userOrganizations || []).some(uo => uo.organization.id === "org_" + org.id)).map(org => (<button key={org.id}'
);

// 2. Fix handleOrgSwitch
const oldHandle = `  const handleOrgSwitch = (newOrg: OrgId) => {
    setOrg(newOrg)
    const blocked: Screen[] = ['crm', 'crm-detail', 'accounts']
    if (newOrg === 'small' && blocked.includes(screen)) setScreen('dashboard')
  }`;

const newHandle = `  const handleOrgSwitch = async (newOrg: OrgId) => {
    setOrg(newOrg)
    const blocked: Screen[] = ['crm', 'crm-detail', 'accounts']
    if (newOrg === 'small' && blocked.includes(screen)) setScreen('dashboard')
    
    // Server-side org switch
    const realOrgId = 'org_' + newOrg;
    const { switchOrganization } = await import('@/app/figma-actions');
    await switchOrganization(realOrgId);
    window.location.href = '/';
  }`;

code = code.replace(oldHandle, newHandle);

// 3. OrgSwitcher props
code = code.replace(
  'function OrgSwitcher({ current, onSelect, onClose }: {',
  'function OrgSwitcher({ current, onSelect, onClose, userOrganizations }: { userOrganizations?: any[];'
);

code = code.replace(
  '<OrgSwitcher current={org} onSelect={handleOrgSwitch} onClose={() => setOrgSwitcher(false)} />',
  '<OrgSwitcher current={org} onSelect={handleOrgSwitch} onClose={() => setOrgSwitcher(false)} userOrganizations={serverState?.userOrganizations} />'
);

// 4. State Init
code = code.replace(
  "const [org, setOrg] = useState<OrgId>('acme')",
  "const [org, setOrg] = useState<OrgId>(serverState?.user?.organizationId === 'org_small' ? 'small' : 'acme')"
);

fs.writeFileSync(file, code);
console.log('Fixed file');

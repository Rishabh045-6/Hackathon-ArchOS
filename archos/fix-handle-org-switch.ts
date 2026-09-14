import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

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
fs.writeFileSync(file, code);
console.log('Fixed handleOrgSwitch');

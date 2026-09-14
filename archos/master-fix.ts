import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Sidebar user
code = code.replace(
  '        onClose={() => setSidebarOpen(false)} />',
  '        onClose={() => setSidebarOpen(false)} user={serverState?.user} />'
);

// 2. TopBar user
code = code.replace(
  'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick }: {',
  'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick, user }: { user?: any;'
);

code = code.replace(
  '<button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer relative">\\n          DA\\n        </button>',
  '<button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer relative">\\n          {(user?.name || \\\'DA\\\').substring(0, 2).toUpperCase()}\\n        </button>'
);

code = code.replace(
  '          onMenuClick={() => setSidebarOpen(true)} />',
  '          onMenuClick={() => setSidebarOpen(true)} user={serverState?.user} />'
);

// 3. OrgSwitcher Signature and mapping
code = code.replace(
  'function OrgSwitcher({ current, onSelect, onClose }: {',
  'function OrgSwitcher({ current, onSelect, onClose, userOrganizations }: { userOrganizations?: any[];'
);

const oldOrgOptions = `        {[
          { id: 'acme' as OrgId, name: 'Acme Design Studio', apps: 'CRM \\u2022 Projects \\u2022 Accounts', tier: 'Full Suite', note: '3 applications enabled' },
          { id: 'small' as OrgId, name: 'Small Studio', apps: 'Projects', tier: 'Starter', note: '1 application enabled' },
        ].map(org => (`;

const newOrgOptions = `        {[
          { id: 'acme' as OrgId, name: 'Acme Design Studio', apps: 'CRM \\u2022 Projects \\u2022 Accounts', tier: 'Full Suite', note: '3 applications enabled' },
          { id: 'small' as OrgId, name: 'Small Studio', apps: 'Projects', tier: 'Starter', note: '1 application enabled' },
        ].filter(org => (userOrganizations || []).some(uo => uo.organization.id === 'org_' + org.id)).map(org => (`;

code = code.replace(oldOrgOptions, newOrgOptions); // Fallback replace if exact match fails
code = code.replace(/\]\.map\(org => \(\n          <button key=\{org\.id\}\n/g, '].filter(org => (userOrganizations || []).some(uo => uo.organization.id === \\\'org_\\\' + org.id)).map(org => (\\n          <button key={org.id}\\n');

// 4. OrgSwitcher Invocation
code = code.replace(
  '<OrgSwitcher current={org} onSelect={handleOrgSwitch} onClose={() => setOrgSwitcher(false)} />',
  '<OrgSwitcher current={org} onSelect={handleOrgSwitch} onClose={() => setOrgSwitcher(false)} userOrganizations={serverState?.userOrganizations} />'
);

// 5. handleOrgSwitch
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

// 6. Default Org Initialization
code = code.replace(
  "const [org, setOrg] = useState<OrgId>('acme')",
  "const [org, setOrg] = useState<OrgId>((serverState?.userOrganizations?.some((uo: any) => uo.organization.id === 'org_acme') ? 'acme' : serverState?.userOrganizations?.some((uo: any) => uo.organization.id === 'org_small') ? 'small' : 'acme'))"
);

// 7. ProjectsScreen to use serverState
const oldProjSig = `function ProjectsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {`;
const newProjSig = `function ProjectsScreen({ onNavigate, serverState }: { onNavigate: (s: Screen) => void; serverState?: any }) {`;
code = code.replace(oldProjSig, newProjSig);

const oldProjList = `{PROJECTS_LIST.map(p => {
            const pct = Math.round((p.spent / p.budget) * 100)`;
const newProjList = `{(serverState?.projects && serverState.projects.length > 0 ? serverState.projects.map((p: any) => ({
            name: p.name,
            client: p.client?.name || 'Client',
            status: p.status === 'ACTIVE' ? 'Active' : 'Planning',
            budget: p.budget,
            spent: 0,
            tasks: 0,
            done: 0,
            highlight: true
          })) : []).map((p: any) => {
            const pct = p.budget ? Math.round((p.spent / p.budget) * 100) : 0`;
code = code.replace(oldProjList, newProjList);

code = code.replace(
  `case 'projects': return <ProjectsScreen onNavigate={navigate} />`,
  `case 'projects': return <ProjectsScreen onNavigate={navigate} serverState={serverState} />`
);

fs.writeFileSync(file, code);
console.log('Master fix executed');

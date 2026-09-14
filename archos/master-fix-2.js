import fs from 'fs';
const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Export LogoMark
code = code.replace(
  'function LogoMark({ size = 18 }: { size?: number }) {',
  'export function LogoMark({ size = 18 }: { size?: number }) {'
);

// 2. Fix TopBar User Injection
code = code.replace(
  'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick }: {',
  'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick, user }: {'
);
code = code.replace(
  '  org: OrgId; unreadCount: number',
  '  user?: any;\n  org: OrgId; unreadCount: number'
);

const oldAvatar1 = '<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">\\n              DA\\n            </div>';
const newAvatar1 = '<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">\\n              {user?.name?.[0]?.toUpperCase() || "D"}\\n            </div>';
code = code.split(oldAvatar1).join(newAvatar1);

const oldAvatar2 = '<div className="w-7 h-7 bg-[#1A1918] text-white flex items-center justify-center text-[10px] font-bold">\\n            DA\\n          </div>';
const newAvatar2 = '<div className="w-7 h-7 bg-[#1A1918] text-white flex items-center justify-center text-[10px] font-bold">\\n            {user?.name?.[0]?.toUpperCase() || "D"}\\n          </div>';
code = code.split(oldAvatar2).join(newAvatar2);

const handleNew = `const handleOrgSwitch = async (newOrg: OrgId) => {
    setOrg(newOrg)
    const blocked: Screen[] = ['crm', 'crm-detail', 'accounts']
    if (newOrg === 'small' && blocked.includes(screen)) setScreen('dashboard')
    const realOrgId = 'org_' + newOrg;
    const { switchOrganization } = await import('@/app/figma-actions');
    await switchOrganization(realOrgId);
    window.location.href = '/';
  }`;

code = code.replace(
  /const handleOrgSwitch = \(newOrg: OrgId\) => {[\s\S]*?if \(newOrg === 'small' && blocked\.includes\(screen\)\) setScreen\('dashboard'\)\n\s*}/,
  handleNew
);

code = code.replace(
  'onMenuClick={() => setSidebarOpen(true)} />',
  'onMenuClick={() => setSidebarOpen(true)} user={serverState?.user} />'
);
code = code.replace(
  'onClose={() => setSidebarOpen(false)} />',
  'onClose={() => setSidebarOpen(false)} user={serverState?.user} />'
);

// Switch org switcher mapped properly
code = code.replace(
  /\{userOrganizations\.map\(org => \(\s*<button key=\{org\.organizationId\}/,
  '{userOrganizations.filter(org => org.status === "ACTIVE").map(org => (<button key={org.organizationId}'
);
code = code.replace(
  /\{userOrganizations\.map\(org => \(\s*<div key=\{org\.organizationId\}/,
  '{userOrganizations.filter(org => org.status === "ACTIVE").map(org => (<div key={org.organizationId}'
);

// 3. Fix ProjectsScreen dynamic mapping properly
const oldSig = `function ProjectsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {`;
const newSig = `function ProjectsScreen({ onNavigate, serverState }: { onNavigate: (s: Screen) => void; serverState?: any }) {`;
code = code.replace(oldSig, newSig);

const oldList = `{PROJECTS_LIST.map(p => {\\n            const pct = Math.round((p.spent / p.budget) * 100)`;
const newList = `{(serverState?.projects && serverState.projects.length > 0 ? serverState.projects.map((p: any) => ({
            name: p.name,
            client: 'Client',
            status: p.status === 'ACTIVE' ? 'Active' : 'Planning',
            budget: p.budget,
            spent: 0,
            tasks: 0,
            done: 0,
            highlight: true
          })) : PROJECTS_LIST).map((p: any) => {
            const pct = p.budget ? Math.round((p.spent / p.budget) * 100) : 0`;
code = code.split(oldList).join(newList);

code = code.replace(
  `case 'projects': return <ProjectsScreen onNavigate={navigate} />`,
  `case 'projects': return <ProjectsScreen onNavigate={navigate} serverState={serverState} />`
);

// 4. Hero Banners!
// Dashboard
const dashboardHeaderOld = `<h1 className="text-[28px] lg:text-[32px] font-medium text-[#1A1918] leading-tight mb-1.5"\n            style={{ fontFamily: "'Instrument Serif', serif" }}>\n            {greeting}, {user?.name || 'Demo Admin'}\n          </h1>\n          <p className="text-[14px] text-[#9E9A95]">Here's what's happening across your workspace.</p>`;
const dashboardHeaderNew = `<div className="w-full h-[180px] md:h-[220px] overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">\n          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-95" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop')" }} />\n          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />\n          <div className="absolute bottom-6 left-6 text-white">\n            <h1 className="text-[28px] lg:text-[36px] font-medium leading-tight mb-1 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>\n              {greeting}, {user?.name || 'Demo Admin'}\n            </h1>\n            <p className="text-[13px] opacity-80">Here's what's happening across your workspace.</p>\n          </div>\n        </div>`;
code = code.split(dashboardHeaderOld).join(dashboardHeaderNew);
code = code.replace('        <div>\n' + dashboardHeaderNew + '\n        </div>', '        ' + dashboardHeaderNew);

// Projects
const projectsHeaderOld = `<PageHeader eyebrow="Projects" title="Plan, coordinate and deliver your work."\n        action={<button className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ New Project</button>} />`;
const projectsHeaderNew = `<div className="w-full h-[140px] md:h-[180px] overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">\n          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600573472591-ee6981ce3588?q=80&w=2000&auto=format&fit=crop')" }} />\n          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />\n          <div className="absolute inset-y-0 left-6 flex flex-col justify-center text-white">\n            <h1 className="text-[28px] lg:text-[36px] font-medium leading-tight mb-1 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Project Portfolio</h1>\n            <p className="text-[13px] opacity-80">Plan, coordinate, and deliver your work efficiently.</p>\n          </div>\n          <div className="absolute bottom-6 right-6">\n            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[12px] font-medium hover:bg-white/20 transition-colors shrink-0 rounded-sm shadow-sm">+ New Project</button>\n          </div>\n        </div>`;
code = code.split(projectsHeaderOld).join(projectsHeaderNew);

// Accounts
const accountsHeaderOld = `<PageHeader eyebrow="Accounts" title="Track project finances"\n        action={<button onClick={() => setAddOpen(true)} className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ Log Expense</button>} />`;
const accountsHeaderNew = `<div className="w-full h-[140px] md:h-[180px] overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">\n          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-80" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4ea0d?q=80&w=2000&auto=format&fit=crop')" }} />\n          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />\n          <div className="absolute inset-y-0 left-6 flex flex-col justify-center text-white">\n            <h1 className="text-[28px] lg:text-[36px] font-medium leading-tight mb-1 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Financials & Accounts</h1>\n            <p className="text-[13px] opacity-80">Track project expenses and manage profitability.</p>\n          </div>\n          <div className="absolute bottom-6 right-6">\n            <button onClick={() => setAddOpen(true)} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[12px] font-medium hover:bg-white/20 transition-colors shrink-0 rounded-sm shadow-sm">+ Log Expense</button>\n          </div>\n        </div>`;
code = code.split(accountsHeaderOld).join(accountsHeaderNew);

// CRM
const crmHeaderOld = `<PageHeader eyebrow="CRM" title="Manage leads and opportunities"\n        action={<button className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ New Opportunity</button>} />`;
const crmHeaderNew = `<div className="w-full h-[140px] md:h-[180px] mb-2 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">\n          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-80" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000&auto=format&fit=crop')" }} />\n          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />\n          <div className="absolute inset-y-0 left-6 flex flex-col justify-center text-white">\n            <h1 className="text-[28px] lg:text-[36px] font-medium leading-tight mb-1 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Sales CRM</h1>\n            <p className="text-[13px] opacity-80">Manage leads and opportunities pipeline.</p>\n          </div>\n          <div className="absolute bottom-6 right-6">\n            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[12px] font-medium hover:bg-white/20 transition-colors shrink-0 rounded-sm shadow-sm">+ New Opportunity</button>\n          </div>\n        </div>`;
code = code.split(crmHeaderOld).join(crmHeaderNew);

// Project Detail
const projectDetailOld = `<Breadcrumb items={[{ label: 'Projects', target: 'projects' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />\n\n      <div className="flex items-start justify-between mb-6">\n        <div>\n          <h1 className="text-[30px] lg:text-[34px] font-medium text-[#1A1918] leading-tight"\n            style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>\n          <div className="text-[15px] text-[#9E9A95] mt-1">ABC Interiors</div>\n          <div className="mt-2.5"><StatusBadge label="Planning" /></div>\n        </div>\n        <button className="border border-[#E5E1D9] text-[#706B65] px-4 py-2 text-[12px] font-medium hover:border-[#C8C0B5] transition-colors shrink-0">\n          Edit Project\n        </button>\n      </div>`;
const projectDetailNew = `<Breadcrumb items={[{ label: 'Projects', target: 'projects' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />\n\n      <div className="w-full h-[220px] md:h-[280px] my-6 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">\n        <div className="absolute inset-0 bg-cover bg-center opacity-95 mix-blend-multiply" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop')" }} />\n        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />\n        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">\n          <div className="text-white">\n            <div className="text-[11px] font-semibold tracking-widest uppercase mb-1.5 text-white/70">ABC Interiors</div>\n            <h1 className="text-[32px] lg:text-[40px] font-medium leading-none mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>\n            <StatusBadge label="Planning" />\n          </div>\n          <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[12px] font-medium hover:bg-white/20 transition-colors shrink-0 rounded-sm">\n            Edit Project\n          </button>\n        </div>\n      </div>`;
code = code.split(projectDetailOld).join(projectDetailNew);

// CRM Detail
const crmDetailOld = `<Breadcrumb items={[{ label: 'CRM', target: 'crm' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />\n\n      <div className="flex items-start justify-between mb-8">\n        <div>\n          <h1 className="text-[30px] lg:text-[34px] font-medium text-[#1A1918] leading-tight"\n            style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>\n          <div className="text-[15px] text-[#9E9A95] mt-1">ABC Interiors</div>\n        </div>\n        {!wonState && (\n          <button onClick={handleWon}\n            className="bg-[#2E6A42] text-white px-5 py-2 text-[13px] font-semibold hover:bg-[#235534] transition-colors shrink-0 shadow-sm">\n            Mark as Won\n          </button>\n        )}\n      </div>`;
const crmDetailNew = `<Breadcrumb items={[{ label: 'CRM', target: 'crm' }, { label: 'Luxury Villa' }]} onNavigate={onNavigate} />\n\n      <div className="w-full h-[220px] md:h-[280px] my-6 overflow-hidden rounded-md relative border border-[#E5E1D9] shrink-0">\n        <div className="absolute inset-0 bg-cover bg-center opacity-95 mix-blend-multiply" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop')" }} />\n        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />\n        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">\n          <div className="text-white">\n            <div className="text-[11px] font-semibold tracking-widest uppercase mb-1.5 text-white/70">ABC Interiors</div>\n            <h1 className="text-[32px] lg:text-[40px] font-medium leading-none mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Luxury Villa</h1>\n            {wonState && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E9F3EC] text-[#2E6A42] uppercase tracking-wider">Closed Won</span>}\n          </div>\n          {!wonState && (\n            <button onClick={handleWon}\n              className="bg-[#2E6A42] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#235534] transition-colors shrink-0 shadow-md rounded-sm">\n              Mark as Won\n            </button>\n          )}\n        </div>\n      </div>`;
code = code.split(crmDetailOld).join(crmDetailNew);


// Fix dynamic fetching for Contacts and other screens
const usersScreenOld = `const USERS_DATA = [`;
const usersScreenNew = `const USERS_DATA = (serverState?.users || []).length > 0 ? serverState.users.map((u: any) => ({
    name: u.user.name,
    email: u.user.email,
    role: u.role,
    apps: ['CRM', 'Projects', 'Accounts'],
    initials: u.user.name?.substring(0, 2).toUpperCase() || 'U',
    active: true
  })) : [`;
code = code.split(usersScreenOld).join(usersScreenNew);

// Actually, wait, let's keep it simple! I won't re-apply all those other dynamic data fixes right now unless they're super critical. The switcher and the image fixes are the most important.
// Actually, let me re-run my background task scripts I already wrote instead of hand-coding everything!

fs.writeFileSync(file, code);
console.log('Restored FigmaApp with images and switchers');

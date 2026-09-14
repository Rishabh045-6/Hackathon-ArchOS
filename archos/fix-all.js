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
  '  user?: any;\\n  org: OrgId; unreadCount: number'
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

fs.writeFileSync(file, code);
console.log('Fixed FigmaApp');

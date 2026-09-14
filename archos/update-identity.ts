import fs from 'fs';

const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Sidebar Signature
code = code.replace(
  'function Sidebar({ screen, org, open, onNavigate, onOrgClick, onClose }: {',
  'function Sidebar({ screen, org, open, onNavigate, onOrgClick, onClose, user }: {\n  user?: any;'
);

// 2. Sidebar Footer
code = code.replace(
  '<div className="text-[12px] text-[#9E9A95] truncate">Demo Admin</div>',
  '<div className="text-[12px] text-[#9E9A95] truncate">{user?.name || \'Demo Admin\'}</div>'
);
code = code.replace(
  '<div className="text-[10px] text-[#4A4540] truncate">admin@acmedesign.studio</div>',
  '<div className="text-[10px] text-[#4A4540] truncate">{user?.email || \'admin@acmedesign.studio\'}</div>'
);
code = code.replace(
  '<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">\n            DA\n          </div>',
  '<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">\n            {(user?.name || \'DA\').substring(0, 2).toUpperCase()}\n          </div>'
);

// 3. Dashboard Signature
code = code.replace(
  'function Dashboard({ org, onNavigate, wonState }: {',
  'function Dashboard({ org, onNavigate, wonState, user }: {\n  user?: any;'
);

// 4. Dashboard Greeting
code = code.replace(
  '{greeting}, Demo Admin',
  '{greeting}, {user?.name || \'Demo Admin\'}'
);

// 5. CRMDetail Signature
code = code.replace(
  'function CRMDetail({ wonState, onWon, onNavigate }: {',
  'function CRMDetail({ wonState, onWon, onNavigate, user }: {\n  user?: any;'
);
// CRMDetail Owner
code = code.replace(
  "{ label: 'Owner', value: 'Demo Admin' }",
  "{ label: 'Owner', value: user?.name || 'Demo Admin' }"
);
code = code.replace(
  "{ label: 'Account Owner', value: 'Demo Admin' }",
  "{ label: 'Account Owner', value: user?.name || 'Demo Admin' }"
);

// 6. App calls
code = code.replace(
  '<Sidebar screen={screen} org={org} open={sidebarOpen} onNavigate={navigate} onOrgClick={() => setOrgSwitcher(true)} onClose={() => setSidebarOpen(false)} />',
  '<Sidebar screen={screen} org={org} open={sidebarOpen} onNavigate={navigate} onOrgClick={() => setOrgSwitcher(true)} onClose={() => setSidebarOpen(false)} user={serverState?.user} />'
);
code = code.replace(
  '<Dashboard org={org} onNavigate={navigate} wonState={wonState} />',
  '<Dashboard org={org} onNavigate={navigate} wonState={wonState} user={serverState?.user} />'
);
code = code.replace(
  '<CRMDetail wonState={wonState} onWon={handleWon} onNavigate={navigate} />',
  '<CRMDetail wonState={wonState} onWon={handleWon} onNavigate={navigate} user={serverState?.user} />'
);

fs.writeFileSync(file, code);
console.log('FigmaApp.tsx updated successfully');

import fs from 'fs';

const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Update TopBar Signature
code = code.replace(
  'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick }: {',
  'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick, user }: {\n  user?: any;'
);

// 2. Update TopBar Avatar
code = code.replace(
  '<button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer relative">\n          DA\n        </button>',
  '<button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer relative">\n          {(user?.name || \'DA\').substring(0, 2).toUpperCase()}\n        </button>'
);

// 3. Update TopBar Invocation in App
code = code.replace(
  '<TopBar org={org} unreadCount={unread}\n          onOrgClick={() => setOrgSwitcher(true)}\n          onNotifClick={() => setNotifPanel(true)}\n          onMenuClick={() => setSidebarOpen(true)} />',
  '<TopBar org={org} unreadCount={unread}\n          onOrgClick={() => setOrgSwitcher(true)}\n          onNotifClick={() => setNotifPanel(true)}\n          onMenuClick={() => setSidebarOpen(true)}\n          user={serverState?.user} />'
);

fs.writeFileSync(file, code);
console.log('TopBar fixed');

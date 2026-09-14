import codecs
with codecs.open('src/components/FigmaApp.tsx', 'r', 'utf-8') as f:
    content = f.read()

# 1. Update TopBar
content = content.replace(
    'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick }: {',
    'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick, user }: {'
)
content = content.replace(
    'org: OrgId; unreadCount: number',
    'org: OrgId; unreadCount: number; user?: any;'
)
content = content.replace(
    '<button className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white hover:bg-[#B07245] transition-colors">\n              DA\n            </button>',
    '<button className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white hover:bg-[#B07245] transition-colors">\n              {user?.name ? user.name.split(\\' \\').map((n: string) => n[0]).join(\\'\\').substring(0, 2).toUpperCase() : \\'U\\'}\n            </button>'
)
content = content.replace(
    '<div className="text-[11px] font-semibold text-[#1A1918]">Demo Admin</div>\n                  <div className="text-[10px] text-[#9E9A95]">admin@archos.demo</div>',
    '<div className="text-[11px] font-semibold text-[#1A1918]">{user?.name || \\'User\\'}</div>\n                  <div className="text-[10px] text-[#9E9A95]">{user?.email || \\'\\'}</div>'
)

# 2. Update Dashboard
content = content.replace(
    'function Dashboard({ org, onNavigate, wonState }: {',
    'function Dashboard({ org, onNavigate, wonState, user }: {'
)
content = content.replace(
    'org: OrgId; onNavigate: (s: Screen) => void; wonState: boolean',
    'org: OrgId; onNavigate: (s: Screen) => void; wonState: boolean; user?: any'
)
content = content.replace(
    '{greeting}, Demo Admin',
    '{greeting}, {user?.name || \\'User\\'}'
)

# 3. Update call sites
content = content.replace(
    '<TopBar org={org} unreadCount={unread}',
    '<TopBar org={org} unreadCount={unread} user={serverState?.user}'
)
content = content.replace(
    '<Dashboard org={org} onNavigate={navigate} wonState={wonState} />',
    '<Dashboard org={org} onNavigate={navigate} wonState={wonState} user={serverState?.user} />'
)

with codecs.open('src/components/FigmaApp.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done")

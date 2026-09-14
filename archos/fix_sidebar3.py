import codecs
import re

with codecs.open('src/components/FigmaApp.tsx', 'r', 'utf-8') as f:
    content = f.read()

# 1. Sidebar signature
content = content.replace(
    'function Sidebar({ screen, org, open, onNavigate, onOrgClick, onClose }: {',
    'function Sidebar({ screen, org, open, onNavigate, onOrgClick, onClose, user }: {'
)
content = content.replace(
    'org: OrgId; open: boolean;',
    'org: OrgId; open: boolean; user?: any;'
)

# 2. Sidebar footer hardcoded names
content = content.replace(
    '''<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">
              DA
            </div>''',
    '''<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>'''
)
content = content.replace(
    '''<div className="text-[12px] text-[#9E9A95] truncate">Demo Admin</div>
              <div className="text-[10px] text-[#4A4540] truncate">admin@acmedesign.studio</div>''',
    '''<div className="text-[12px] text-[#9E9A95] truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-[#4A4540] truncate">{user?.email || ''}</div>'''
)

# 3. Pass user to Sidebar
content = content.replace(
    '<Sidebar screen={screen} org={org} open={sidebarOpen}',
    '<Sidebar screen={screen} org={org} open={sidebarOpen} user={serverState?.user}'
)

# 4. TopBar
content = content.replace(
    'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick }: {',
    'function TopBar({ org, unreadCount, onOrgClick, onNotifClick, onMenuClick, user }: {'
)
content = content.replace(
    'org: OrgId; unreadCount: number',
    'org: OrgId; unreadCount: number; user?: any;'
)
content = content.replace(
    '''<button className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white hover:bg-[#B07245] transition-colors">
              DA
            </button>''',
    '''<button className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white hover:bg-[#B07245] transition-colors">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </button>'''
)
content = content.replace(
    '''<div className="text-[11px] font-semibold text-[#1A1918]">Demo Admin</div>
                  <div className="text-[10px] text-[#9E9A95]">admin@archos.demo</div>''',
    '''<div className="text-[11px] font-semibold text-[#1A1918]">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-[#9E9A95]">{user?.email || ''}</div>'''
)

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
    '{greeting}, {user?.name ? user.name.split(" ")[0] : "User"}'
)

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

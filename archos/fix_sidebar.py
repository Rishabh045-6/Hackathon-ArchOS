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
    '<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">\n              DA\n            </div>',
    '''<div className="w-7 h-7 bg-[#2A2825] border border-[#383430] flex items-center justify-center text-[10px] font-semibold text-[#9E9A95] shrink-0">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>'''
)
content = content.replace(
    '<div className="text-[12px] text-[#9E9A95] truncate">Demo Admin</div>\n              <div className="text-[10px] text-[#4A4540] truncate">admin@acmedesign.studio</div>',
    '''<div className="text-[12px] text-[#9E9A95] truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-[#4A4540] truncate">{user?.email || ''}</div>'''
)

# 3. Pass user to Sidebar
content = content.replace(
    '<Sidebar screen={screen} org={org} open={sidebarOpen}',
    '<Sidebar screen={screen} org={org} open={sidebarOpen} user={serverState?.user}'
)

# 4. TopBar popup was missed because of indentation differences. Let's fix TopBar popup using regex.
content = re.sub(
    r'<div className="text-\[11px\] font-semibold text-\[#1A1918\]">Demo Admin</div>\s*<div className="text-\[10px\] text-\[#9E9A95\]">admin@archos\.demo</div>',
    r'<div className="text-[11px] font-semibold text-[#1A1918]">{user?.name || \'User\'}</div>\n                  <div className="text-[10px] text-[#9E9A95]">{user?.email || \'\'}</div>',
    content
)
content = re.sub(
    r'<button className="w-7 h-7 bg-\[#1A1918\] flex items-center justify-center text-\[10px\] font-semibold text-white hover:bg-\[#B07245\] transition-colors">\s*DA\s*</button>',
    r'<button className="w-7 h-7 bg-[#1A1918] flex items-center justify-center text-[10px] font-semibold text-white hover:bg-[#B07245] transition-colors">\n              {user?.name ? user.name.split(\' \').map((n: string) => n[0]).join(\'\').substring(0, 2).toUpperCase() : \'U\'}\n            </button>',
    content
)

with codecs.open('src/components/FigmaApp.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done")

import codecs
import re

with codecs.open('src/components/FigmaApp.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Add logout link to TopBar Dropdown
content = content.replace(
    '''<div className="text-[11px] font-semibold text-[#1A1918]">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-[#9E9A95]">{user?.email || ''}</div>
                </div>
              </div>
            </div>''',
    '''<div className="text-[11px] font-semibold text-[#1A1918]">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-[#9E9A95]">{user?.email || ''}</div>
                </div>
                <a href="/auth/logout" className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#5A5A5A] hover:bg-[#F5F3EF] hover:text-[#B07245] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log out
                </a>
              </div>
            </div>'''
)

# Fix top-bar dropdown gap from mt-1 to pt-1
content = content.replace(
    '<div className="absolute right-0 top-full mt-1 w-36 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">',
    '<div className="absolute right-0 top-full pt-1 w-36 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">'
)

with codecs.open('src/components/FigmaApp.tsx', 'w', 'utf-8') as f:
    f.write(content)

print("Done")

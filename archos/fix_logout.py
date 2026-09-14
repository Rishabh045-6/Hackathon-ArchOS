import codecs
with codecs.open('src/components/FigmaApp.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Sidebar logout href -> /auth/logout
content = content.replace(
    '<button className="flex items-center gap-2 px-4 py-3 text-[12px] font-medium text-[#9E9A95] hover:text-[#1A1918] hover:bg-[#F0EDE6] transition-colors mt-auto border-t border-[#F0EDE6]">',
    '<a href="/auth/logout" className="flex items-center gap-2 px-4 py-3 text-[12px] font-medium text-[#9E9A95] hover:text-[#1A1918] hover:bg-[#F0EDE6] transition-colors mt-auto border-t border-[#F0EDE6]">'
)
content = content.replace(
    '''</button>
        </div>
      </>
    )
}

/* ═══════════════════════════════════════════════════════════════''',
    '''</a>
        </div>
      </>
    )
}

/* ═══════════════════════════════════════════════════════════════'''
)

# TopBar logout hover gap
content = content.replace(
    '<div className="absolute right-0 top-full mt-1 w-36 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">',
    '<div className="absolute right-0 top-full pt-1 w-36 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">'
)

with codecs.open('src/components/FigmaApp.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done")

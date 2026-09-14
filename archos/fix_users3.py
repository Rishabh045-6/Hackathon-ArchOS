import codecs
with codecs.open('src/components/FigmaApp.tsx', 'r', 'utf-8') as f:
    content = f.read()

start_idx = content.find('function UsersScreen() {')
end_idx = content.find('function SettingsScreen', start_idx)

if start_idx != -1 and end_idx != -1:
    new_users_screen = '''function UsersScreen({ serverState }: { serverState: any }) {
  const isAdmin = serverState?.user?.email === 'admin@archos.demo';
  const displayUsers = isAdmin ? serverState.allUsers || [] : (serverState.members || []).map((m: any) => m.user);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) return;
    const { updateUserRole } = await import('@/app/admin-actions');
    await updateUserRole(userId, newRole);
    window.location.reload();
  };

  const ROLES = [
    "Architect",
    "Interior Designer",
    "Project Manager",
    "Designer",
    "Sales",
    "Finance / Accounts",
    "Other"
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[800px]">
      <PageHeader title="Users" subtitle="Manage team members and their application access."
        action={isAdmin && <button className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ Invite User</button>} />
      <div className="bg-white border border-[#E5E1D9]">
        <div className="hidden lg:grid grid-cols-[1fr_100px_1fr_80px] gap-4 px-5 py-3 border-b border-[#F2EFE9]">
          {['User', 'Role', 'App Access', 'Status'].map(h => (
            <div key={h} className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest">{h}</div>
          ))}
        </div>
        {displayUsers.map((u: any) => {
          const initials = u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
          const role = u.profession || 'Pending';
          const isActive = isAdmin ? (u.memberships && u.memberships.length > 0) : true;
          
          return (
            <div key={u.email} className="lg:grid lg:grid-cols-[1fr_100px_1fr_80px] gap-4 px-5 py-4 border-b border-[#F5F2EC] last:border-0 flex flex-col gap-1.5 hover:bg-[#FDFCFA] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#F5F3EF] border border-[#E5E1D9] flex items-center justify-center text-[10px] font-semibold text-[#706B65] shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1918]">{u.name}</div>
                  <div className="text-[11px] text-[#B0ABA5]">{u.email}</div>
                </div>
              </div>
              <div className="text-[12px] text-[#9E9A95] flex items-center relative">
                {isAdmin ? (
                  <select 
                    value={role} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-transparent border border-transparent hover:border-[#E5E1D9] focus:border-[#B07245] rounded px-1 py-0.5 outline-none text-[#1A1918] cursor-pointer w-full"
                  >
                    <option value="Pending" disabled>Pending</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <span>{role}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {isActive ? (
                  <>
                    <AppBadge app="CRM" />
                    <AppBadge app="Projects" />
                  </>
                ) : (
                  <span className="text-[11px] text-[#B0ABA5]">No access</span>
                )}
              </div>
              <div className="flex items-center">
                <span className={	ext-[11px] font-medium }>
                  {isActive ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
'''
    content = content[:start_idx] + new_users_screen + content[end_idx:]
    with codecs.open('src/components/FigmaApp.tsx', 'w', 'utf-8') as f:
        f.write(content)
    print("Replaced UsersScreen")
else:
    print("Could not find bounds")

import fs from 'fs';

const file = 'src/components/FigmaApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const startIdx = code.indexOf('function UsersScreen() {');
const endIdx = code.indexOf('function SettingsScreen(');

if (startIdx > -1 && endIdx > -1) {
  // Find the comment block right before SettingsScreen
  const beforeSettings = code.lastIndexOf('/*', endIdx);
  
  const toReplace = code.substring(startIdx, beforeSettings);

  const newUsersScreen = `function UsersScreen({ members = [], roles = [], onInvite }: { members: any[], roles: any[], onInvite: (email: string, roleId: string) => void }) {
  const React = require('react');
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState(roles[0]?.id || '');
  const [loading, setLoading] = React.useState(false);

  const handleInvite = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await onInvite(inviteEmail, inviteRole);
    setLoading(false);
    setInviteOpen(false);
    setInviteEmail('');
  };

  return (
    <div className="p-6 lg:p-8 max-w-[800px] relative">
      <PageHeader title="Users" subtitle="Manage team members and their application access."
        action={<button onClick={() => setInviteOpen(true)} className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors">+ Invite User</button>} />
      
      {inviteOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-white/80 flex items-start justify-center pt-20 z-10">
          <form onSubmit={handleInvite} className="bg-white border border-[#E5E1D9] shadow-lg p-6 w-[400px]">
            <h3 className="text-[16px] font-bold text-[#111] mb-4">Invite User</h3>
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-[#1A1918] mb-1.5">Email Address</label>
              <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full border border-[#E5E1D9] bg-[#FDFCFA] px-3 py-2 text-[13px] outline-none focus:border-[#111]" placeholder="colleague@example.com" />
            </div>
            <div className="mb-6">
              <label className="block text-[12px] font-semibold text-[#1A1918] mb-1.5">Role</label>
              <select required value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full border border-[#E5E1D9] bg-[#FDFCFA] px-3 py-2 text-[13px] outline-none focus:border-[#111]">
                {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setInviteOpen(false)} className="px-4 py-2 text-[12px] font-medium text-[#71717A] hover:text-[#111]">Cancel</button>
              <button type="submit" disabled={loading} className="bg-[#1A1918] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[#2D2B29] transition-colors disabled:opacity-50">{loading ? 'Inviting...' : 'Send Invite'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-[#E5E1D9]">
        <div className="hidden lg:grid grid-cols-[1fr_100px_80px] gap-4 px-5 py-3 border-b border-[#F2EFE9]">
          {['User', 'Role', 'Status'].map(h => (
            <div key={h} className="text-[10px] font-semibold text-[#C8C0B5] uppercase tracking-widest">{h}</div>
          ))}
        </div>
        {members.map((m: any) => (
          <div key={m.id} className="lg:grid lg:grid-cols-[1fr_100px_80px] gap-4 px-5 py-4 border-b border-[#F5F2EC] last:border-0 flex flex-col gap-1.5 hover:bg-[#FDFCFA] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[#F5F3EF] border border-[#E5E1D9] flex items-center justify-center text-[10px] font-semibold text-[#706B65] shrink-0">
                {m.user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#1A1918]">{m.user.name}</div>
                <div className="text-[11px] text-[#B0ABA5]">{m.user.email}</div>
              </div>
            </div>
            <div className="text-[12px] text-[#9E9A95] flex items-center">{m.role.name}</div>
            <div className="flex items-center">
              <span className={\`text-[11px] font-medium \${m.status === 'ACTIVE' ? 'text-[#2E6A42]' : 'text-[#B07245]'}\`}>
                {m.status}
              </span>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="p-8 text-center text-[13px] text-[#9E9A95]">No users found.</div>
        )}
      </div>
    </div>
  )
}

`;

  code = code.replace(toReplace, newUsersScreen);
  
  // Also remove USERS_DATA
  code = code.replace(/const USERS_DATA = \[[\s\S]*?\]\n/m, '');
  
  // Replace case 'users'
  code = code.replace(/case 'users': return <UsersScreen \/>/g, `case 'users': return <UsersScreen members={serverState?.members} roles={serverState?.roles} onInvite={async (email, roleId) => {
    const { inviteUser } = await import('@/app/figma-actions');
    try {
      await inviteUser(email, roleId);
      alert('Invitation sent! The user can now sign up or log in to accept.');
    } catch (err: any) {
      alert(err.message);
    }
  }} />`);

  fs.writeFileSync(file, code);
  console.log('Successfully updated FigmaApp.tsx!');
} else {
  console.log('Could not find boundaries.');
}

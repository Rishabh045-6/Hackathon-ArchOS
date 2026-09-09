"use client";

import { useState } from 'react';
import { submitExpense } from '@/app/figma-actions';

export default function AddExpenseForm({ projects, onAdded, onCancel }: { projects: any[], onAdded: () => void, onCancel: () => void }) {
  const [form, setForm] = useState({ description: '', category: 'Material', projectId: projects[0]?.id || '', amount: '', date: '' })

  const handleSubmit = async () => {
    if (!form.description || !form.amount || !form.projectId) return
    await submitExpense({ 
      description: form.description, 
      category: form.category, 
      projectId: form.projectId, 
      amount: Number(form.amount),
      date: form.date || new Date().toISOString()
    })
    onAdded()
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="bg-white border border-[#E5E1D9] p-8 w-[400px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-[20px] font-medium text-[#1A1918] mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Add Expense
        </h2>
        <div className="space-y-4">
          {[
            { label: 'Description', key: 'description' as const, type: 'text', ph: 'e.g. Italian Marble Tiles' },
            { label: 'Amount (₹)', key: 'amount' as const, type: 'number', ph: 'e.g. 50000' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold text-[#9E9A95] uppercase tracking-widest block mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.ph}
                className="w-full border border-[#E5E1D9] px-3.5 py-2.5 text-[13px] text-[#1A1918] focus:outline-none focus:border-[#B07245] transition-colors" />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-semibold text-[#9E9A95] uppercase tracking-widest block mb-1.5">Date (Optional)</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border border-[#E5E1D9] px-3.5 py-2.5 text-[13px] text-[#1A1918] focus:outline-none focus:border-[#B07245] transition-colors" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#9E9A95] uppercase tracking-widest block mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-[#E5E1D9] px-3.5 py-2.5 text-[13px] text-[#1A1918] focus:outline-none focus:border-[#B07245]">
              {['Material', 'Transport', 'Labor', 'Equipment', 'Consultation'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#9E9A95] uppercase tracking-widest block mb-1.5">Project</label>
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
              className="w-full border border-[#E5E1D9] px-3.5 py-2.5 text-[13px] text-[#1A1918] focus:outline-none focus:border-[#B07245]">
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <button onClick={handleSubmit} className="flex-1 bg-[#1A1918] text-white py-2.5 text-[13px] font-semibold hover:bg-[#2D2B29] transition-colors">
            Add Expense
          </button>
          <button onClick={onCancel} className="px-4 py-2.5 border border-[#E5E1D9] text-[13px] text-[#706B65] hover:border-[#C8C0B5] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

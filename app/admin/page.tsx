'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type JadwalRow = {
  id: string;
  judul: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  lokasi: string | null;
  jenis: string;
  deskripsi: string | null;
  // Sekolah Sabat
  ss_mc: string | null;
  ss_doa_buka: string | null;
  ss_diskusi: string | null;
  ss_mission: string | null;
  ss_pp_doa: string | null;
  ss_persembahan: string | null;
  // Khotbah Utama
  khotbah_lagu_pujian: string | null;
  khotbah_bacaan_persembahan: string | null;
  khotbah_mc: string | null;
  khotbah_cerita_anak: string | null;
  pembawa_firman: string | null;
  pianis: string | null;
  // Rabu Malam & Pemuda (Dikembalikan seperti semula)
  mc_doa_buka: string | null;
  doa_syafaat: string | null;
  renungan: string | null;
  operator: string | null;
  games: string | null;
  acara_inti: string | null;
};

type FormState = Omit<JadwalRow, 'id'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const JENIS_OPTIONS = [
  { value: 'ibadah_umum', label: 'Ibadah Umum' },
  { value: 'doa', label: 'Ibadah Doa' },
  { value: 'pemuda', label: 'Pemuda' },
  { value: 'anak', label: 'Sekolah Sabat Anak' },
  { value: 'lainnya', label: 'Lainnya' },
];

const JENIS_BADGE: Record<string, string> = {
  ibadah_umum: 'bg-blue-100 text-blue-700',
  doa:         'bg-violet-100 text-violet-700',
  pemuda:      'bg-emerald-100 text-emerald-700',
  anak:        'bg-amber-100 text-amber-700',
  lainnya:     'bg-slate-100 text-slate-600',
};

const SS_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: 'ss_mc',          label: 'MC / Protokol' },
  { key: 'ss_doa_buka',    label: 'Doa Buka' },
  { key: 'ss_diskusi',     label: 'Diskusi SS / Guru' },
  { key: 'ss_mission',     label: 'Cerita Mission' },
  { key: 'ss_pp_doa',      label: 'PP & Doa / Pemimpin Lagu' },
  { key: 'ss_persembahan', label: 'Petugas Ambil Persembahan' },
];

const KHOTBAH_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: 'khotbah_mc',                 label: 'MC / Pemimpin Jemaat' },
  { key: 'pianis',                     label: 'Pianis / Organis' },
  { key: 'khotbah_lagu_pujian',        label: 'Lagu Pujian Spesial' },
  { key: 'khotbah_bacaan_persembahan', label: 'Bacaan Persembahan' },
  { key: 'khotbah_cerita_anak',        label: 'Cerita Anak-anak' },
  { key: 'pembawa_firman',             label: 'Khotbah / Pembawa Firman' },
];

// Dikembalikan seperti semula
const TAMBAHAN_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: 'mc_doa_buka', label: 'MC & Doa Buka' },
  { key: 'doa_syafaat', label: 'Doa Syafaat' },
  { key: 'renungan',    label: 'Renungan Firman' },
  { key: 'operator',    label: 'Operator Multimedia / Sound' },
  { key: 'games',       label: 'Pemimpin Games (Pemuda)' },
  { key: 'acara_inti',  label: 'Acara Inti Pemuda' },
];

const EMPTY_FORM: FormState = {
  judul: '', tanggal_mulai: '', tanggal_selesai: '', lokasi: '', jenis: 'ibadah_umum', deskripsi: '',
  ss_mc: '', ss_doa_buka: '', ss_diskusi: '', ss_mission: '', ss_pp_doa: '', ss_persembahan: '',
  khotbah_lagu_pujian: '', khotbah_bacaan_persembahan: '', khotbah_mc: '',
  khotbah_cerita_anak: '', pembawa_firman: '', pianis: '',
  mc_doa_buka: '', doa_syafaat: '', renungan: '', operator: '', games: '', acara_inti: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToForm(row: JadwalRow): FormState {
  return {
    judul: row.judul,
    tanggal_mulai: row.tanggal_mulai?.slice(0, 16) ?? '',
    tanggal_selesai: row.tanggal_selesai?.slice(0, 16) ?? '',
    lokasi: row.lokasi ?? '',
    jenis: row.jenis,
    deskripsi: row.deskripsi ?? '',
    ss_mc: row.ss_mc ?? '',
    ss_doa_buka: row.ss_doa_buka ?? '',
    ss_diskusi: row.ss_diskusi ?? '',
    ss_mission: row.ss_mission ?? '',
    ss_pp_doa: row.ss_pp_doa ?? '',
    ss_persembahan: row.ss_persembahan ?? '',
    khotbah_lagu_pujian: row.khotbah_lagu_pujian ?? '',
    khotbah_bacaan_persembahan: row.khotbah_bacaan_persembahan ?? '',
    khotbah_mc: row.khotbah_mc ?? '',
    khotbah_cerita_anak: row.khotbah_cerita_anak ?? '',
    pembawa_firman: row.pembawa_firman ?? '',
    pianis: row.pianis ?? '',
    mc_doa_buka: row.mc_doa_buka ?? '',
    doa_syafaat: row.doa_syafaat ?? '',
    renungan: row.renungan ?? '',
    operator: row.operator ?? '',
    games: row.games ?? '',
    acara_inti: row.acara_inti ?? '',
  };
}

function formToPayload(f: FormState) {
  const clean = (v: string | null) => v?.trim() || null;
  return {
    judul: f.judul.trim(),
    tanggal_mulai: f.tanggal_mulai,
    tanggal_selesai: f.tanggal_selesai || null,
    lokasi: clean(f.lokasi),
    jenis: f.jenis,
    deskripsi: clean(f.deskripsi),
    ss_mc: clean(f.ss_mc), ss_doa_buka: clean(f.ss_doa_buka), ss_diskusi: clean(f.ss_diskusi),
    ss_mission: clean(f.ss_mission), ss_pp_doa: clean(f.ss_pp_doa), ss_persembahan: clean(f.ss_persembahan),
    khotbah_lagu_pujian: clean(f.khotbah_lagu_pujian), khotbah_bacaan_persembahan: clean(f.khotbah_bacaan_persembahan),
    khotbah_mc: clean(f.khotbah_mc), khotbah_cerita_anak: clean(f.khotbah_cerita_anak),
    pembawa_firman: clean(f.pembawa_firman), pianis: clean(f.pianis),
    mc_doa_buka: clean(f.mc_doa_buka), doa_syafaat: clean(f.doa_syafaat), renungan: clean(f.renungan),
    operator: clean(f.operator), games: clean(f.games), acara_inti: clean(f.acara_inti),
  };
}

function fmt(iso: string | null) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CrossIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className}>
      <path d="M12 3v18M3 9h18" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
        strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5
      px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-white transition-all
      ${type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'ok'
        ? <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
        : <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>}
      {msg}
    </div>
  );
}

function SesiHeader({ color, icon, title, subtitle }: { color: string; icon: string; title: string; subtitle: string }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl mb-4 ${color}`}>
      <span className="text-2xl leading-none mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder = '', half = false,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; half?: boolean;
}) {
  return (
    <div className={half ? '' : 'sm:col-span-2'}>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
          placeholder:text-slate-300 text-slate-800
          focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e]
          transition-all"
      />
    </div>
  );
}

// ─── JadwalCard (edit inline) ─────────────────────────────────────────────────

function JadwalCard({ row, onUpdated, onDeleted }: {
  row: JadwalRow;
  onUpdated: (r: JadwalRow) => void;
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(rowToForm(row));
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  function set(k: keyof FormState, v: string) { setForm(p => ({ ...p, [k]: v })); }

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!form.judul || !form.tanggal_mulai) return showToast('Judul & tanggal wajib diisi.', 'err');
    setBusy(true);
    const { data, error } = await supabase
      .from('jadwal_ibadah').update(formToPayload(form)).eq('id', row.id).select().single();
    setBusy(false);
    if (error || !data) return showToast('Gagal menyimpan.', 'err');
    onUpdated(data as JadwalRow);
    showToast('Jadwal berhasil diperbarui.', 'ok');
    setOpen(false);
  }

  async function handleDelete() {
    if (!confirm(`Hapus "${row.judul}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from('jadwal_ibadah').delete().eq('id', row.id);
    setBusy(false);
    if (error) return showToast('Gagal menghapus.', 'err');
    onDeleted(row.id);
  }

  const badge = JENIS_BADGE[row.jenis] ?? JENIS_BADGE.lainnya;
  const jenisLabel = JENIS_OPTIONS.find(o => o.value === row.jenis)?.label ?? row.jenis;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 px-5 py-4">
        <button onClick={() => setOpen(p => !p)} className="flex-1 text-left min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge}`}>{jenisLabel}</span>
          </div>
          <p className="font-semibold text-[#0f2040] leading-snug">{row.judul}</p>
          <p className="text-xs text-slate-400 mt-0.5">{fmt(row.tanggal_mulai)}{row.lokasi ? ` · ${row.lokasi}` : ''}</p>
        </button>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <button
            onClick={() => setOpen(p => !p)}
            className="p-2 rounded-lg text-slate-400 hover:text-[#1a3a6e] hover:bg-slate-100 transition-colors text-xs font-medium"
            title={open ? 'Tutup' : 'Edit'}
          >
            {open ? '▲' : '✏️'}
          </button>
          <button
            onClick={handleDelete} disabled={busy}
            className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Hapus"
          >
            🗑
          </button>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2500px]' : 'max-h-0'}`}>
        <div className="border-t border-slate-100 px-5 py-5 space-y-6">

          {/* Info Dasar */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Info Jadwal</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Judul Ibadah" value={form.judul} onChange={v => set('judul', v)} />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Jenis</label>
                <select value={form.jenis} onChange={e => set('jenis', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all">
                  {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal & Jam Mulai</label>
                <input type="datetime-local" value={form.tanggal_mulai} onChange={e => set('tanggal_mulai', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal & Jam Selesai</label>
                <input type="datetime-local" value={form.tanggal_selesai ?? ''} onChange={e => set('tanggal_selesai', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all" />
              </div>
              <Field label="Lokasi" value={form.lokasi ?? ''} onChange={v => set('lokasi', v)} half />
              <Field label="Deskripsi (opsional)" value={form.deskripsi ?? ''} onChange={v => set('deskripsi', v)} half />
            </div>
          </div>

          {/* Sekolah Sabat */}
          <div>
            <SesiHeader color="bg-indigo-50 text-indigo-800" icon="📖" title="Sesi Sekolah Sabat" subtitle="Petugas untuk sesi Sekolah Sabat" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SS_FIELDS.map(f => (
                <Field key={f.key} label={f.label} value={(form[f.key] as string) ?? ''} onChange={v => set(f.key, v)} half />
              ))}
            </div>
          </div>

          {/* Khotbah Utama */}
          <div>
            <SesiHeader color="bg-amber-50 text-amber-800" icon="🎵" title="Sesi Khotbah / Ibadah Utama" subtitle="Petugas untuk sesi Kebaktian Utama" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KHOTBAH_FIELDS.map(f => (
                <Field key={f.key} label={f.label} value={(form[f.key] as string) ?? ''} onChange={v => set(f.key, v)} half />
              ))}
            </div>
          </div>

          {/* Rabu Malam & Pemuda (Dikembangkan) */}
          <div>
            <SesiHeader color="bg-emerald-50 text-emerald-800" icon="🌙" title="Petugas Rabu Malam / Pemuda" subtitle="Formulir petugas pelengkap terintegrasi" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TAMBAHAN_FIELDS.map(f => (
                <Field key={f.key} label={f.label} value={(form[f.key] as string) ?? ''} onChange={v => set(f.key, v)} half />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button onClick={handleSave} disabled={busy}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl
                bg-[#1a3a6e] hover:bg-[#142e58] text-white disabled:opacity-60 transition-all active:scale-95 shadow-sm">
              {busy ? <Spinner /> : null} Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ─── Add Jadwal Modal ─────────────────────────────────────────────────────────

function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: (r: JadwalRow) => void }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof FormState, v: string) { setForm(p => ({ ...p, [k]: v })); setErr(''); }

  async function handleAdd() {
    if (!form.judul.trim() || !form.tanggal_mulai) return setErr('Judul & tanggal wajib diisi.');
    setBusy(true);
    const { data, error } = await supabase.from('jadwal_ibadah').insert(formToPayload(form)).select().single();
    setBusy(false);
    if (error || !data) return setErr('Gagal menambah jadwal.');
    onAdded(data as JadwalRow);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#7b9fcf]">Tambah Baru</p>
            <h2 className="text-lg font-bold text-[#0f2040]">Jadwal Ibadah</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-lg transition-colors">×</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Info Dasar */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Info Jadwal</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Judul Ibadah *" value={form.judul} onChange={v => set('judul', v)} />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Jenis *</label>
                <select value={form.jenis} onChange={e => set('jenis', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all">
                  {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal & Jam Mulai *</label>
                <input type="datetime-local" value={form.tanggal_mulai} onChange={e => set('tanggal_mulai', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal & Jam Selesai</label>
                <input type="datetime-local" value={form.tanggal_selesai ?? ''} onChange={e => set('tanggal_selesai', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all" />
              </div>
              <Field label="Lokasi" value={form.lokasi ?? ''} onChange={v => set('lokasi', v)} half />
              <Field label="Deskripsi (opsional)" value={form.deskripsi ?? ''} onChange={v => set('deskripsi', v)} half />
            </div>
          </div>

          {/* Sekolah Sabat */}
          <div>
            <SesiHeader color="bg-indigo-50 text-indigo-800" icon="📖" title="Sesi Sekolah Sabat" subtitle="Kosongkan jika belum ada petugas" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SS_FIELDS.map(f => (
                <Field key={f.key} label={f.label} value={(form[f.key] as string) ?? ''} onChange={v => set(f.key, v)} half />
              ))}
            </div>
          </div>

          {/* Khotbah */}
          <div>
            <SesiHeader color="bg-amber-50 text-amber-800" icon="🎵" title="Sesi Khotbah / Ibadah Utama" subtitle="Kosongkan jika belum ada petugas" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KHOTBAH_FIELDS.map(f => (
                <Field key={f.key} label={f.label} value={(form[f.key] as string) ?? ''} onChange={v => set(f.key, v)} half />
              ))}
            </div>
          </div>

          {/* Tambahan Rabu Malam & Pemuda */}
          <div>
            <SesiHeader color="bg-emerald-50 text-emerald-800" icon="🌙" title="Petugas Rabu Malam / Pemuda" subtitle="Kosongkan jika belum ada petugas" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TAMBAHAN_FIELDS.map(f => (
                <Field key={f.key} label={f.label} value={(form[f.key] as string) ?? ''} onChange={v => set(f.key, v)} half />
              ))}
            </div>
          </div>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button onClick={handleAdd} disabled={busy}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl
                bg-[#1a3a6e] hover:bg-[#142e58] text-white disabled:opacity-60 transition-all active:scale-95 shadow-sm">
              {busy ? <Spinner /> : null} Tambah Jadwal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [jadwals, setJadwals] = useState<JadwalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jadwal_ibadah')
      .select('*')
      .order('tanggal_mulai', { ascending: true });
    if (error) setFetchErr('Gagal memuat data jadwal.');
    else setJadwals(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = jadwals.filter(j =>
    j.judul.toLowerCase().includes(search.toLowerCase()) ||
    (j.lokasi ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const terisi = jadwals.filter(j =>
    [j.ss_mc, j.khotbah_mc, j.pembawa_firman, j.pianis].some(Boolean)
  ).length;

  return (
    <div className="min-h-screen bg-[#f0f4fa]">
      <header className="bg-[#0f2040] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <CrossIcon className="w-4 h-4" />
              </span>
              <span className="font-bold text-sm tracking-wide">GMAHK EKKLESIA</span>
              <span className="text-xs text-white/30 hidden sm:inline">— Admin Panel</span>
            </div>
            <a href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">← Kembali ke Beranda</a>
          </div>
          <div className="py-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7b9fcf] mb-1">Manajemen Pelayanan</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Jadwal Ibadah</h1>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                bg-white text-[#0f2040] hover:bg-slate-100 transition-all shadow-sm active:scale-95">
              + Tambah Jadwal
            </button>
          </div>
        </div>
      </header>

      <div className="bg-[#162d55] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap gap-6">
          {[
            { label: 'Total Jadwal', value: jadwals.length },
            { label: 'Petugas Terisi', value: terisi },
            { label: 'Belum Diatur', value: jadwals.length - terisi },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white">{value}</span>
              <span className="text-xs text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="mb-5">
          <input
            type="text"
            placeholder="Cari jadwal ibadah…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
              placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Spinner /><span className="text-sm">Memuat data…</span>
          </div>
        )}

        {fetchErr && !loading && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">{fetchErr}</div>
        )}

        {!loading && !fetchErr && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">Tidak ada jadwal yang ditemukan.</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-3 text-sm text-[#1a3a6e] font-medium hover:underline">
              + Tambah jadwal baru
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(row => (
              <JadwalCard
                key={row.id} row={row}
                onUpdated={updated => setJadwals(p => p.map(j => j.id === updated.id ? updated : j))}
                onDeleted={id => setJadwals(p => p.filter(j => j.id !== id))}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdded={row => setJadwals(p => [...p, row].sort((a, b) => a.tanggal_mulai.localeCompare(b.tanggal_mulai)))}
        />
      )}

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-slate-400">
        GMAHK Ekklesia © {new Date().getFullYear()} · Panel Admin
      </footer>
    </div>
  );
}
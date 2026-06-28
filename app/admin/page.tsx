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
};

type FormState = Omit<JadwalRow, 'id'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const JENIS_OPTIONS = [
  { value: 'ibadah_umum', label: 'Ibadah Umum' },
  { value: 'doa', label: 'Ibadah Doa' },
  { value: 'pemuda', label: 'Pemuda' },
  { value: 'anak', label: 'Sekolah Sabat Anak' },
];

const INITIAL_FORM: FormState = {
  judul: '',
  tanggal_mulai: '',
  tanggal_selesai: null,
  lokasi: 'Gedung Gereja GMAHK Ekklesia',
  jenis: 'ibadah_umum',
  deskripsi: '',
  ss_mc: '',
  ss_doa_buka: '',
  ss_diskusi: '',
  ss_mission: '',
  ss_pp_doa: '',
  ss_persembahan: '',
  khotbah_lagu_pujian: '',
  khotbah_bacaan_persembahan: '',
  khotbah_mc: '',
  khotbah_cerita_anak: '',
  pembawa_firman: '',
  pianis: '',
};

// ─── Main Admin Component ─────────────────────────────────────────────────────

export default function AdminPage() {
  const [jadwals, setJadwals] = useState<JadwalRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchErr('');
    try {
      const { data, error } = await supabase
        .from('jadwal_ibadah')
        .select('*')
        .order('tanggal_mulai', { ascending: false });
      if (error) throw error;
      setJadwals(data || []);
    } catch (err: any) {
      setFetchErr(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = jadwals.filter(j => 
    j.judul.toLowerCase().includes(search.toLowerCase()) ||
    j.jenis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans pb-12">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20 uppercase">
                Control Panel
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight mt-1 uppercase">Manajemen Jadwal Jemaat</h1>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer">
            ➕ Tambah Jadwal Baru
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <span className="text-slate-400 text-sm pl-1">🔍</span>
          <input type="text" placeholder="Cari judul jadwal atau kategori acara jemaat..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 text-sm font-medium placeholder-slate-400 focus:outline-none" />
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-400">
            <span className="animate-pulse text-sm">Memuat data…</span>
          </div>
        )}

        {fetchErr && !loading && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">{fetchErr}</div>
        )}

        {!loading && !fetchErr && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">Tidak ada jadwal yang ditemukan.</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-3 text-sm text-[#1a3a6e] font-medium hover:underline cursor-pointer">
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
    </div>
  );
}

// ─── Card Component ───────────────────────────────────────────────────────────

function JadwalCard({ row, onUpdated, onDeleted }: { row: JadwalRow; onUpdated: (r: JadwalRow) => void; onDeleted: (id: string) => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus jadwal "${row.judul}"? Aksi ini permanen.`)) return;
    setDelLoading(true);
    try {
      const { error } = await supabase.from('jadwal_ibadah').delete().eq('id', row.id);
      if (error) throw error;
      onDeleted(row.id);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-slate-900 text-base">{row.judul}</h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
            {row.jenis}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-medium">🕒 {new Date(row.tanggal_mulai).toLocaleString('id-ID')}</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button onClick={() => setShowEdit(true)}
          className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition cursor-pointer">
          ✏️ Edit
        </button>
        <button onClick={handleDelete} disabled={delLoading}
          className="px-4 py-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer">
          {delLoading ? '...' : '🗑️ Hapus'}
        </button>
      </div>

      {showEdit && <EditModal row={row} onClose={() => setShowEdit(false)} onUpdated={onUpdated} />}
    </div>
  );
}

// ─── Modal Form Base ──────────────────────────────────────────────────────────

function FormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const upd = (key: keyof FormState, val: any) => setForm({ ...form, [key]: val === '' ? null : val });

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">📌 Informasi Utama Acara</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Judul Acara / Kebaktian</label>
            <input type="text" required value={form.judul} onChange={e => upd('judul', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Kategori Acara</label>
            <select value={form.jenis} onChange={e => upd('jenis', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border rounded-xl bg-white">
              {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Waktu & Tanggal Mulai</label>
            <input type="datetime-local" required value={form.tanggal_mulai ? form.tanggal_mulai.substring(0,16) : ''} onChange={e => upd('tanggal_mulai', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Lokasi Ibadah</label>
            <input type="text" value={form.lokasi || ''} onChange={e => upd('lokasi', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Deskripsi Tambahan</label>
            <textarea value={form.deskripsi || ''} onChange={e => upd('deskripsi', e.target.value)} rows={2}
              className="w-full mt-1 px-3 py-2 text-sm border rounded-xl resize-none" />
          </div>
        </div>
      </div>

      {/* Sesi I: Sekolah Sabat */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">🌅 Sesi I: Sekolah Sabat</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">MC / Protokol</label>
            <input type="text" value={form.ss_mc || ''} onChange={e => upd('ss_mc', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Doa Buka</label>
            <input type="text" value={form.ss_doa_buka || ''} onChange={e => upd('ss_doa_buka', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Diskusi SS / Guru</label>
            <input type="text" value={form.ss_diskusi || ''} onChange={e => upd('ss_diskusi', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Cerita Mission</label>
            <input type="text" value={form.ss_mission || ''} onChange={e => upd('ss_mission', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">PP & Doa / Pemimpin Lagu</label>
            <input type="text" value={form.ss_pp_doa || ''} onChange={e => upd('ss_pp_doa', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Ambil Persembahan</label>
            <input type="text" value={form.ss_persembahan || ''} onChange={e => upd('ss_persembahan', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
        </div>
      </div>

      {/* Sesi II: Kebaktian Utama */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">📖 Sesi II: Kebaktian Utama</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Lagu Pujian</label>
            <input type="text" value={form.khotbah_lagu_pujian || ''} onChange={e => upd('khotbah_lagu_pujian', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Bacaan Persembahan</label>
            <input type="text" value={form.khotbah_bacaan_persembahan || ''} onChange={e => upd('khotbah_bacaan_persembahan', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">MC / Pemimpin Jemaat</label>
            <input type="text" value={form.khotbah_mc || ''} onChange={e => upd('khotbah_mc', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Cerita Anak-anak</label>
            <input type="text" value={form.khotbah_cerita_anak || ''} onChange={e => upd('khotbah_cerita_anak', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Khotbah</label>
            <input type="text" value={form.pembawa_firman || ''} onChange={e => upd('pembawa_firman', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Pianis</label>
            <input type="text" value={form.pianis || ''} onChange={e => upd('pianis', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Modal Component ──────────────────────────────────────────────────────

function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: (r: JadwalRow) => void }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.from('jadwal_ibadah').insert([form]).select();
      if (error) throw error;
      if (data && data[0]) onAdded(data[0]);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan jadwal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wide">➕ Tambah Jadwal Baru</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
          <FormFields form={form} setForm={setForm} />
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-500 font-bold uppercase rounded-xl hover:bg-slate-50 cursor-pointer">Batal</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 cursor-pointer">
              {saving ? 'Menyimpan...' : '💾 Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Modal Component ─────────────────────────────────────────────────────

function EditModal({ row, onClose, onUpdated }: { row: JadwalRow; onClose: () => void; onUpdated: (r: JadwalRow) => void }) {
  const [form, setForm] = useState<FormState>({ ...row });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.from('jadwal_ibadah').update(form).eq('id', row.id).select();
      if (error) throw error;
      if (data && data[0]) onUpdated(data[0]);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui jadwal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wide">✏️ Edit Susunan Acara</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
          <FormFields form={form} setForm={setForm} />
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-500 font-bold uppercase rounded-xl hover:bg-slate-50 cursor-pointer">Batal</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 cursor-pointer">
              {saving ? 'Memperbarui...' : '💾 Perbarui Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
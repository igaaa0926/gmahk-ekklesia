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
  jenis: any; // Dibuat any agar aman jika berupa objek relasi
  deskripsi: string | null;
  ss_mc: any;
  ss_doa_buka: any;
  ss_diskusi: any;
  ss_mission: any;
  ss_pp_doa: any;
  ss_persembahan: any;
  khotbah_lagu_pujian: any;
  khotbah_bacaan_persembahan: any;
  khotbah_mc: any;
  khotbah_cerita_anak: any;
  pembawa_firman: any;
  pianis: any;
};

type FormState = Omit<JadwalRow, 'id'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const JENIS_OPTIONS = [
  { value: 'Kebaktian Utama', label: 'Kebaktian Utama' },
  { value: 'Sabat Sekolah', label: 'Sabat Sekolah' },
  { value: 'Rabu Malam', label: 'Rabu Malam' },
  { value: 'Vesper', label: 'Ibadah Vesper' },
];

const INITIAL_FORM: FormState = {
  judul: '',
  tanggal_mulai: '',
  tanggal_selesai: null,
  lokasi: 'Gedung Gereja GMAHK Ekklesia',
  jenis: 'Kebaktian Utama',
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

// ─── Helper Pengecek Objek (Kunci Anti-Crash) ─────────────────────────────────

function getStringValue(val: any): string {
  if (!val) return '';
  if (typeof val === 'object') {
    return val.nama || val.name || val.judul || JSON.stringify(val);
  }
  return String(val);
}

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

  const filtered = jadwals.filter(j => {
    const judulStr = getStringValue(j.judul).toLowerCase();
    const jenisStr = getStringValue(j.jenis).toLowerCase();
    const searchStr = search.toLowerCase();
    return judulStr.includes(searchStr) || jenisStr.includes(searchStr);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans pb-12">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Manajemen Jadwal Jemaat</h1>
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
          <input type="text" placeholder="Cari judul jadwal atau kategori..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 text-sm font-medium focus:outline-none" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm animate-pulse">Memuat data jemaat…</div>
        ) : fetchErr ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">{fetchErr}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">Tidak ada jadwal ditemukan.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(row => (
              <JadwalCard key={row.id} row={row}
                onUpdated={updated => setJadwals(p => p.map(j => j.id === updated.id ? updated : j))}
                onDeleted={id => setJadwals(p => p.filter(j => j.id !== id))}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onAdded={row => setJadwals(p => [row, ...p])} />
      )}
    </div>
  );
}

// ─── Card Component (Sudah Diperbaiki Total) ─────────────────────────────────

function JadwalCard({ row, onUpdated, onDeleted }: { row: JadwalRow; onUpdated: (r: JadwalRow) => void; onDeleted: (id: string) => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const handleDelete = async () => {
    const judulTeks = getStringValue(row.judul) || 'Tanpa Judul';
    if (!confirm(`Hapus jadwal "${judulTeks}"?`)) return;
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
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-slate-900 text-base truncate">{getStringValue(row.judul) || 'Tanpa Judul'}</h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase shrink-0">
            {getStringValue(row.jenis) || 'Ibadah'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">🕒 {row.tanggal_mulai ? new Date(row.tanggal_mulai).toLocaleString('id-ID') : '─'}</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <button onClick={() => setShowEdit(true)} className="px-4 py-2 text-xs border rounded-xl hover:bg-slate-50 font-semibold cursor-pointer">✏️ Edit</button>
        <button onClick={handleDelete} disabled={delLoading} className="px-4 py-2 text-xs bg-red-50 text-red-600 rounded-xl font-semibold disabled:opacity-50 cursor-pointer">
          {delLoading ? '...' : '🗑️ Hapus'}
        </button>
      </div>
      {showEdit && <EditModal row={row} onClose={() => setShowEdit(false)} onUpdated={onUpdated} />}
    </div>
  );
}

// ─── Form Fields Component ───────────────────────────────────────────────────

function FormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const upd = (key: keyof FormState, val: any) => setForm({ ...form, [key]: val === '' ? null : val });

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Judul Acara</label>
          <input type="text" required value={getStringValue(form.judul)} onChange={e => upd('judul', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</label>
          <select value={getStringValue(form.jenis) || 'Kebaktian Utama'} onChange={e => upd('jenis', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl bg-white">
            {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal & Waktu</label>
          <input type="datetime-local" required value={form.tanggal_mulai ? form.tanggal_mulai.substring(0,16) : ''} onChange={e => upd('tanggal_mulai', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Lokasi</label>
          <input type="text" value={getStringValue(form.lokasi)} onChange={e => upd('lokasi', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi</label>
          <textarea value={getStringValue(form.deskripsi)} onChange={e => upd('deskripsi', e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl resize-none" />
        </div>
      </div>

      {/* Sesi I */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-bold uppercase">🌅 Sesi I: Sekolah Sabat</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { k: 'ss_mc', l: 'MC / Protokol' },
            { k: 'ss_doa_buka', l: 'Doa Buka' },
            { k: 'ss_diskusi', l: 'Diskusi SS / Guru' },
            { k: 'ss_mission', l: 'Cerita Mission' },
            { k: 'ss_pp_doa', l: 'PP & Doa' },
            { k: 'ss_persembahan', l: 'Ambil Persembahan' }
          ].map(item => (
            <div key={item.k}>
              <label className="text-[10px] font-bold text-slate-400 uppercase">{item.l}</label>
              <input type="text" value={getStringValue((form as any)[item.k])} onChange={e => upd(item.k as any, e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Sesi II */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-bold uppercase">📖 Sesi II: Kebaktian Utama</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { k: 'khotbah_lagu_pujian', l: 'Lagu Pujian' },
            { k: 'khotbah_bacaan_persembahan', l: 'Bacaan Persembahan' },
            { k: 'khotbah_mc', l: 'MC / Pemimpin Jemaat' },
            { k: 'khotbah_cerita_anak', l: 'Cerita Anak' },
            { k: 'pembawa_firman', l: 'Khotbah' },
            { k: 'pianis', l: 'Pianis' }
          ].map(item => (
            <div key={item.k}>
              <label className="text-[10px] font-bold text-slate-400 uppercase">{item.l}</label>
              <input type="text" value={getStringValue((form as any)[item.k])} onChange={e => upd(item.k as any, e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

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
    } catch (err: any) { alert(err.message || 'Gagal menyimpan'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col p-6 shadow-xl border">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm uppercase">➕ Tambah Jadwal</h3><button onClick={onClose} className="cursor-pointer">✕</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields form={form} setForm={setForm} />
          <button type="submit" disabled={saving} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold uppercase text-xs transition cursor-pointer">
            {saving ? 'Menyimpan...' : '💾 Simpan'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
    } catch (err: any) { alert(err.message || 'Gagal memperbarui'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col p-6 shadow-xl border">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm uppercase">✏️ Edit Jadwal</h3><button onClick={onClose} className="cursor-pointer">✕</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields form={form} setForm={setForm} />
          <button type="submit" disabled={saving} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold uppercase text-xs transition cursor-pointer">
            {saving ? 'Memperbarui...' : '💾 Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
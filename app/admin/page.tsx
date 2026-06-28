'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type JadwalRow = {
  id: string;
  judul: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  lokasi: string | null;
  jenis: string;
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

function getStringValue(val: any): string {
  if (!val) return '';
  if (typeof val === 'object') return val.nama || val.name || '';
  return String(val);
}

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
    const titleMatch = j.judul ? j.judul.toLowerCase().includes(search.toLowerCase()) : false;
    const typeMatch = j.jenis ? j.jenis.toLowerCase().includes(search.toLowerCase()) : false;
    return titleMatch || typeMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans pb-12">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Manajemen Jadwal Jemaat</h1>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer">
            ➕ Tambah Jadwal Baru
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <span className="text-slate-400 text-sm pl-1">🔍</span>
          <input type="text" placeholder="Cari judul jadwal..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 text-sm font-medium focus:outline-none" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Memuat data…</div>
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
        <AddModal onClose={() => setShowAdd(false)}
          onAdded={row => setJadwals(p => [row, ...p])} />
      )}
    </div>
  );
}

function JadwalCard({ row, onUpdated, onDeleted }: { row: JadwalRow; onUpdated: (r: JadwalRow) => void; onDeleted: (id: string) => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus jadwal "${row.judul || 'Tanpa Judul'}"?`)) return;
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-slate-900 text-base">{row.judul || 'Tanpa Judul'}</h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">{row.jenis}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">🕒 {row.tanggal_mulai ? new Date(row.tanggal_mulai).toLocaleString('id-ID') : '─'}</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button onClick={() => setShowEdit(true)} className="px-4 py-2 text-xs border rounded-xl hover:bg-slate-50 font-semibold cursor-pointer">✏️ Edit</button>
        <button onClick={handleDelete} disabled={delLoading} className="px-4 py-2 text-xs bg-red-50 text-red-600 rounded-xl font-semibold disabled:opacity-50 cursor-pointer">Hapus</button>
      </div>
      {showEdit && <EditModal row={row} onClose={() => setShowEdit(false)} onUpdated={onUpdated} />}
    </div>
  );
}

function FormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const upd = (key: keyof FormState, val: any) => setForm({ ...form, [key]: val === '' ? null : val });

  return (
    <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 text-left">
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
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal</label>
          <input type="datetime-local" required value={form.tanggal_mulai ? form.tanggal_mulai.substring(0,16) : ''} onChange={e => upd('tanggal_mulai', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Lokasi</label>
          <input type="text" value={getStringValue(form.lokasi)} onChange={e => upd('lokasi', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
        </div>
      </div>

      {/* Sesi I */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-bold uppercase">🌅 Sesi I: Sekolah Sabat</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['ss_mc', 'ss_doa_buka', 'ss_diskusi', 'ss_mission', 'ss_pp_doa', 'ss_persembahan'].map(k => (
            <div key={k}>
              <label className="text-[10px] font-bold text-slate-400 uppercase">{k.replace('ss_', '').replace('_', ' ')}</label>
              <input type="text" value={getStringValue((form as any)[k])} onChange={e => upd(k as any, e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Sesi II */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-bold uppercase">📖 Sesi II: Kebaktian Utama</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['khotbah_lagu_pujian', 'khotbah_bacaan_persembahan', 'khotbah_mc', 'khotbah_cerita_anak', 'pembawa_firman', 'pianis'].map(k => (
            <div key={k}>
              <label className="text-[10px] font-bold text-slate-400 uppercase">{k.replace('khotbah_', '').replace('_', ' ')}</label>
              <input type="text" value={getStringValue((form as any)[k])} onChange={e => upd(k as any, e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col p-6">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Tambah Jadwal</h3><button onClick={onClose}>✕</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields form={form} setForm={setForm} />
          <button type="submit" disabled={saving} className="w-full mt-4 bg-blue-600 text-white p-3 rounded-xl font-bold uppercase text-xs">{saving ? 'Menyimpan...' : 'Simpan'}</button>
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
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col p-6">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Edit Jadwal</h3><button onClick={onClose}>✕</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields form={form} setForm={setForm} />
          <button type="submit" disabled={saving} className="w-full mt-4 bg-blue-600 text-white p-3 rounded-xl font-bold uppercase text-xs">{saving ? 'Memperbarui...' : 'Simpan Perubahan'}</button>
        </form>
      </div>
    </div>
  );
}
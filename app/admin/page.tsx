'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
type JadwalRow = {
  id: string; judul: string; tanggal_mulai: string; tanggal_selesai: string | null;
  lokasi: string | null; jenis: any; deskripsi: string | null;
  ss_mc: any; ss_doa_buka: any; ss_diskusi: any; ss_mission: any; ss_pp_doa: any; ss_persembahan: any;
  khotbah_lagu_pujian: any; khotbah_bacaan_persembahan: any; khotbah_mc: any; khotbah_cerita_anak: any;
  pembawa_firman: any; pianis: any;
};
type FormState = Omit<JadwalRow, 'id'>;

const JENIS_OPTIONS = [
  { value: 'Kebaktian Utama', label: 'Kebaktian Utama' },
  { value: 'Sabat Sekolah', label: 'Sabat Sekolah' },
  { value: 'Rabu Malam', label: 'Rabu Malam' },
  { value: 'Vesper', label: 'Ibadah Vesper' },
];

const INITIAL_FORM: FormState = {
  judul: '', tanggal_mulai: '', tanggal_selesai: null, lokasi: 'Gedung Gereja GMAHK Ekklesia',
  jenis: 'Kebaktian Utama', deskripsi: '', ss_mc: '', ss_doa_buka: '', ss_diskusi: '',
  ss_mission: '', ss_pp_doa: '', ss_persembahan: '', khotbah_lagu_pujian: '',
  khotbah_bacaan_persembahan: '', khotbah_mc: '', khotbah_cerita_anak: '', pembawa_firman: '', pianis: '',
};

function getStringValue(val: any): string {
  if (val === null || val === undefined) return '';
  return typeof val === 'object' ? String(val.nama || val.name || '') : String(val);
}

function getSafeDateString(isoString: any): string {
  return (isoString && typeof isoString === 'string') ? isoString.substring(0, 16) : '';
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // State Form Login Internal (.env.local Matcher)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // State Fitur Utama
  const [jadwals, setJadwals] = useState<JadwalRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Periksa status login dari localStorage saat pertama kali halaman dimuat
  useEffect(() => {
    const localStatus = localStorage.getItem('admin_authenticated');
    if (localStatus === 'true') {
      setIsLoggedIn(true);
    }
    setAuthLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jadwal_ibadah')
        .select('*')
        .order('tanggal_mulai', { ascending: false });
      if (error) throw error;
      setJadwals(data || []);
    } catch (err: any) {
      console.error(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn, loadData]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErr('');

    // Ambil data kredensial dari variabel .env.local
    const expectedUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    // COCOKKAN SECARA LOKAL
    if (usernameInput === expectedUsername && passwordInput === expectedPassword) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsLoggedIn(true);
    } else {
      setLoginErr('Username atau Password yang kamu masukkan salah!');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsLoggedIn(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-bold tracking-wider animate-pulse">MEMERIKSA OTORISASI...</div>;
  }

  // 🔒 TAMPILAN LOGIN JIKA BELUM AUTENTIKASI LOKAL
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border">
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Admin Login</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">GMAHK Ekklesia Management System</p>
          {loginErr && <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 rounded-xl font-medium">{loginErr}</div>}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
              {/* text-black ditambahkan di sini agar font saat mengetik berwarna hitam */}
              <input type="text" required value={usernameInput} onChange={e => setUsernameInput(e.target.value)} className="w-full mt-1 px-4 py-2.5 text-sm border rounded-xl bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
              {/* text-black ditambahkan di sini agar font saat mengetik berwarna hitam */}
              <input type="password" required value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full mt-1 px-4 py-2.5 text-sm border rounded-xl bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50">
              {loginLoading ? 'Memproses...' : 'Masuk Panel Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🔓 PANEL UTAMA ADMIN JIKA USERNAME & PASSWORD COCOK
  const filtered = jadwals.filter(j => {
    if (!j) return false;
    const s = search.toLowerCase().trim();
    return !s || getStringValue(j.judul).toLowerCase().includes(s) || getStringValue(j.jenis).toLowerCase().includes(s);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-xl font-black uppercase tracking-tight">Panel Admin Jadwal</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setShowAdd(true)} className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer">➕ Tambah Jadwal</button>
            <button onClick={handleLogout} className="px-4 py-2.5 bg-slate-800 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer">🚪 Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <div className="bg-white rounded-2xl border p-4 shadow-xs flex items-center gap-3">
          <span className="text-slate-400 text-sm pl-1">🔍</span>
          <input type="text" placeholder="Cari jadwal..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-transparent border-0 text-sm font-medium text-black focus:outline-none" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm animate-pulse">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">Tidak ada jadwal ditemukan.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(row => row?.id && (
              <JadwalCard key={row.id} row={row}
                onUpdated={upd => setJadwals(p => p.map(j => j?.id === upd?.id ? upd : j))}
                onDeleted={id => setJadwals(p => p.filter(j => j?.id !== id))}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={row => setJadwals(p => [row, ...p])} />}
    </div>
  );
}

// ─── Sub-Komponen Card & Modals ───────────────────────────────────────────────
function JadwalCard({ row, onUpdated, onDeleted }: { row: JadwalRow; onUpdated: (r: JadwalRow) => void; onDeleted: (id: string) => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus jadwal "${getStringValue(row.judul)}"?`)) return;
    setDelLoading(true);
    try {
      const { error } = await supabase.from('jadwal_ibadah').delete().eq('id', row.id);
      if (error) throw error;
      onDeleted(row.id);
    } catch (err: any) { alert(err.message); } finally { setDelLoading(false); }
  };

  return (
    <div className="bg-white border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">{getStringValue(row.judul) || 'Tanpa Judul'}</h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">{getStringValue(row.jenis)}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">🕒 {row.tanggal_mulai ? new Date(row.tanggal_mulai).toLocaleString('id-ID') : '─'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => setShowEdit(true)} className="px-4 py-2 text-xs border rounded-xl hover:bg-slate-50 font-semibold cursor-pointer">✏️ Edit</button>
        <button onClick={handleDelete} disabled={delLoading} className="px-4 py-2 text-xs bg-red-50 text-red-600 rounded-xl font-semibold cursor-pointer">{delLoading ? '...' : '🗑️ Hapus'}</button>
      </div>
      {showEdit && <EditModal row={row} onClose={() => setShowEdit(false)} onUpdated={onUpdated} />}
    </div>
  );
}

function FormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const upd = (key: keyof FormState, val: any) => setForm({ ...form, [key]: val === '' ? null : val });
  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Judul Acara</label><input type="text" required value={getStringValue(form.judul)} onChange={e => upd('judul', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl text-black" /></div>
        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</label><select value={getStringValue(form.jenis)} onChange={e => upd('jenis', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl bg-white text-black">{JENIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal & Waktu</label><input type="datetime-local" required value={getSafeDateString(form.tanggal_mulai)} onChange={e => upd('tanggal_mulai', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl text-black" /></div>
        <div className="sm:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Lokasi</label><input type="text" value={getStringValue(form.lokasi)} onChange={e => upd('lokasi', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl text-black" /></div>
        <div className="sm:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi</label><textarea value={getStringValue(form.deskripsi)} onChange={e => upd('deskripsi', e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl resize-none text-black" /></div>
      </div>
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-bold uppercase text-slate-900">🌅 Sesi I: Sekolah Sabat</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[{ k: 'ss_mc', l: 'MC / Protokol' }, { k: 'ss_doa_buka', l: 'Doa Buka' }, { k: 'ss_diskusi', l: 'Diskusi SS / Guru' }, { k: 'ss_mission', l: 'Cerita Mission' }, { k: 'ss_pp_doa', l: 'PP & Doa' }, { k: 'ss_persembahan', l: 'Ambil Persembahan' }].map(i => (
            <div key={i.k}><label className="text-[10px] font-bold text-slate-400 uppercase">{i.l}</label><input type="text" value={getStringValue((form as any)[i.k])} onChange={e => upd(i.k as any, e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl text-black" /></div>
          ))}
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-bold uppercase text-slate-900">📖 Sesi II: Kebaktian Utama</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[{ k: 'khotbah_lagu_pujian', l: 'Lagu Pujian' }, { k: 'khotbah_bacaan_persembahan', l: 'Bacaan Persembahan' }, { k: 'khotbah_mc', l: 'MC / Pemimpin Jemaat' }, { k: 'khotbah_cerita_anak', l: 'Cerita Anak' }, { k: 'pembawa_firman', l: 'Khotbah' }, { k: 'pianis', l: 'Pianis' }].map(i => (
            <div key={i.k}><label className="text-[10px] font-bold text-slate-400 uppercase">{i.l}</label><input type="text" value={getStringValue((form as any)[i.k])} onChange={e => upd(i.k as any, e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border rounded-xl text-black" /></div>
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
    e.preventDefault(); setSaving(true);
    try {
      const { data, error } = await supabase.from('jadwal_ibadah').insert([form]).select();
      if (error) throw error;
      if (data?.[0]) onAdded(data[0]);
      onClose();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col p-6 shadow-xl border">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm uppercase text-black">➕ Tambah Jadwal</h3><button onClick={onClose} className="cursor-pointer text-black">✕</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields form={form} setForm={setForm} />
          <button type="submit" disabled={saving} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold uppercase text-xs cursor-pointer">{saving ? 'Menyimpan...' : '💾 Simpan'}</button>
        </form>
      </div>
    </div>
  );
}

function EditModal({ row, onClose, onUpdated }: { row: JadwalRow; onClose: () => void; onUpdated: (r: JadwalRow) => void }) {
  const [form, setForm] = useState<FormState>({ ...row });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data, error } = await supabase.from('jadwal_ibadah').update(form).eq('id', row.id).select();
      if (error) throw error;
      if (data?.[0]) onUpdated(data[0]);
      onClose();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col p-6 shadow-xl border">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm uppercase text-black">✏️ Edit Jadwal</h3><button onClick={onClose} className="cursor-pointer text-black">✕</button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields form={form} setForm={setForm} />
          <button type="submit" disabled={saving} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold uppercase text-xs cursor-pointer">{saving ? 'Memperbarui...' : '💾 Simpan Perubahan'}</button>
        </form>
      </div>
    </div>
  );
}
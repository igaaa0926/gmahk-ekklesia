'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types & Interfaces ──────────────────────────────────────────────────────
type JadwalRow = {
  id: string;
  judul: string;
  tanggal_mulai: string;
  lokasi: string | null;
  jenis: string;
  deskripsi: string | null;
  // Field Sabat Lama
  ss_mc: string | null;
  ss_doa_buka: string | null;
  ss_diskusi: string | null;
  ss_mission: string | null;
  ss_pp_doa: string | null;
  ss_persembahan: string | null;
  khotbah_lagu_pujian: string | null;
  khotbah_mc: string | null;
  khotbah_cerita_anak: string | null;
  pembawa_firman: string | null;
  pianis: string | null;
  // Field Baru: Rabu Malam & Pemuda
  mc_doa_buka: string | null;
  doa_syafaat: string | null;
  renungan: string | null;
  operator: string | null;
  games: string | null;
  acara_inti: string | null;
  penanggung_jawab_id?: string | null;
};

type FormState = Omit<JadwalRow, 'id'>;

const JENIS_OPTIONS = [
  { value: 'Kebaktian Utama', label: '⛪ Kebaktian Utama (Sabat)' },
  { value: 'Rabu Malam', label: '🌙 Rabu Malam (Doa)' },
  { value: 'Pemuda', label: '🔥 Pertemuan Pemuda (PA)' },
  { value: 'Vesper', label: '🕯️ Ibadah Vesper' },
];

const INITIAL_FORM: FormState = {
  judul: '',
  tanggal_mulai: '',
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
  khotbah_mc: '',
  khotbah_cerita_anak: '',
  pembawa_firman: '',
  pianis: '',
  mc_doa_buka: '',
  doa_syafaat: '',
  renungan: '',
  operator: '',
  games: '',
  acara_inti: '',
  penanggung_jawab_id: null
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
  
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [jadwals, setJadwals] = useState<JadwalRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

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

    const expectedUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (usernameInput === expectedUsername && passwordInput === expectedPassword) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsLoggedIn(true);
    } else {
      setLoginErr('Username atau Password salah!');
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
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memeriksa Otorisasi...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20 transform transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-inner">
            🔐
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Admin Panel</h2>
          <p className="text-xs font-medium text-slate-500 mt-1 mb-8">GMAHK Ekklesia Management System</p>
          
          {loginErr && (
            <div className="mb-6 p-3.5 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl font-semibold flex items-center gap-2 justify-center">
              ⚠️ {loginErr}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                required 
                value={usernameInput} 
                onChange={e => setUsernameInput(e.target.value)} 
                className="w-full mt-1.5 px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-black font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="Masukkan username admin"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                required 
                value={passwordInput} 
                onChange={e => setPasswordInput(e.target.value)} 
                className="w-full mt-1.5 px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-black font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loginLoading} 
              className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {loginLoading ? 'Membuka Panel...' : 'Masuk Sistem Admin →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = jadwals.filter(j => {
    if (!j) return false;
    const s = search.toLowerCase().trim();
    return !s || getStringValue(j.judul).toLowerCase().includes(s) || getStringValue(j.jenis).toLowerCase().includes(s);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 antialiased">
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-xl">
              ⛪
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight">GMAHK Ekklesia</h1>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Sistem Manajemen Jadwal Jemaat</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowAdd(true)} 
              className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-blue-600/10 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              ➕ Tambah Jadwal Baru
            </button>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
            >
              🚪 Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <span className="text-slate-400 text-lg pl-1">🔍</span>
          <input 
            type="text" 
            placeholder="Cari berdasarkan judul jadwal atau kategori ibadah..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full bg-transparent border-0 text-sm font-semibold text-black focus:outline-none placeholder:text-slate-400" 
          />
        </div>

        {loading ? (
          <div className="text-center py-24 text-slate-400 text-sm font-medium animate-pulse flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            Memuat daftar data jadwal...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400 text-sm font-medium shadow-2xs">
            📭 Tidak ada jadwal ibadah yang ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filtered.map(row => row?.id && (
              <JadwalCard 
                key={row.id} 
                row={row}
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

// ─── Component: Card Data Jadwal Jemaat ───────────────────────────────────────
function JadwalCard({ row, onUpdated, onDeleted }: { row: JadwalRow; onUpdated: (r: JadwalRow) => void; onDeleted: (id: string) => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jadwal "${getStringValue(row.judul)}"?`)) return;
    setDelLoading(true);
    try {
      const { error } = await supabase.from('jadwal_ibadah').delete().eq('id', row.id);
      if (error) throw error;
      onDeleted(row.id);
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setDelLoading(false); 
    }
  };

  const getBadgeStyle = (jenis: string) => {
    switch(jenis) {
      case 'Kebaktian Utama': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Rabu Malam': return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'Pemuda': return 'bg-orange-50 text-orange-700 border-orange-200/60';
      case 'Vesper': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 hover:border-blue-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base tracking-tight">{getStringValue(row.judul) || 'Tanpa Judul'}</h3>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(getStringValue(row.jenis))}`}>
            {getStringValue(row.jenis)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">📅 {row.tanggal_mulai ? new Date(row.tanggal_mulai).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '─'} WIB</span>
          <span className="flex items-center gap-1 text-slate-400">📍 {getStringValue(row.lokasi) || 'Gereja'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
        <button 
          onClick={() => setShowEdit(true)} 
          className="px-4 py-2 text-xs border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-bold shadow-2xs cursor-pointer transition-colors"
        >
          ✏️ Edit Detail
        </button>
        <button 
          onClick={handleDelete} 
          disabled={delLoading} 
          className="px-4 py-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50"
        >
          {delLoading ? '...' : '🗑️ Hapus'}
        </button>
      </div>
      {showEdit && <EditModal row={row} onClose={() => setShowEdit(false)} onUpdated={onUpdated} />}
    </div>
  );
}

// ─── Component: Form Fields Input (Dinamis Berdasarkan Kategori) ────────────────────
function FormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const upd = (key: keyof FormState, val: any) => setForm({ ...form, [key]: val === '' ? null : val });
  
  const inputStyle = "w-full mt-1.5 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white text-black font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
  const labelStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-wider";

  const currentJenis = getStringValue(form.jenis);

  return (
    <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 text-left scrollbar-thin">
      {/* Section 1: Informasi Pokok Ibadah */}
      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelStyle}>Judul Acara / Tema Ibadah</label>
          <input type="text" required value={getStringValue(form.judul)} onChange={e => upd('judul', e.target.value)} className={inputStyle} placeholder="Contoh: Kebaktian Sabat Suci, Kuasa Doa, PA Pemuda" />
        </div>
        <div>
          <label className={labelStyle}>Kategori Ibadah</label>
          <select value={currentJenis} onChange={e => upd('jenis', e.target.value)} className={`${inputStyle} bg-white`}>
            {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle}>Tanggal & Waktu Mulai</label>
          <input type="datetime-local" required value={getSafeDateString(form.tanggal_mulai)} onChange={e => upd('tanggal_mulai', e.target.value)} className={inputStyle} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelStyle}>Lokasi Pelaksanaan</label>
          <input type="text" value={getStringValue(form.lokasi)} onChange={e => upd('lokasi', e.target.value)} className={inputStyle} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelStyle}>Deskripsi Tambahan</label>
          <textarea value={getStringValue(form.deskripsi)} onChange={e => upd('deskripsi', e.target.value)} rows={2} className={`${inputStyle} resize-none`} placeholder="Keterangan opsional..." />
        </div>
      </div>

      {/* ================= CONDITIONALLY RENDERED SECTIONS ================= */}

      {/* ⛪ FORM KHUSUS: SABAT / KEBAKTIAN UTAMA */}
      {(currentJenis === 'Kebaktian Utama' || currentJenis === 'Sabat Sekolah' || currentJenis === 'Vesper') && (
        <>
          {/* Sesi 1: Sekolah Sabat */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-base">🌅</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Sesi I: Petugas Sekolah Sabat</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { k: 'ss_mc', l: 'MC / Protokol' },
                { k: 'ss_doa_buka', l: 'Doa Pembuka' },
                { k: 'ss_diskusi', l: 'Pemimpin Diskusi / Guru SS' },
                { k: 'ss_mission', l: 'Pembaca Cerita Mission' },
                { k: 'ss_pp_doa', l: 'Pujian & Doa Syafaat' },
                { k: 'ss_persembahan', l: 'Petugas Ambil Persembahan' }
              ].map(i => (
                <div key={i.k}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{i.l}</label>
                  <input type="text" value={getStringValue((form as any)[i.k])} onChange={e => upd(i.k as any, e.target.value)} className={inputStyle} placeholder="Nama petugas" />
                </div>
              ))}
            </div>
          </div>

          {/* Sesi 2: Kebaktian Utama */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-base">📖</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Sesi II: Petugas Kebaktian Utama</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { k: 'khotbah_lagu_pujian', l: 'Lagu Pujian Jemaat' },
                { k: 'khotbah_mc', l: 'MC / Pemimpin Jemaat' },
                { k: 'khotbah_cerita_anak', l: 'Cerita Anak-anak' },
                { k: 'pembawa_firman', l: 'Pembawa Firman (Khotbah)' },
                { k: 'pianis', l: 'Pianis / Organis' }
              ].map(i => (
                <div key={i.k}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{i.l}</label>
                  <input type="text" value={getStringValue((form as any)[i.k])} onChange={e => upd(i.k as any, e.target.value)} className={inputStyle} placeholder="Nama petugas" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 🌙 FORM KHUSUS: RABU MALAM */}
      {currentJenis === 'Rabu Malam' && (
        <div className="bg-white rounded-2xl p-5 border border-purple-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-100">
            <span className="text-base">🌙</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-900">Susunan Petugas Doa Rabu Malam</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { k: 'mc_doa_buka', l: 'MC & Doa Buka' },
              { k: 'doa_syafaat', l: 'Doa Syafaat' },
              { k: 'renungan', l: 'Renungan Firman' },
              { k: 'operator', l: 'Operator Multimedia / Sound' }
            ].map(i => (
              <div key={i.k}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{i.l}</label>
                <input type="text" value={getStringValue((form as any)[i.k])} onChange={e => upd(i.k as any, e.target.value)} className={inputStyle} placeholder="Nama petugas" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 FORM KHUSUS: PERTEMUAN PEMUDA (PA) */}
      {currentJenis === 'Pemuda' && (
        <div className="bg-white rounded-2xl p-5 border border-orange-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
            <span className="text-base">🔥</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-900">Susunan Petugas Pertemuan Pemuda</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { k: 'mc_doa_buka', l: 'MC / Doa Buka Pemuda' },
              { k: 'games', l: 'Pemimpin Games / Aktivitas' },
              { k: 'acara_inti', l: 'Penanggung Jawab Acara Inti / Renungan' }
            ].map(i => (
              <div key={i.k}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{i.l}</label>
                <input type="text" value={getStringValue((form as any)[i.k])} onChange={e => upd(i.k as any, e.target.value)} className={inputStyle} placeholder="Nama petugas" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component: Modal Tambah Data ───────────────────────────────────────────
function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: (r: JadwalRow) => void }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      const { data, error } = await supabase.from('jadwal_ibadah').insert([form]).select();
      if (error) throw error;
      if (data?.[0]) onAdded(data[0]);
      onClose();
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl flex flex-col p-6 shadow-2xl border border-slate-100 transform transition-all my-8">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">➕ Tambah Jadwal Baru</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <FormFields form={form} setForm={setForm} />
          <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-wider cursor-pointer">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-600/10 cursor-pointer disabled:opacity-50">
              {saving ? 'Menyimpan...' : '💾 Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Component: Modal Edit Data ─────────────────────────────────────────────
function EditModal({ row, onClose, onUpdated }: { row: JadwalRow; onClose: () => void; onUpdated: (r: JadwalRow) => void }) {
  const [form, setForm] = useState<FormState>({ ...row });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      const { data, error } = await supabase.from('jadwal_ibadah').update(form).eq('id', row.id).select();
      if (error) throw error;
      if (data?.[0]) onUpdated(data[0]);
      onClose();
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl flex flex-col p-6 shadow-2xl border border-slate-100 transform transition-all my-8">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">✏️ Edit Jadwal Jemaat</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <FormFields form={form} setForm={setForm} />
          <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-wider cursor-pointer">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-600/10 cursor-pointer disabled:opacity-50">
              {saving ? 'Memperbarui...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
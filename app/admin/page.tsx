'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ─── INTERFACES & TYPES ──────────────────────────────────────────────────────
interface FormState {
  id?: string;
  judul: string | null;
  jenis: string | null;
  tanggal_mulai: string | null;
  lokasi: string | null;
  deskripsi: string | null;
  // Sesi I (Sekolah Sabat)
  ss_mc: string | null;
  ss_doa_buka: string | null;
  ss_diskusi: string | null;
  ss_mission: string | null;
  ss_pp_doa: string | null;
  ss_persembahan: string | null;
  // Sesi II (Kebaktian Utama)
  khotbah_lagu_pujian: string | null;
  khotbah_mc: string | null;
  khotbah_cerita_anak: string | null;
  pembawa_firman: string | null;
  pianis: string | null;
  // Doa Rabu Malam / Pemuda
  mc_doa_buka: string | null;
  doa_syafaat: string | null;
  renungan: string | null;
  operator: string | null;
  games: string | null;
  acara_inti: string | null;
}

const INITIAL_FORM: FormState = {
  judul: '', jenis: 'Kebaktian Utama (Sabat)', tanggal_mulai: '', lokasi: 'Gedung Gereja GMAHK Ekklesia', deskripsi: '',
  ss_mc: '', ss_doa_buka: '', ss_diskusi: '', ss_mission: '', ss_pp_doa: '', ss_persembahan: '',
  khotbah_lagu_pujian: '', khotbah_mc: '', khotbah_cerita_anak: '', pembawa_firman: '', pianis: '',
  mc_doa_buka: '', doa_syafaat: '', renungan: '', operator: '', games: '', acara_inti: ''
};

const JENIS_OPTIONS = [
  { value: 'Kebaktian Utama (Sabat)', label: '⛪ Kebaktian Utama (Sabat)' },
  { value: 'Rabu Malam', label: '🌙 Doa Rabu Malam' },
  { value: 'Ibadah Pemuda', label: '🔥 Ibadah Pemuda (PA)' }
];

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
const getStringValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val);
};

const getSafeDateString = (val: any): string => {
  if (!val) return '';
  const str = String(val);
  return str.length >= 16 ? str.substring(0, 16) : str;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ambil data jadwal dari Supabase
  const fetchJadwal = async () => {
    try {
      const { data, error } = await supabase
        .from('jadwal_ibadah')
        .select('*')
        .order('tanggal_mulai', { ascending: false });
      if (error) throw error;
      setJadwalList(data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchJadwal();
    }
  }, [isAuthenticated]);

  // Handle Login Sederhana
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'adminEkklesia';
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'jayajaya';

    if (username === adminUser && password === adminPass) {
      setIsAuthenticated(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Username atau Password salah!');
    }
  };

  // Buka Modal Tambah Baru
  const handleOpenCreate = () => {
    setForm(INITIAL_FORM);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (item: any) => {
    setErrorMsg(null);
    // Masukkan data item ke form state
    const mappedForm: FormState = { ...INITIAL_FORM, ...item };
    setForm(mappedForm);
    setIsModalOpen(true);
  };

  // Simpan Data (Insert atau Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = { ...form };
      if (!payload.judul || !payload.tanggal_mulai) {
        throw new Error('Judul dan Tanggal wajib diisi!');
      }

      if (payload.id) {
        // Mode Update
        const { error } = await supabase
          .from('jadwal_ibadah')
          .update(payload)
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        // Mode Insert Baru
        delete payload.id;
        const { error } = await supabase
          .from('jadwal_ibadah')
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setForm(INITIAL_FORM);
      await fetchJadwal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  // Hapus Data
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    try {
      const { error } = await supabase.from('jadwal_ibadah').delete().eq('id', id);
      if (error) throw error;
      await fetchJadwal();
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  // Tampilan jika belum login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <h2 className="text-xl font-black text-slate-950 mb-2">Panel Management Admin</h2>
          <p className="text-xs text-slate-500 mb-6">GMAHK EKKLESIA TAMBAK SADANG</p>
          {errorMsg && <p className="text-xs text-red-500 font-bold mb-4 bg-red-50 p-2.5 rounded-xl">{errorMsg}</p>}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full mt-1 px-4 py-2.5 text-sm border rounded-xl bg-slate-50 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 px-4 py-2.5 text-sm border rounded-xl bg-slate-50 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md">Masuk System</button>
          </form>
        </div>
      </div>
    );
  }

  // Tampilan Dashboard Utama Admin
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Navbar */}
      <div className="bg-slate-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-base font-black tracking-wide">GMAHK EKKLESIA ADMIN</h1>
          <p className="text-[10px] text-slate-400 font-medium">Sistem Informasi Penjadwalan Pelayanan Jemaat</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-500 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm">
          <span>➕</span> Tambah Jadwal Baru
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">Daftar Jadwal Pelayanan Aktif</h3>
        
        {jadwalList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-sm text-slate-400 font-medium shadow-xs">
            Belum ada jadwal ibadah yang dimasukkan ke dalam sistem.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Acara / Tema</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Tanggal Waktu</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-900">
                  {jadwalList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-950">{item.judul}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded-lg">{item.jenis}</span></td>
                      <td className="px-5 py-4 text-xs font-mono text-slate-500">{new Date(item.tanggal_mulai).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(item)} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-lg border border-amber-200/50 transition-all">📝 Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg border border-red-200/50 transition-all">🗑️ Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL DIALOG POPUP (TAMBAH & EDIT JADWAL) ────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{form.id ? '📝' : '✨'}</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  {form.id ? 'Edit Jadwal Jemaat' : 'Tambah Jadwal Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm">✕</button>
            </div>

            {/* Error di dalam modal */}
            {errorMsg && <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200">{errorMsg}</div>}

            {/* Form Konten Input */}
            <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 flex-1 overflow-y-auto">
                <FormFields form={form} setForm={setForm} />
              </div>

              {/* Footer Modal Action Buttons */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all">
                  BATAL
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                  <span>💾</span> {isSaving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT: FORM FIELDS INPUT (DINAMIS & LUWES) ─────────────────────────
function FormFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const upd = (key: keyof FormState, val: any) => setForm({ ...form, [key]: val === '' ? null : val });
  
  const inputStyle = "w-full mt-1.5 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white text-black font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
  const labelStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-wider";

  // Ambil text kategori lalu jadikan huruf kecil untuk pencarian fleksibel
  const currentJenis = getStringValue(form.jenis).toLowerCase().trim();

  // Kondisional fleksibel menggunakan .includes() agar mengenali data lama ("Kebaktian Utama") maupun baru
  const isSabatAtauUtama = currentJenis.includes('kebaktian utama') || currentJenis.includes('sabat') || currentJenis.includes('sekolah sabat');
  const isRabuMalam = currentJenis.includes('rabu malam');
  const isPemuda = currentJenis.includes('pemuda') || currentJenis.includes('pa ');

  return (
    <div className="space-y-6 text-left">
      {/* Section 1: Informasi Pokok Ibadah */}
      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelStyle}>Judul Acara / Tema Ibadah</label>
          <input type="text" required value={getStringValue(form.judul)} onChange={e => upd('judul', e.target.value)} className={inputStyle} placeholder="Contoh: Kebaktian Sabat, Kuasa Doa, PA Pemuda" />
        </div>
        <div>
          <label className={labelStyle}>Kategori Ibadah</label>
          <select value={getStringValue(form.jenis)} onChange={e => upd('jenis', e.target.value)} className={`${inputStyle} bg-white`}>
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

      {/* ================= SEKSI PETUGAS KONDISIONAL ================= */}

      {/* ⛪ JIKA KATEGORI ADALAH SABAT / KEBAKTIAN UTAMA */}
      {isSabatAtauUtama && (
        <>
          {/* Sesi I: Sekolah Sabat */}
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

          {/* Sesi II: Kebaktian Utama */}
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

      {/* 🌙 JIKA KATEGORI DOA RABU MALAM */}
      {isRabuMalam && (
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

      {/* 🔥 JIKA KATEGORI IBADAH PEMUDA (PA) */}
      {isPemuda && (
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
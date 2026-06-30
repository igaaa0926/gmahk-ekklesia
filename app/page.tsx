'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Ditambahkan untuk navigasi aman ke halaman admin
import { supabase } from '@/lib/supabase';

// ─── Types & Interfaces ──────────────────────────────────────────────────────
type JadwalRow = {
  id: string;
  judul: string;
  tanggal_mulai: string;
  lokasi: string | null;
  jenis: string;
  deskripsi: string | null;
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
};

function getStringValue(val: any): string {
  if (val === null || val === undefined) return '';
  return typeof val === 'object' ? String(val.nama || val.name || '') : String(val);
}

// ✨ Fungsi Format Tanggal Aman (Bebas Eror Terminal)
function formatJadwalDate(isoString: string | null): string {
  if (!isoString) return '─';
  try {
    const dateObj = new Date(isoString);
    const namaHari = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
    const detailWaktu = dateObj.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${namaHari}, ${detailWaktu} WIB`;
  } catch (err) {
    return isoString;
  }
}

// ─── Main Public Component ───────────────────────────────────────────────────
export default function PublicJadwalPage() {
  const [jadwals, setJadwals] = useState<JadwalRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalRow | null>(null);

  useEffect(() => {
    async function loadPublicData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jadwal_ibadah')
          .select('*')
          .order('tanggal_mulai', { ascending: true });
        if (error) throw error;
        setJadwals(data || []);
      } catch (err) {
        console.error('Gagal mengambil data jadwal jemaat:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, []);

  const filtered = jadwals.filter(j => {
    if (!j) return false;
    const s = search.toLowerCase().trim();
    return !s || getStringValue(j.judul).toLowerCase().includes(s) || getStringValue(j.jenis).toLowerCase().includes(s);
  });

  const getBadgeStyle = (jenis: string) => {
    const typeStr = getStringValue(jenis).toLowerCase();
    if (typeStr.includes('utama') || typeStr.includes('umum')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    } else if (typeStr.includes('sabat') || typeStr.includes('sekolah')) {
      return 'bg-amber-50 text-amber-700 border-amber-200/60';
    } else if (typeStr.includes('rabu') || typeStr.includes('doa')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 antialiased flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Container Utama untuk Konten Atas */}
      <div className="flex-grow">
        {/* Premium Public Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white py-16 px-4 text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-xl">
              ⛪
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">GMAHK EKKLESIA</h1>
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-blue-400 uppercase">Informasi Jadwal Pelayanan & Susunan Acara Ibadah</p>
            <div className="w-12 h-1 bg-blue-500 mx-auto rounded-full mt-4"></div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto px-4 -mt-7 relative z-20 space-y-6">
          {/* Search Input Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <span className="text-slate-400 text-lg pl-1">🔍</span>
            <input 
              type="text" 
              placeholder="Cari tema khotbah, pembicara, atau kategori ibadah..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-transparent border-0 text-sm font-semibold text-black focus:outline-none placeholder:text-slate-400" 
            />
          </div>

          {/* Info Grid List */}
          {loading ? (
            <div className="text-center py-24 text-slate-400 text-sm font-medium flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
              Menyelaraskan data jadwal jemaat...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center text-slate-400 text-sm font-medium shadow-sm">
              📭 Belum ada jadwal ibadah yang cocok atau dipublikasikan.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map(row => (
                <div 
                  key={row.id}
                  onClick={() => setSelectedJadwal(row)}
                  className="bg-white border border-slate-200/70 hover:border-blue-400 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(row.jenis)}`}>
                        {getStringValue(row.jenis)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">📍 {getStringValue(row.lokasi) || 'Gereja'}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{getStringValue(row.judul) || 'Tanpa Tema'}</h3>
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                      📅 {formatJadwalDate(row.tanggal_mulai)}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    Lihat Susunan Petugas ➜
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ─── FOOTER JEMAAT + TOMBOL AKSES ADMIN ELEGAN ─── */}
      <footer className="w-full text-center mt-12 pt-6 border-t border-slate-200/60 max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-medium">
        <div>
          © {new Date().getFullYear()} GMAHK Ekklesia. Hak Cipta Dilindungi.
        </div>
        <div>
          <Link 
            href="/admin" 
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors font-bold flex items-center gap-1 border border-slate-200/40"
          >
            🔐 Panel Manajemen Admin
          </Link>
        </div>
      </footer>

      {/* ─── MODAL DETAIL: SUSUNAN PETUGAS IBADAH (PREMIUM VIEW) ─── */}
      {selectedJadwal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col p-6 shadow-2xl border border-slate-100 my-8 transform transition-all animate-fade-in">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${getBadgeStyle(selectedJadwal.jenis)}`}>
                  {selectedJadwal.jenis}
                </span>
                <h3 className="font-black text-slate-900 text-xl tracking-tight mt-1">{getStringValue(selectedJadwal.judul)}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  📅 {formatJadwalDate(selectedJadwal.tanggal_mulai)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedJadwal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Susunan Acara & Petugas Grid */}
            <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin text-left">
              {selectedJadwal.deskripsi && (
                <div className="bg-blue-50/50 border border-blue-100/70 rounded-xl p-3.5 text-xs text-slate-700 font-medium">
                  💬 <span className="font-bold text-blue-900">Catatan Jemaat:</span> {selectedJadwal.deskripsi}
                </div>
              )}

              {/* Sesi I: Sekolah Sabat */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60">
                  <span className="text-sm">🌅</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Sesi I: Sekolah Sabat</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { label: 'MC / Protokol', value: selectedJadwal.ss_mc },
                    { label: 'Doa Pembuka', value: selectedJadwal.ss_doa_buka },
                    { label: 'Pemimpin Diskusi / Guru', value: selectedJadwal.ss_diskusi },
                    { label: 'Cerita Mission', value: selectedJadwal.ss_mission },
                    { label: 'Pujian & Doa', value: selectedJadwal.ss_pp_doa },
                    { label: 'Ambil Persembahan', value: selectedJadwal.ss_persembahan },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
                      <span className="text-xs font-bold text-black">{getStringValue(item.value) || '─'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sesi II: Kebaktian Utama */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <span className="text-sm">📖</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Sesi II: Kebaktian Utama</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { label: 'Lagu Pujian', value: selectedJadwal.khotbah_lagu_pujian },
                    { label: 'MC / Pemimpin Jemaat', value: selectedJadwal.khotbah_mc },
                    { label: 'Cerita Anak-anak', value: selectedJadwal.khotbah_cerita_anak },
                    { label: 'Khotbah (Firman)', value: selectedJadwal.pembawa_firman },
                    { label: 'Pianis / Organis', value: selectedJadwal.pianis },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
                      <span className="text-xs font-bold text-blue-900">{getStringValue(item.value) || '─'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-100 mt-5 flex justify-end">
              <button 
                onClick={() => setSelectedJadwal(null)} 
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer text-center"
              >
                Tutup Detail Acara
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
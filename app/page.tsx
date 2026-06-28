'use client';

import { useEffect, useState } from 'react';
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
  ss_mc: string | null;
  ss_doa_buka: string | null;
  ss_diskusi: string | null;
  ss_mission: string | null;
  ss_pp_doa: string | null;
  ss_persembahan: string | null;
  khotbah_lagu_pujian: string | null;
  khotbah_bacaan_persembahan: string | null;
  khotbah_mc: string | null;
  khotbah_cerita_anak: string | null;
  pembawa_firman: string | null;
  pianis: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SS_ROLES: { key: keyof JadwalRow; label: string }[] = [
  { key: 'ss_mc',          label: 'MC / Protokol' },
  { key: 'ss_doa_buka',    label: 'Doa Buka' },
  { key: 'ss_diskusi',     label: 'Diskusi SS / Guru' },
  { key: 'ss_mission',     label: 'Cerita Mission' },
  { key: 'ss_pp_doa',      label: 'PP & Doa / Pemimpin Lagu' },
  { key: 'ss_persembahan', label: 'Ambil Persembahan' },
];

const KHOTBAH_ROLES: { key: keyof JadwalRow; label: string }[] = [
  { key: 'khotbah_lagu_pujian',        label: 'Lagu Pujian' },
  { key: 'khotbah_bacaan_persembahan', label: 'Bacaan Persembahan' },
  { key: 'khotbah_mc',                 label: 'MC / Pemimpin Jemaat' },
  { key: 'khotbah_cerita_anak',        label: 'Cerita Anak-anak' },
  { key: 'pembawa_firman',             label: 'Khotbah' },
  { key: 'pianis',                     label: 'Pianis' },
];

const JENIS_LABEL: Record<string, string> = {
  ibadah_umum: 'Kebaktian Utama',
  doa: 'Ibadah Doa',
  pemuda: 'Pemuda',
  anak: 'Sekolah Sabat Anak',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmtTanggal(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function RoleRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-400 font-medium shrink-0">{label}</span>
      <span className="text-slate-800 font-semibold text-right">{value || '─'}</span>
    </div>
  );
}

function AdminGate() {
  return (
    <div className="flex justify-center">
      <a href="/admin"
        className="text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200/60 transition-all">
        🔐 Masuk ke Panel Admin
      </a>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [jadwals, setJadwals] = useState<JadwalRow[]>([]);
  const [selected, setSelected] = useState<JadwalRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('jadwal_ibadah')
          .select('*')
          .order('tanggal_mulai', { ascending: false });

        if (error) throw error;
        if (data) {
          setJadwals(data);
          if (data.length > 0) setSelected(data[0]);
        }
      } catch (err) {
        console.error('Gagal memuat jadwal:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased pb-16">
      <header className="bg-[#1a3a6e] text-white py-12 px-4 shadow-md text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] tracking-widest font-black uppercase bg-white/10 px-3 py-1 rounded-full border border-white/20">
            GMAHK EKKLESIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">WARTA & PELAYANAN JEMAAT</h1>
          <p className="text-blue-100/80 text-xs font-medium max-w-md mx-auto">
            Selamat Hari Sabat. Berikut susunan penatalayanan ibadah serta informasi aktivitas jemaat kita.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="md:col-span-3 text-center py-20 text-slate-400 text-sm font-medium">
            Memuat susunan ibadah jemaat…
          </div>
        ) : jadwals.length === 0 ? (
          <div className="md:col-span-3 text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-6">
            <p className="text-slate-400 text-sm font-medium">Belum ada jadwal ibadah yang diterbitkan.</p>
          </div>
        ) : (
          <>
            <div className="md:col-span-2 space-y-6">
              {selected && (
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md uppercase mb-2">
                      {JENIS_LABEL[selected.jenis] ?? selected.jenis}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 leading-tight uppercase">{selected.judul}</h2>
                    <p className="text-slate-400 text-xs font-medium mt-1">{fmtTanggal(selected.tanggal_mulai)}</p>
                    {selected.lokasi && (
                      <p className="text-slate-500 text-xs mt-1 font-semibold flex items-center gap-1">
                        📍 {selected.lokasi}
                      </p>
                    )}
                  </div>

                  {selected.deskripsi && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed font-medium">
                      {selected.deskripsi}
                    </div>
                  )}

                  {/* Sesi I: Sekolah Sabat */}
                  <div className="bg-gradient-to-b from-slate-50/50 to-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200/60">
                      <span className="text-base">🌅</span> Sesi I: Sekolah Sabat
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {SS_ROLES.map(r => (
                        <RoleRow key={r.key} label={r.label} value={selected[r.key]} />
                      ))}
                    </div>
                  </div>

                  {/* Sesi II: Khotbah */}
                  <div className="bg-gradient-to-b from-slate-50/50 to-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200/60">
                      <span className="text-base">📖</span> Sesi II: Kebaktian Utama
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {KHOTBAH_ROLES.map(r => (
                        <RoleRow key={r.key} label={r.label} value={selected[r.key]} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Arsip Jadwal Pekanan
              </h3>
              <div className="space-y-2">
                {jadwals.map(j => (
                  <button key={j.id} onClick={() => setSelected(j)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all cursor-pointer
                      ${selected?.id === j.id
                        ? 'bg-[#1a3a6e] border-[#1a3a6e] text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-snug">{j.judul}</p>
                      <p className={`text-xs mt-0.5 ${selected?.id === j.id ? 'text-blue-200' : 'text-slate-400'}`}>
                        {fmtTanggal(j.tanggal_mulai)}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full
                      ${selected?.id === j.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {JENIS_LABEL[j.jenis] ?? j.jenis}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 mt-12">
        <div className="pt-4 border-t border-slate-200">
          <AdminGate />
        </div>
      </footer>
    </div>
  );
}
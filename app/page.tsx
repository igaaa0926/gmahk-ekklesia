'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

function formatJamSingkat(isoString: string | null): string {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar'
    });
  } catch { return ''; }
}

// ─── Jenis config ──────────────────────────────────────────────────────────
type JenisKey = 'ibadah_umum' | 'umum' | 'utama' | 'doa' | 'rabu' | 'sabat' | 'sekolah' | 'pemuda' | 'default';

const JENIS_CONFIG: Record<JenisKey | string, { dot: string; badge: string; label: string }> = {
  ibadah_umum: { dot: '#1D9E75', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70', label: 'Ibadah Umum' },
  umum:        { dot: '#1D9E75', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70', label: 'Ibadah Umum' },
  utama:       { dot: '#1D9E75', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70', label: 'Ibadah Utama' },
  doa:         { dot: '#534AB7', badge: 'bg-violet-50 text-violet-800 border border-violet-200/70', label: 'Ibadah Doa' },
  rabu:        { dot: '#534AB7', badge: 'bg-violet-50 text-violet-800 border border-violet-200/70', label: 'Doa Malam' },
  sabat:       { dot: '#BA7517', badge: 'bg-amber-50 text-amber-800 border border-amber-200/70', label: 'Sekolah Sabat' },
  sekolah:     { dot: '#BA7517', badge: 'bg-amber-50 text-amber-800 border border-amber-200/70', label: 'Sekolah Sabat' },
  pemuda:      { dot: '#378ADD', badge: 'bg-blue-50 text-blue-800 border border-blue-200/70', label: 'Pemuda' },
  default:     { dot: '#888780', badge: 'bg-slate-100 text-slate-600 border border-slate-200/70', label: '' },
};

function getJenisConfig(jenis: string) {
  const key = getStringValue(jenis).toLowerCase();
  for (const k of Object.keys(JENIS_CONFIG)) {
    if (key.includes(k)) return JENIS_CONFIG[k];
  }
  return JENIS_CONFIG.default;
}

// ─── Komponen Atom ──────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-slate-100 my-0" />;
}

function PetugasRow({ label, value }: { label: string; value: string | null }) {
  const nama = getStringValue(value);
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs text-slate-500 font-medium shrink-0 w-36">{label}</span>
      <span className={`text-sm font-semibold text-right ${nama ? 'text-slate-900' : 'text-slate-300'}`}>
        {nama || '—'}
      </span>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-16 bg-slate-100 rounded-full" />
          <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
          <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 w-24 bg-slate-100 rounded-full mt-1" />
      </div>
    </div>
  );
}

// ─── Jadwal Card ─────────────────────────────────────────────────────────────
function JadwalCard({ row, onClick }: { row: JadwalRow; onClick: () => void }) {
  const cfg = getJenisConfig(row.jenis);
  const jenisLabel = cfg.label || getStringValue(row.jenis);

  const hasPetugas =
    [row.ss_mc, row.ss_diskusi, row.pembawa_firman, row.khotbah_mc].some(Boolean);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-200/80
        hover:border-slate-300 hover:shadow-md active:scale-[0.995]
        transition-all duration-200 overflow-hidden group"
    >
      {/* Accent strip */}
      <div className="h-0.5 w-full" style={{ backgroundColor: cfg.dot }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.badge}`}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                {jenisLabel}
              </span>
              {hasPetugas && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                  bg-slate-900 text-white">
                  Petugas Tersedia
                </span>
              )}
            </div>

            {/* Judul */}
            <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-1.5
              group-hover:text-slate-700 transition-colors">
              {getStringValue(row.judul) || 'Tanpa Tema'}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {formatJadwalDate(row.tanggal_mulai)}
              </span>
              {row.lokasi && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  {getStringValue(row.lokasi)}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="mt-1 shrink-0 w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-slate-100
            flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Modal Detail Petugas ─────────────────────────────────────────────────────
function ModalDetail({ jadwal, onClose }: { jadwal: JadwalRow; onClose: () => void }) {
  const cfg = getJenisConfig(jadwal.jenis);
  const jenisLabel = cfg.label || getStringValue(jadwal.jenis);

  const sesiSS = [
    { label: 'MC / Protokol',        value: jadwal.ss_mc },
    { label: 'Doa Pembuka',          value: jadwal.ss_doa_buka },
    { label: 'Diskusi SS / Guru',    value: jadwal.ss_diskusi },
    { label: 'Cerita Mission',       value: jadwal.ss_mission },
    { label: 'Pujian & Doa',        value: jadwal.ss_pp_doa },
    { label: 'Ambil Persembahan',    value: jadwal.ss_persembahan },
  ];

  const sesiKhotbah = [
    { label: 'Lagu Pujian Spesial',  value: jadwal.khotbah_lagu_pujian },
    { label: 'MC / Pemimpin Jemaat', value: jadwal.khotbah_mc },
    { label: 'Cerita Anak-anak',     value: jadwal.khotbah_cerita_anak },
    { label: 'Pembawa Firman',       value: jadwal.pembawa_firman },
    { label: 'Pianis / Organis',     value: jadwal.pianis },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl
        shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden">

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-5 shrink-0">
          {/* Pill drag handle (mobile) */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.badge}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  {jenisLabel}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                {getStringValue(jadwal.judul) || 'Detail Ibadah'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1.5">
                {formatJadwalDate(jadwal.tanggal_mulai)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300
                flex items-center justify-center text-slate-500 transition-colors"
              aria-label="Tutup"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Catatan deskripsi */}
          {jadwal.deskripsi && (
            <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3
              text-xs text-slate-700 font-medium leading-relaxed">
              <span className="text-slate-400 mr-1.5">Catatan:</span>
              {jadwal.deskripsi}
            </div>
          )}
        </div>

        <Divider />

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-0">

          {/* Sesi I: Sekolah Sabat */}
          <div className="pt-5 pb-1">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3v1m0 16v1m8.66-10H20M4 12H3m15.07-6.07-.71.71M6.64 17.36l-.71.71m12.73 0-.71-.71M6.64 6.64l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Sesi I</p>
                <p className="text-[11px] text-slate-500 font-semibold -mt-0.5">Sekolah Sabat</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100/80">
              {sesiSS.map((item, i) => (
                <PetugasRow key={i} label={item.label} value={item.value} />
              ))}
            </div>
          </div>

          <Divider />

          {/* Sesi II: Khotbah Utama */}
          <div className="pt-5 pb-2">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 7H20v13H6.5A2.5 2.5 0 014 17.5v-13z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Sesi II</p>
                <p className="text-[11px] text-slate-500 font-semibold -mt-0.5">Kebaktian Utama</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100/80">
              {sesiKhotbah.map((item, i) => (
                <PetugasRow key={i} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-700
              text-white text-sm font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Public Component ────────────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-slate-50 antialiased selection:bg-blue-500 selection:text-white">

      {/* ── Header ── */}
      <header className="bg-[#0c1829] text-white">
        <div className="max-w-lg mx-auto px-4 pt-10 pb-10">
          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 rounded-xl border border-white/15 bg-white/8 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-5 h-5 text-white/80">
                <path d="M12 3v18M3 9h18" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black tracking-wide text-white leading-none">GMAHK EKKLESIA</p>
              <p className="text-[10px] font-semibold tracking-widest text-white/35 uppercase mt-0.5">
                Gereja Masehi Advent Hari Ketujuh
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            Jadwal<br />Pelayanan
          </h1>
          <p className="mt-2 text-sm text-white/45 font-medium leading-relaxed max-w-xs">
            Susunan acara dan petugas ibadah minggu ini.
          </p>
        </div>
      </header>

      {/* ── Search Bar — floating overlap ── */}
      <div className="max-w-lg mx-auto px-4 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/8
          flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-slate-300 transition-all">
          <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Cari tema, jenis ibadah…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 py-3.5 text-sm font-semibold text-slate-900 bg-transparent border-0
              focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
              <svg className="w-2.5 h-2.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-lg mx-auto px-4 pt-5 pb-8">

        {/* Loading */}
        {loading && (
          <div className="space-y-3 mt-1">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 px-6 py-14
            flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80
              flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">
              {search ? 'Tidak ditemukan' : 'Belum ada jadwal'}
            </p>
            <p className="text-xs text-slate-400 font-medium max-w-xs">
              {search
                ? `Tidak ada jadwal yang cocok dengan "${search}". Coba kata kunci lain.`
                : 'Jadwal ibadah akan muncul di sini setelah ditambahkan oleh admin.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="mt-4 text-xs font-bold text-slate-900 underline underline-offset-2">
                Hapus pencarian
              </button>
            )}
          </div>
        )}

        {/* Jadwal List */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {filtered.length} Jadwal
              </p>
            </div>
            <div className="space-y-3">
              {filtered.map(row => (
                <JadwalCard key={row.id} row={row} onClick={() => setSelectedJadwal(row)} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="max-w-lg mx-auto px-4 pb-10">
        <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} GMAHK Ekklesia. Maranatha!
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl
              bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50
              text-xs font-bold text-slate-500 hover:text-slate-800
              transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Panel Admin
          </Link>
        </div>
      </footer>

      {/* ── Modal ── */}
      {selectedJadwal && (
        <ModalDetail jadwal={selectedJadwal} onClose={() => setSelectedJadwal(null)} />
      )}
    </div>
  );
}

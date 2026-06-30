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
  // Petugas Tambahan (Dikembalikan)
  mc_doa_buka: string | null;
  doa_syafaat: string | null;
  renungan: string | null;
  operator: string | null;
  games: string | null;
  acara_inti: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SS_ROLES: { key: keyof JadwalRow; label: string }[] = [
  { key: 'ss_mc',          label: 'MC / Protokol' },
  { key: 'ss_doa_buka',    label: 'Doa Buka' },
  { key: 'ss_diskusi',     label: 'Diskusi SS / Guru' },
  { key: 'ss_mission',     label: 'Cerita Mission' },
  { key: 'ss_pp_doa',      label: 'PP & Doa / Pemimpin Lagu' },
  { key: 'ss_persembahan', label: 'Petugas Persembahan' },
];

const KHOTBAH_ROLES: { key: keyof JadwalRow; label: string }[] = [
  { key: 'khotbah_mc',                 label: 'MC / Pemimpin Jemaat' },
  { key: 'pianis',                     label: 'Pianis / Organis' },
  { key: 'khotbah_lagu_pujian',        label: 'Lagu Pujian Spesial' },
  { key: 'khotbah_bacaan_persembahan', label: 'Bacaan Persembahan' },
  { key: 'khotbah_cerita_anak',        label: 'Cerita Anak-anak' },
  { key: 'pembawa_firman',             label: 'Pembawa Firman' },
];

// Dikembalikan agar muncul di satu halaman penuh
const TAMBAHAN_ROLES: { key: keyof JadwalRow; label: string }[] = [
  { key: 'mc_doa_buka', label: 'MC & Doa Buka' },
  { key: 'doa_syafaat', label: 'Doa Syafaat' },
  { key: 'renungan',    label: 'Renungan Firman' },
  { key: 'operator',    label: 'Operator Multimedia / Sound' },
  { key: 'games',       label: 'Pemimpin Games / Acara' },
  { key: 'acara_inti',  label: 'Acara Inti Pemuda' },
];

const JENIS_LABEL: Record<string, string> = {
  ibadah_umum: 'Ibadah Umum',
  doa: 'Ibadah Doa',
  pemuda: 'Pemuda',
  anak: 'Sekolah Sabat Anak',
  lainnya: 'Lainnya',
};

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin123';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Makassar',
  });
}

function fmtJam(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar',
  });
}

function isComingUp(iso: string) {
  return new Date(iso) > new Date();
}

function getNextJadwal(list: JadwalRow[]) {
  const upcoming = list.filter(j => isComingUp(j.tanggal_mulai));
  return upcoming[0] ?? list[list.length - 1] ?? null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CrossIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className}>
      <path d="M12 3v18M3 9h18" strokeLinecap="round" />
    </svg>
  );
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <svg className={`animate-spin w-4 h-4 ${light ? 'text-white' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
        strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

function RoleRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 w-36 shrink-0 leading-5 pt-0.5">{label}</span>
      <span className={`text-sm font-medium leading-5 ${value ? 'text-slate-800' : 'text-slate-300'}`}>
        {value || '–'}
      </span>
    </div>
  );
}

function SesiCard({
  icon, title, color, bg, roles, jadwal,
}: {
  icon: string;
  title: string;
  color: string;
  bg: string;
  roles: { key: keyof JadwalRow; label: string }[];
  jadwal: JadwalRow;
}) {
  const hasData = roles.some(r => jadwal[r.key]);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className={`flex items-center gap-3 px-4 py-3 ${bg}`}>
        <span className="text-xl leading-none">{icon}</span>
        <p className={`text-sm font-semibold ${color}`}>{title}</p>
        {!hasData && (
          <span className="ml-auto text-xs text-slate-400 italic">Belum diatur</span>
        )}
      </div>
      <div className="px-4">
        {roles.map(r => (
          <RoleRow key={r.key as string} label={r.label} value={jadwal[r.key] as string | null} />
        ))}
      </div>
    </div>
  );
}

// ─── Kotak Doa ────────────────────────────────────────────────────────────────

function KotakDoa() {
  const [nama, setNama] = useState('');
  const [isi, setIsi] = useState('');
  const [anonim, setAnonim] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function handleKirim() {
    if (!isi.trim()) return setErr('Tuliskan permohonan doa terlebih dahulu.');
    setSending(true); setErr('');
    const { error } = await supabase.from('request_doa').insert({
      nama_pemohon: anonim ? 'Anonim' : nama.trim() || 'Jemaat',
      isi_doa: isi.trim(),
      is_anonim: anonim,
      status: 'menunggu',
    });
    setSending(false);
    if (error) return setErr('Gagal mengirim. Coba lagi.');
    setDone(true);
    setNama(''); setIsi(''); setAnonim(false);
    setTimeout(() => setDone(false), 4000);
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 text-base">🙏</span>
        <div>
          <p className="font-semibold text-slate-800 text-sm">Kotak Doa</p>
          <p className="text-xs text-slate-400">Sampaikan permohonan doa Anda</p>
        </div>
      </div>

      {done ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 text-center">
          🙏 Permintaan doa Anda sudah diterima. Tuhan memberkati!
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="anonim" checked={anonim} onChange={e => setAnonim(e.target.checked)}
              className="w-4 h-4 rounded accent-violet-600" />
            <label htmlFor="anonim" className="text-xs text-slate-500 cursor-pointer select-none">Kirim sebagai anonim</label>
          </div>
          {!anonim && (
            <input type="text" placeholder="Nama Anda (opsional)" value={nama} onChange={e => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
                placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
          )}
          <textarea placeholder="Tuliskan permohonan doa Anda…" rows={3} value={isi} onChange={e => { setIsi(e.target.value); setErr(''); }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 resize-none
              placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button onClick={handleKirim} disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl
              bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-60 transition-all active:scale-[.98]">
            {sending ? <Spinner light /> : null} Kirim Permintaan Doa
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Persembahan Digital ──────────────────────────────────────────────────────

function PersembahanDigital() {
  const [show, setShow] = useState(false);
  const BANK_INFO = [
    { nama: 'BCA', nomor: '123-456-789', atas: 'GMAHK Ekklesia' },
    { nama: 'BRI', nomor: '0987-01-000123-50-0', atas: 'GMAHK Ekklesia' },
  ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-base">💛</span>
        <div>
          <p className="font-semibold text-slate-800 text-sm">Persembahan Digital</p>
          <p className="text-xs text-slate-400">Berkat Tuhan bagi yang memberi dengan sukacita</p>
        </div>
      </div>
      <button onClick={() => setShow(p => !p)}
        className="w-full py-2.5 text-sm font-semibold rounded-xl border-2 border-amber-400 text-amber-700
          hover:bg-amber-50 transition-all active:scale-[.98]">
        {show ? 'Tutup Info Rekening' : 'Lihat Rekening Persembahan'}
      </button>
      {show && (
        <div className="mt-3 space-y-2">
          {BANK_INFO.map(b => (
            <div key={b.nama} className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-600 font-semibold mb-0.5">{b.nama}</p>
              <p className="text-base font-bold text-slate-800 tracking-wider">{b.nomor}</p>
              <p className="text-xs text-slate-500">a.n. {b.atas}</p>
            </div>
          ))}
          <p className="text-xs text-slate-400 text-center pt-1">
            Konfirmasi transfer ke sekretaris jemaat. Tuhan memberkati!
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Jadwal Selector ──────────────────────────────────────────────────────────

function JadwalSelector({ jadwals, selected, onSelect }: {
  jadwals: JadwalRow[];
  selected: JadwalRow;
  onSelect: (j: JadwalRow) => void;
}) {
  if (jadwals.length <= 1) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      {jadwals.map(j => (
        <button
          key={j.id}
          onClick={() => onSelect(j)}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border
            ${selected.id === j.id
              ? 'bg-[#1a3a6e] text-white border-[#1a3a6e] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
        >
          <span className="block leading-tight">{j.judul}</span>
          <span className={`block text-[10px] mt-0.5 ${selected.id === j.id ? 'text-blue-200' : 'text-slate-400'}`}>
            {fmtJam(j.tanggal_mulai)}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Admin Gate ───────────────────────────────────────────────────────────────

function AdminGate() {
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  function handleLogin() {
    if (pwd === ADMIN_PASSWORD) {
      window.location.href = '/admin';
    } else {
      setErr('Password salah.');
      setPwd('');
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full py-2.5 text-xs text-slate-300 hover:text-slate-500 transition-colors">
        ⚙ Masuk sebagai Admin
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-700 mb-3">Password Admin</p>
      <input
        type="password"
        placeholder="Masukkan password…"
        value={pwd}
        onChange={e => { setPwd(e.target.value); setErr(''); }}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 mb-2
          placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/25 focus:border-[#1a3a6e] transition-all"
      />
      {err && <p className="text-xs text-red-500 mb-2">{err}</p>}
      <div className="flex gap-2">
        <button onClick={() => { setOpen(false); setErr(''); setPwd(''); }}
          className="flex-1 py-2 text-sm rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          Batal
        </button>
        <button onClick={handleLogin}
          className="flex-1 py-2 text-sm font-semibold rounded-xl bg-[#1a3a6e] text-white hover:bg-[#142e58] transition-all active:scale-[.98]">
          Masuk
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [jadwals, setJadwals] = useState<JadwalRow[]>([]);
  const [selected, setSelected] = useState<JadwalRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('jadwal_ibadah')
        .select('*')
        .order('tanggal_mulai', { ascending: true });
      const rows = (data ?? []) as JadwalRow[];
      setJadwals(rows);
      setSelected(getNextJadwal(rows));
      setLoading(false);
    }
    fetch();
  }, []);

  const nearbyJadwals = jadwals.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f0f4fa] font-sans">
      <header className="bg-[#0f2040] text-white relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <CrossIcon className="w-40 h-40" />
        </div>
        <div className="max-w-lg mx-auto px-4 pt-10 pb-8 relative">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <CrossIcon className="w-5 h-5" />
            </span>
            <div>
              <p className="font-bold text-sm tracking-wide leading-tight">GMAHK EKKLESIA</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Gereja Masehi Advent Hari Ketujuh</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-white/50 py-4">
              <Spinner light /><span className="text-sm">Memuat jadwal…</span>
            </div>
          ) : selected ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7b9fcf] mb-1">
                {isComingUp(selected.tanggal_mulai) ? 'Jadwal Mendatang' : 'Jadwal Terbaru'}
              </p>
              <h1 className="text-2xl font-bold leading-tight mb-1">{selected.judul}</h1>
              <p className="text-sm text-white/60 mb-1">{fmtTanggal(selected.tanggal_mulai)}</p>
              <p className="text-sm text-white/40">
                {fmtJam(selected.tanggal_mulai)}
                {selected.tanggal_selesai ? ` – ${fmtJam(selected.tanggal_selesai)}` : ''}
                {selected.lokasi ? ` · ${selected.lokasi}` : ''}
              </p>
              {selected.deskripsi && (
                <p className="mt-2 text-xs text-white/50 italic">{selected.deskripsi}</p>
              )}
              <div className="mt-2">
                <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/70">
                  {JENIS_LABEL[selected.jenis] ?? selected.jenis}
                </span>
              </div>
            </>
          ) : (
            <p className="text-white/50 text-sm">Belum ada jadwal ibadah.</p>
          )}
        </div>
      </header>

      {nearbyJadwals.length > 1 && selected && (
        <div className="bg-[#162d55] border-b border-white/5 px-0 py-3">
          <div className="max-w-lg mx-auto">
            <JadwalSelector jadwals={nearbyJadwals} selected={selected} onSelect={setSelected} />
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Susunan Petugas */}
        {selected && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Susunan Petugas Pelayanan
              </p>
              <div className="space-y-3">
                <SesiCard
                  icon="📖"
                  title="Sekolah Sabat"
                  color="text-indigo-800"
                  bg="bg-indigo-50"
                  roles={SS_ROLES}
                  jadwal={selected}
                />
                <SesiCard
                  icon="🎵"
                  title="Khotbah / Ibadah Utama"
                  color="text-amber-800"
                  bg="bg-amber-50"
                  roles={KHOTBAH_ROLES}
                  jadwal={selected}
                />
                {/* Dikembalikan agar muncul memanjang langsung tanpa sistem role terpisah */}
                <SesiCard
                  icon="🌙"
                  title="Rabu Malam / Pemuda"
                  color="text-emerald-800"
                  bg="bg-emerald-50"
                  roles={TAMBAHAN_ROLES}
                  jadwal={selected}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 my-1" />
          </>
        )}

        <KotakDoa />
        <PersembahanDigital />

        {/* Daftar Jadwal lainnya */}
        {jadwals.length > 1 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Jadwal Lainnya</p>
            <div className="space-y-2">
              {jadwals.map(j => (
                <button key={j.id} onClick={() => setSelected(j)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all
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
        )}

        <div className="pt-4 border-t border-slate-200">
          <AdminGate />
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 pb-8 px-4">
        GMAHK Ekklesia © {new Date().getFullYear()} · Maranatha!
      </footer>
    </div>
  );
}
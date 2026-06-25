"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [rekening, setRekening] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [isiDoa, setIsDoa] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  // State untuk Fitur Admin Gate Login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data: dataJadwal } = await supabase
        .from("jadwal_ibadah")
        .select("*")
        .order("tanggal_mulai", { ascending: true });
      if (dataJadwal) setJadwal(dataJadwal);

      const { data: dataRek } = await supabase.from("info_gereja").select("*");
      if (dataRek) setRekening(dataRek);
    }
    fetchData();
  }, []);

  const handleRequestDoa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesan("");
    const { error } = await supabase
      .from("request_doa")
      .insert([{ nama_pemohon: nama, isi_doa: isiDoa, status: "menunggu" }]);
    setLoading(false);
    if (error) {
      setPesan("❌ Gagal mengirim: " + error.message);
    } else {
      setPesan("🙏 Permohonan doa berhasil dikirim!");
      setNama("");
      setIsDoa("");
    }
  };

  // Fungsi Validasi Login Admin Gate
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");

    const correctUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

    if (usernameInput === correctUsername && passwordInput === correctPassword) {
      setIsModalOpen(false);
      // Alihkan halaman ke panel admin resmi
      router.push("/admin");
    } else {
      setErrorLogin("⚠️ Username atau Password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white relative">
      
      {/* Hero Banner Modern & Elegan */}
      <header className="relative bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-24 px-6 shadow-2xl overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_50%)]"></div>
        <div className="relative max-w-6xl mx-auto text-center space-y-3">
          <span className="text-amber-400 uppercase tracking-widest text-xs font-black px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20">
            GMAHK M-Gereja Digital
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase sm:text-center">
            GMAHK EKKLESIA
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Pusat Informasi Ibadah, Alur Musik Lagu Sion, Warta Sepekan, & Pelayanan Jemaat Terpadu.
          </p>
        </div>
      </header>

      {/* Konten Utama Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kiri & Tengah: List Jadwal */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              🗓️ Informasi Acara Jemaat
            </h2>
            <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-md">Pekan Ini</span>
          </div>
          
          {jadwal.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-400 text-sm italic font-medium">Sinkronisasi data pelayanan jemaat...</p>
            </div>
          ) : (
            jadwal.map((item) => {
              const adaPetugas = !!(item.pembawa_firman || item.chorister || item.pianis || item.doa_buka || item.diaken);

              return (
                <div key={item.id} className="group bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="h-1.5 w-full bg-linear-to-r from-blue-600 to-indigo-600"></div>
                  
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="bg-blue-50 text-blue-700 text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-lg border border-blue-100 inline-block">
                          {item.jenis || "Ibadah"}
                        </span>
                        <h3 className="font-black text-xl md:text-2xl text-slate-900 tracking-tight pt-1 group-hover:text-blue-600 transition-colors">
                          {item.judul}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-semibold shadow-2xs">
                          <span>📍</span> {item.lokasi}
                        </div>
                      </div>
                    </div>

                    {item.deskripsi && (
                      <p className="text-sm text-slate-500 leading-relaxed font-normal bg-slate-50/40 p-3 rounded-2xl border border-slate-100/80 italic">
                        "{item.deskripsi}"
                      </p>
                    )}

                    {adaPetugas ? (
                      <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-inner space-y-3 relative overflow-hidden">
                        <p className="font-black text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                          <span>📋</span> Susunan Pelayanan Jemaat
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-medium pt-1">
                          {item.pembawa_firman && <p className="flex justify-between border-b border-slate-800/40 pb-1.5"><span className="text-slate-400">📖 Khotbah:</span> <span className="font-bold text-white">{item.pembawa_firman}</span></p>}
                          {item.chorister && <p className="flex justify-between border-b border-slate-800/40 pb-1.5"><span className="text-slate-400">🎤 Chorister:</span> <span className="font-bold text-white">{item.chorister}</span></p>}
                          {item.pianis && <p className="flex justify-between border-b border-slate-800/40 pb-1.5"><span className="text-slate-400">🎹 Pianis/Organ:</span> <span className="font-bold text-white">{item.pianis}</span></p>}
                          {item.doa_buka && <p className="flex justify-between border-b border-slate-800/40 pb-1.5"><span className="text-slate-400">🙏 Doa Syafaat:</span> <span className="font-bold text-white">{item.doa_buka}</span></p>}
                          {item.diaken && <p className="flex justify-between border-b border-slate-800/40 pb-1.5 sm:col-span-2"><span className="text-slate-400">🤝 Diaken/Kolekte:</span> <span className="font-bold text-white">{item.diaken}</span></p>}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic bg-slate-50/50 p-4 rounded-2xl border border-dashed text-center">
                        Susunan nama petugas pelayanan belum diisi untuk acara ini.
                      </div>
                    )}

                    {item.lagu_pujian && (
                      <div className="bg-amber-50/40 p-5 rounded-2xl text-xs text-amber-950 border border-amber-100/70 shadow-2xs relative">
                        <p className="font-black uppercase tracking-wider text-[11px] text-amber-800 mb-2 flex items-center gap-1.5">
                          <span>🎶</span> Panduan Lagu Pujian & Sion
                        </p>
                        <p className="whitespace-pre-line leading-relaxed font-mono font-medium text-amber-900 bg-white/70 p-3 rounded-xl border border-amber-100">
                          {item.lagu_pujian}
                        </p>
                      </div>
                    )}

                    {item.warta_jemaat && (
                      <div className="bg-indigo-50/40 p-5 rounded-2xl text-xs text-indigo-950 border border-indigo-100/70 shadow-2xs">
                        <p className="font-black uppercase tracking-wider text-[11px] text-indigo-800 mb-2 flex items-center gap-1.5">
                          <span>📰</span> Berita & Warta Jemaat
                        </p>
                        <p className="whitespace-pre-line leading-relaxed text-slate-600 bg-white/70 p-4 rounded-xl border border-indigo-100">
                          {item.warta_jemaat}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-8">
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <span>🙏</span> Kotak Permohonan Doa
              </h2>
            </div>
            <form onSubmit={handleRequestDoa} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-extrabold tracking-wider mb-1.5 text-slate-400">Nama Lengkap / Samaran</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required placeholder="Misal: Keluarga Siregar / Anonim" className="w-full px-4 py-3 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-extrabold tracking-wider mb-1.5 text-slate-400">Isi Pokok Doa</label>
                <textarea rows={3} value={isiDoa} onChange={(e) => setIsDoa(e.target.value)} required placeholder="Tuliskan pergumulan doa Anda secara detail..." className="w-full px-4 py-3 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all resize-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl shadow-md hover:shadow-lg shadow-blue-600/10 transition-all disabled:opacity-50">
                {loading ? "Mengirim ke Sistem..." : "Kirim Pokok Doa Jemaat"}
              </button>
              {pesan && <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs font-bold text-emerald-700">{pesan}</div>}
            </form>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <span>💰</span> Persembahan Digital
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">Dukung pelayanan pekerjaan Tuhan via transfer bank resmi jemaat:</p>
            <div className="space-y-4 pt-1">
              {rekening.map((rek) => (
                <div key={rek.id} className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/60 text-xs">
                  <p className="font-black text-[11px] uppercase tracking-wider text-emerald-800">{rek.nama_bank}</p>
                  <p className="text-xl font-mono font-black tracking-wider my-1.5 text-slate-800">{rek.nomor_rekening}</p>
                  <p className="font-bold text-slate-500 text-[10px] uppercase">A/N: {rek.atas_nama}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="text-center text-slate-400 text-[11px] font-medium py-12 border-t border-slate-200/60 max-w-6xl mx-auto px-4">
        © {new Date().getFullYear()} by Valentino Imanuel. Seluruh Hak Cipta Dilindungi Undang-Undang.
      </footer>

      {/* 🔐 TOMBOL FLOATING ADMIN GATE (POJOK KANAN BAWAH) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 hover:bg-blue-600 text-white rounded-full shadow-xl hover:shadow-blue-500/20 hover:scale-110 transition-all cursor-pointer group z-40 border border-slate-800"
        title="Admin Security Gate"
      >
        <span className="text-lg group-hover:rotate-12 block transition-transform">🔒</span>
      </button>

      {/* 🛡️ MODAL POP-UP SECURE LOGIN ADMIN GATE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-5 relative">
            
            <div className="text-center space-y-1">
              <div className="text-3xl">🛡️</div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Secure Admin Gate</h2>
              <p className="text-[11px] text-slate-400 font-medium">Verifikasi kredensial untuk masuk ke panel sistem.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Username</label>
                <input 
                  type="text" 
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)} 
                  required 
                  placeholder="Masukkan username admin" 
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Password Secret</label>
                <input 
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {errorLogin && (
                <p className="text-[11px] font-bold text-rose-600 text-center bg-rose-50 border border-rose-100 py-2 rounded-xl">
                  {errorLogin}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setErrorLogin(""); }}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-blue-600/10 transition"
                >
                  Masuk Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
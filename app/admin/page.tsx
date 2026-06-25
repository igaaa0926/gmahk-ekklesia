"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  const [pembawaFirman, setPembawaFirman] = useState("");
  const [chorister, setChorister] = useState("");
  const [pianis, setPianis] = useState("");
  const [doaBuka, setDoaBuka] = useState("");
  const [diaken, setDiaken] = useState("");
  const [laguPujian, setLaguPujian] = useState("");
  const [wartaJemaat, setWartaJemaat] = useState("");
  const [idDipilih, setIdDipilih] = useState("");

  // Fungsi fetch data yang lebih solid
  async function fetchJadwal() {
    try {
      const { data, error } = await supabase
        .from("jadwal_ibadah")
        .select("*");
      
      if (error) {
        console.error("Error Supabase:", error.message);
      } else if (data) {
        setJadwal(data);
      }
    } catch (err) {
      console.error("Catch Error:", err);
    }
  }

  // Dipanggil langsung saat halaman dimuat
  useEffect(() => {
    fetchJadwal();
  }, []);

  const gantiJadwalPilihan = (id: string) => {
    setIdDipilih(id);
    if (!id) {
      setPembawaFirman("");
      setChorister("");
      setPianis("");
      setDoaBuka("");
      setDiaken("");
      setLaguPujian("");
      setWartaJemaat("");
      return;
    }
    
    const ditemukan = jadwal.find((item) => String(item.id) === String(id));
    if (ditemukan) {
      setPembawaFirman(ditemukan.pembawa_firman || "");
      setChorister(ditemukan.chorister || "");
      setPianis(ditemukan.pianis || "");
      setDoaBuka(ditemukan.doa_buka || "");
      setDiaken(ditemukan.diaken || "");
      setLaguPujian(ditemukan.lagu_pujian || "");
      setWartaJemaat(ditemukan.warta_jemaat || "");
    }
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDipilih) return alert("Pilih jadwal dulu!");
    
    setLoading(true);
    setPesan("");

    const { error } = await supabase
      .from("jadwal_ibadah")
      .update({
        pembawa_firman: pembawaFirman,
        chorister: chorister,
        pianis: pianis,
        doa_buka: doaBuka,
        diaken: diaken,
        lagu_pujian: laguPujian,
        warta_jemaat: wartaJemaat,
      })
      .eq("id", idDipilih);

    setLoading(false);
    if (error) {
      setPesan("❌ Gagal menyimpan: " + error.message);
    } else {
      setPesan("✅ Konten publikasi jemaat berhasil diperbarui!");
      // Refresh data lokal agar state sinkron
      await fetchJadwal();
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans antialiased py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Header Panel */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-5xl font-black tracking-widest pointer-events-none">
            CORE
          </div>
          <span className="text-blue-400 uppercase tracking-widest text-[10px] font-black px-2.5 py-0.5 bg-blue-400/10 rounded-md border border-blue-400/20 inline-block mb-2">
            Control Panel
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
            Manajemen Konten Jemaat
          </h1>
          <p className="text-slate-300 text-xs mt-1 font-medium">
            Perbarui Susunan Pelayan, Manajemen Lagu Sion, dan Teks Berita Warta.
          </p>
        </div>

        {/* Konten Utama Form */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Pilihan Dropdown Jadwal */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              Pilih Acara Ibadah Target
            </label>
            <select 
              value={idDipilih} 
              onChange={(e) => gantiJadwalPilihan(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl text-sm font-semibold shadow-xs focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">-- Klik untuk memuat daftar acara --</option>
              {jadwal.map((item) => (
                <option key={item.id} value={item.id} className="text-slate-800 font-medium">
                  {item.judul}
                </option>
              ))}
            </select>
          </div>

          {!idDipilih ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <span className="text-2xl">💡</span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-2">
                Silakan pilih jadwal acara di atas untuk mulai mengisi data
              </p>
            </div>
          ) : (
            <form onSubmit={handleSimpan} className="space-y-6">
              
              {/* Form Susunan Petugas */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                  <span>📋</span> Form Susunan Petugas
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">Khotbah / Firman</label>
                    <input type="text" value={pembawaFirman} onChange={(e) => setPembawaFirman(e.target.value)} placeholder="Nama Pengkhotbah" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">Chorister / Pemimpin Lagu</label>
                    <input type="text" value={chorister} onChange={(e) => setChorister(e.target.value)} placeholder="Nama Chorister" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">Pianis / Organis</label>
                    <input type="text" value={pianis} onChange={(e) => setPianis(e.target.value)} placeholder="Nama Pemusik" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">Doa Syafaat / Buka</label>
                    <input type="text" value={doaBuka} onChange={(e) => setDoaBuka(e.target.value)} placeholder="Nama Pendoa" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">Diaken / Diakenis / Petugas Kolekte</label>
                  <input type="text" value={diaken} onChange={(e) => setDiaken(e.target.value)} placeholder="Contoh: Diaken Tugas / Kelompok B" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all" />
                </div>
              </div>

              {/* Urutan Lagu Sion */}
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <h2 className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                  <span>🎶</span> Panduan Urutan Lagu Sion
                </h2>
                <textarea 
                  rows={3} 
                  value={laguPujian} 
                  onChange={(e) => setLaguPujian(e.target.value)} 
                  placeholder="Contoh:&#10;Lagu Buka: LS No. 10&#10;Lagu Khotbah: LS No. 235&#10;Lagu Tutup: LS No. 140" 
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-none transition-all resize-none leading-relaxed" 
                />
              </div>

              {/* Redaksi Berita Warta */}
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <h2 className="text-xs font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1.5">
                  <span>📰</span> Redaksi Teks Warta Jemaat
                </h2>
                <textarea 
                  rows={4} 
                  value={wartaJemaat} 
                  onChange={(e) => setWartaJemaat(e.target.value)} 
                  placeholder="Tuliskan berita-berita, pengumuman, atau agenda jemaat sepekan ke depan..." 
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none leading-relaxed" 
                />
              </div>

              {/* Tombol Publikasikan */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-600/10 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Sinkronisasi database..." : "💾 Publikasikan Perubahan"}
                </button>
              </div>

              {pesan && (
                <div className={`p-3 rounded-xl text-center text-xs font-bold shadow-xs ${pesan.startsWith('❌') ? 'bg-rose-50 border border-rose-100 text-rose-700' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
                  {pesan}
                </div>
              )}

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
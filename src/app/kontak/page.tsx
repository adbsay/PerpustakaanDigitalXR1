'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function KontakPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email Dukungan',
      value: 'support@perpustakaandigital.com',
      href: 'mailto:support@perpustakaandigital.com',
    },
    {
      icon: Phone,
      label: 'Nomor Telepon',
      value: '+62 811-2345-6789',
      href: 'tel:+6281123456789',
    },
    {
      icon: MapPin,
      label: 'Alamat Kantor',
      value: 'Gedung Pengetahuan Nusantara, Lt. 5, Jl. Sudirman No. 123, Jakarta, Indonesia',
      href: undefined,
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-24" style={{ background: '#F8FAFC', padding: '80px 24px 100px' }}>
      <div className="max-w-7xl mx-auto px-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 1. HEADER SECTION */}
        <div className="text-center mb-16" style={{ marginBottom: '64px', textAlign: 'center' }}>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Hubungi Kami
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto" style={{ fontSize: '1.125rem', color: '#64748B', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Punya pertanyaan mengenai koleksi perpustakaan, kemitraan, atau butuh bantuan teknis? Tim kami siap melayani Anda.
          </p>
        </div>

        {/* 2. ARSITEKTUR LAYOUT (GRID 2 KOLOM) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '56px', alignItems: 'start' }}>
          
          {/* 3. KOLOM KIRI (INFORMASI KONTAK & WHATSAPP) */}
          <div className="flex flex-col space-y-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {contactInfo.map((item, idx) => {
              const Icon = item.icon;
              const ContentWrapper = item.href ? 'a' : 'div';
              return (
                <ContentWrapper
                  key={idx}
                  href={item.href}
                  className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    padding: '24px',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div 
                    className="w-12 h-12 text-blue-600 bg-blue-50 p-2.5 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="text-lg font-bold text-gray-900" style={{ fontSize: '1.063rem', fontWeight: 800, color: '#0F172A' }}>
                      {item.label}
                    </span>
                    <span className="text-gray-600 leading-relaxed" style={{ fontSize: '0.938rem', color: '#64748B', lineHeight: 1.5 }}>
                      {item.value}
                    </span>
                  </div>
                </ContentWrapper>
              );
            })}

            {/* Tombol WhatsApp */}
            <div style={{ paddingTop: '8px' }}>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '16px 32px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                <MessageCircle size={22} />
                Hubungi Admin (WhatsApp)
              </a>
            </div>
          </div>

          {/* 4. KOLOM KANAN (FORMULIR INTERAKTIF) */}
          <div 
            className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100"
            style={{
              background: '#FFFFFF',
              padding: '36px 32px',
              borderRadius: '20px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0'
            }}
          >
            {sent ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Pesan Berhasil Dikirim!
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Terima kasih telah menghubungi kami. Tim kami akan segera meninjau dan merespons pesan Anda melalui email.
                </p>
                <button 
                  onClick={() => setSent(false)}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Grid 2 Kolom: Nama & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="vis_name" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                      Nama Lengkap
                    </label>
                    <input
                      id="vis_name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nama Anda"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      style={{
                        width: '100%',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#0F172A',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="vis_email" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                      Alamat Email
                    </label>
                    <input
                      id="vis_email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      style={{
                        width: '100%',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#0F172A',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Subjek */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="vis_subject" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                    Subjek Pesan
                  </label>
                  <input
                    id="vis_subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Contoh: Pertanyaan Koleksi Ebook"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Textarea Pesan */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="vis_message" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                    Isi Pesan
                  </label>
                  <textarea
                    id="vis_message"
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tuliskan pertanyaan, kendala, atau pesan detail Anda di sini..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '130px'
                    }}
                  />
                </div>

                {/* Tombol Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md transition-all mt-4"
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                    marginTop: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Send size={18} />
                  {submitting ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang'}
                </button>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
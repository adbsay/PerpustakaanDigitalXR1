'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, HelpCircle } from 'lucide-react';

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
      href: 'tel:+628112345678',
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
    // No backend endpoint for visitor messages yet — acknowledge locally.
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 500);
  };

  return (
    <main className="visitor-main" style={{ maxWidth: '1000px' }}>
      {/* ---- HERO ---- */}
      <section style={{ textAlign: 'center', padding: '24px 0 48px', maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Hubungi Kami</h1>
        <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Punya pertanyaan, masukan, atau kendala saat mengakses koleksi kami? Tim kami siap
          membantu Anda.
        </p>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 340px) 1fr',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* ---- CONTACT INFO ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {contactInfo.map((c, i) => {
            const Icon = c.icon;
            const cardStyle: React.CSSProperties = {
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
            };
            const cardInner = (
              <>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color="var(--accent-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {c.value}
                  </div>
                </div>
              </>
            );

            return c.href ? (
              <a
                key={i}
                href={c.href}
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {cardInner}
              </a>
            ) : (
              <div key={i} style={cardStyle}>
                {cardInner}
              </div>
            );
          })}

          {/* FAQ pointer */}
          <Link
            href="/faq"
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              background: 'var(--accent-primary-light)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <HelpCircle size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                Cek FAQ Kami
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Jawaban pertanyaan umum mungkin sudah tersedia
              </div>
            </div>
          </Link>
        </div>

        {/* ---- CONTACT FORM ---- */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <CheckCircle2 size={40} color="var(--status-published)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Pesan Terkirim</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Terima kasih telah menghubungi kami. Tim kami akan merespons secepatnya.
              </p>
              <button className="btn btn-ghost" onClick={() => setSent(false)}>
                Kirim Pesan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Nama</label>
                  <input
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Nama Anda"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="anda@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subjek</label>
                <input
                  id="subject"
                  name="subject"
                  className="form-input"
                  placeholder="Tentang apa pesan Anda?"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Pesan</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input form-textarea"
                  placeholder="Tuliskan pertanyaan atau masukan Anda di sini..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
                <Send size={16} />
                {submitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

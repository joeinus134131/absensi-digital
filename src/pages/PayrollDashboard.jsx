import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FileSpreadsheet, Download, DollarSign, Award, ShieldCheck, AlertTriangle, Send, Trophy, CheckCircle2 } from 'lucide-react';

export default function PayrollDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('https://api.hris-cloud.example/webhook/attendance');
  const [webhookMsg, setWebhookMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/reports/payroll-summary')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSummary(data.summary);
      });

    fetch('http://localhost:5001/api/reports/executive-analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalytics(data);
      });
  }, []);

  const handleDownloadCSV = () => {
    window.open('http://localhost:5001/api/reports/export-csv', '_blank');
  };

  const handleTestWebhook = async () => {
    const res = await fetch('http://localhost:5001/api/reports/webhook-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url: webhookUrl })
    });
    const data = await res.json();
    if (data.success) {
      setWebhookMsg(data.message);
      setTimeout(() => setWebhookMsg(''), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)',
        borderColor: 'rgba(245, 158, 11, 0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-warning">Auditor & Payroll</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rekapitulasi & Executive Analytics</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '4px' }}>Rekap Payroll & Analitik</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Data terverifikasi otomatis berdasarkan catatan kehadiran dan perhitungan keterlambatan.
          </p>
        </div>

        <button onClick={handleDownloadCSV} className="btn btn-primary" style={{ padding: '12px 20px' }}>
          <Download size={16} />
          <span>Unduh CSV Payroll</span>
        </button>
      </div>

      {/* Executive Warnings */}
      {analytics && analytics.warnings && analytics.warnings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {analytics.warnings.map(w => (
            <div key={w.id} className="glass-card" style={{
              padding: '16px 20px',
              borderColor: w.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              background: w.severity === 'HIGH' ? 'var(--danger-light)' : 'var(--warning-light)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                color: w.severity === 'HIGH' ? 'var(--danger-text)' : 'var(--warning-text)',
                fontWeight: 600, marginBottom: '6px', fontSize: '0.88rem'
              }}>
                <AlertTriangle size={16} />
                <span>{w.title}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {w.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {analytics && analytics.leaderboard && (
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Trophy size={20} color="var(--warning-text)" />
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Karyawan Terdisiplin Bulan Ini</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Leaderboard berdasarkan skor ketepatan waktu</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {analytics.leaderboard.slice(0, 3).map((item, idx) => (
              <div key={item.user_id} style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: idx === 0 ? 'var(--warning-light)' : 'var(--bg-muted)',
                border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.badge}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginTop: '2px', color: 'var(--text-main)' }}>{item.full_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.department}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-text)' }}>{item.punctuality_score}%</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>On-Time</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhook Integration */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--text-main)' }}>Integrasi HRIS Webhook</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
          Kirim payload JSON kehadiran ke sistem HRIS eksternal (Talenta, Mekari, SAP, Odoo) via Webhook.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: '240px' }}
          />
          <button onClick={handleTestWebhook} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
            <Send size={14} /> Uji Webhook
          </button>
        </div>

        {webhookMsg && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'var(--success-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--success-text)',
            fontSize: '0.82rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={14} />
            {webhookMsg}
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--text-main)' }}>Rekap Kehadiran Bulan Berjalan</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Hadir</th>
                <th>Hari Terlambat</th>
                <th>Menit Terlambat</th>
                <th>Trust Score</th>
                <th>Est. Potongan</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(item => (
                <tr key={item.user_id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.nik}</td>
                  <td>{item.full_name}</td>
                  <td style={{ fontSize: '0.82rem' }}>{item.position} · {item.department}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{item.total_attendance}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> hari</span>
                  </td>
                  <td>
                    {item.late_days > 0 ? (
                      <span className="badge badge-warning">{item.late_days} hari</span>
                    ) : (
                      <span className="badge badge-success">0</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{item.total_late_minutes} min</td>
                  <td>
                    <span style={{
                      fontWeight: 600,
                      color: item.avg_trust_score >= 95 ? 'var(--success-text)' : 'var(--warning-text)'
                    }}>
                      {item.avg_trust_score}%
                    </span>
                  </td>
                  <td style={{
                    fontWeight: 600,
                    color: item.estimated_payroll_deduction_idr > 0 ? 'var(--danger-text)' : 'var(--text-main)'
                  }}>
                    Rp {item.estimated_payroll_deduction_idr.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

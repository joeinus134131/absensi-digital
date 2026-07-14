import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FileSpreadsheet, Download, DollarSign, Award, ShieldCheck, AlertTriangle, Send, Trophy } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(18, 25, 41, 0.9))'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-warning">AUDITOR, PAYROLL & EKSEKUTIF</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pusat Rekapitulasi Kehadiran & Executive Analytics</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Rekapitulasi Siap Payroll & Executive Early Warning</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Data terverifikasi otomatis berdasarkan catatan kehadiran Zero-Fraud & perhitungan keterlambatan.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="btn btn-primary"
          style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #F59E0B, #10B981)', color: '#04140D' }}
        >
          <Download size={20} />
          <span>Unduh Format CSV Siap Payroll</span>
        </button>
      </div>

      {/* USP-7 & REQ-AUD-02: Executive Early Warning Alerts */}
      {analytics && analytics.warnings && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {analytics.warnings.map(w => (
            <div key={w.id} className="glass-card" style={{
              padding: '18px 22px',
              border: w.severity === 'HIGH' ? '1px solid #F43F5E' : '1px solid #F59E0B',
              background: w.severity === 'HIGH' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: w.severity === 'HIGH' ? '#FDA4AF' : '#FCD34D', fontWeight: 700, marginBottom: '6px' }}>
                <AlertTriangle size={18} />
                <span>{w.title}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {w.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USP-7: Gamified Punctuality Leaderboard */}
      {analytics && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Trophy size={24} color="#F59E0B" />
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Punctuality Leaderboard (Karyawan Terdisiplin Bulan Ini)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>USP-7: Gamifikasi kedisiplinan dan skor kehadiran sempurna</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {analytics.leaderboard.slice(0, 3).map((item, idx) => (
              <div key={item.user_id} style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: idx === 0 ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.badge}</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>{item.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.department}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10B981' }}>{item.punctuality_score}%</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>On-Time Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REQ-REP-03: Universal HRIS Webhook Trigger Test */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Integrasi Real-Time HRIS & Payroll Webhook (REQ-REP-03)</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Kirim payload JSON kehadiran secara otomatis ke sistem HRIS eksternal (Talenta, Mekari, SAP, Odoo) via Webhook.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            style={{ flex: 1, minWidth: '260px', padding: '10px 14px', borderRadius: '8px', background: '#121929', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button onClick={handleTestWebhook} className="btn btn-secondary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} /> Uji Trigger Webhook Payload
          </button>
        </div>

        {webhookMsg && (
          <div className="badge badge-success" style={{ marginTop: '12px', padding: '10px 14px' }}>
            🎉 {webhookMsg}
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Tabel Rekap Kehadiran Karyawan (Bulan Berjalan)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Jabatan / Divisi</th>
                <th>Total Hadir</th>
                <th>Total Hari Terlambat</th>
                <th>Total Menit Terlambat</th>
                <th>Skor Kepercayaan Rata-Rata</th>
                <th>Estimasi Potongan Denda (IDR)</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(item => (
                <tr key={item.user_id}>
                  <td style={{ fontWeight: 600 }}>{item.nik}</td>
                  <td>{item.full_name}</td>
                  <td>{item.position} ({item.department})</td>
                  <td style={{ fontWeight: 700, color: '#6EE7B7' }}>{item.total_attendance} Hari</td>
                  <td>
                    {item.late_days > 0 ? (
                      <span className="badge badge-warning">{item.late_days} Hari</span>
                    ) : (
                      <span className="badge badge-success">0 Hari</span>
                    )}
                  </td>
                  <td>{item.total_late_minutes} Menit</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: item.avg_trust_score >= 95 ? '#10B981' : '#F59E0B'
                    }}>
                      {item.avg_trust_score}%
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: item.estimated_payroll_deduction_idr > 0 ? '#FDA4AF' : 'var(--text-main)' }}>
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

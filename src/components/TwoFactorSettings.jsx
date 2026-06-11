import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Key, ShieldCheck, ShieldAlert, Check, RefreshCw, Download, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

export default function TwoFactorSettings() {
  const { currentUser, refreshSession } = useContext(AppContext);
  const [step, setStep] = useState('status'); // status, setup, recovery, disable_confirm
  
  // Setup details from server
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [setupInstructions, setSetupInstructions] = useState([]);
  const [totpCode, setTotpCode] = useState('');
  
  // Recovery codes
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  
  // Disable details
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  const initiateSetup = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecretCode(data.secretCode);
        setSetupInstructions(data.instructions || []);
        setStep('setup');
      } else {
        setErrorMsg(data.message || 'Failed to initiate 2FA setup.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!totpCode || totpCode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode })
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryCodes(data.recoveryCodes || []);
        setSuccessMsg(data.message);
        await refreshSession();
        setStep('recovery');
      } else {
        setErrorMsg(data.message || 'Incorrect verification code.');
      }
    } catch (err) {
      setErrorMsg('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        await refreshSession();
        setPassword('');
        setTimeout(() => {
          setStep('status');
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Incorrect password.');
      }
    } catch (err) {
      setErrorMsg('Failed to disable 2FA: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadRecoveryCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([recoveryCodes.join("\n")], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `LEC_2FA_Recovery_Codes_${currentUser.username}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="security-settings-card glass-panel text-left" style={{ padding: '30px', maxWidth: '650px' }}>
      {successMsg && <div className="alert-banner success-banner margin-bottom-20 animate-fade-in">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error-banner margin-bottom-20 animate-fade-in">{errorMsg}</div>}

      {/* 1. STATUS SCREEN */}
      {step === 'status' && (
        <div className="animate-text-reveal">
          <div className="flex-row align-center gap-10 margin-bottom-12">
            {currentUser.totpEnabled ? (
              <ShieldCheck size={38} className="text-cyan" />
            ) : (
              <ShieldAlert size={38} className="text-red" />
            )}
            <div>
              <h3>Two-Factor Authentication (2FA)</h3>
              <p className="helper-text" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Add an extra layer of security to your covenant church account.
              </p>
            </div>
          </div>
          <div className="form-divider"></div>

          <div className="status-badge-container flex-row justify-between align-center" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div>
              <span className="details-label">STATUS</span>
              <h4 style={{ color: currentUser.totpEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentUser.totpEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)' }}></span>
                {currentUser.totpEnabled ? 'Securely Protected' : 'Not Configured (Highly Recommended)'}
              </h4>
            </div>

            {currentUser.totpEnabled ? (
              <button onClick={() => setStep('disable_confirm')} className="btn-accent" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '8px' }}>
                Disable 2FA
              </button>
            ) : (
              <button onClick={initiateSetup} disabled={loading} className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '8px' }}>
                {loading ? 'Initiating...' : 'Setup Authenticator'}
              </button>
            )}
          </div>

          <div className="instructions-section margin-top-20">
            <h4 style={{ fontSize: '14px', color: '#FFF', marginBottom: '8px' }}>Why configure 2FA?</h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><Check size={14} className="text-cyan" style={{ marginTop: '3px' }} /> Stops unauthorized logins even if someone knows your password.</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><Check size={14} className="text-cyan" style={{ marginTop: '3px' }} /> Compatible with Google Authenticator, Microsoft Authenticator, or Authy.</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><Check size={14} className="text-cyan" style={{ marginTop: '3px' }} /> Generates backup recovery keys to regain access if you lose your phone.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 2. SETUP WIZARD SCREEN */}
      {step === 'setup' && (
        <div className="animate-text-reveal">
          <div className="flex-row align-center gap-10 margin-bottom-12">
            <Key size={32} className="text-cyan" />
            <div>
              <h3>Setup Authenticator App</h3>
              <p className="helper-text" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Follow these steps to link your authenticator software.
              </p>
            </div>
          </div>
          <div className="form-divider"></div>

          <div className="setup-wizard-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="qr-code-holder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '180px', height: '180px', borderRadius: '8px', border: '4px solid white', display: 'block', margin: '0 auto' }} />
              ) : (
                <div style={{ width: '180px', height: '180px', background: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}><RefreshCw className="spinning" /></div>
              )}
              <div className="manual-secret-box margin-top-12" style={{ width: '100%' }}>
                <span className="details-label" style={{ display: 'block', fontSize: '10px' }}>MANUAL SETUP KEY</span>
                <code style={{ fontSize: '12px', wordBreak: 'break-all', color: 'var(--accent-cyan)', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', display: 'block', marginTop: '4px', border: '1px dashed rgba(0,214,255,0.2)' }}>{secretCode}</code>
              </div>
            </div>

            <div className="setup-instructions" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>Instructions:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexFlow: 'column', gap: '8px' }}>
                <li>Download <strong>Google Authenticator</strong> or <strong>Authy</strong> on iOS or Android.</li>
                <li>Tap the "+" icon and choose <strong>Scan a QR Code</strong>.</li>
                <li>Scan the QR code image displayed on the left, or manually enter the key code.</li>
                <li>Once linked, type the 6-digit code generated by the app below to activate.</li>
              </ol>
            </div>
          </div>

          <form onSubmit={handleVerifyAndEnable} className="margin-top-20" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <div className="form-group flex-row align-center gap-10" style={{ marginBottom: 0 }}>
              <div style={{ flexGrow: 1 }}>
                <label>Enter 6-Digit Authenticator Token</label>
                <input
                  type="text"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="form-input text-center-input"
                  style={{ letterSpacing: '0.4em', fontSize: '18px', fontWeight: 'bold', maxWidth: '200px', textAlign: 'center' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '22px' }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px' }}>
                  {loading ? 'Activating...' : 'Verify & Enable'}
                </button>
                <button type="button" onClick={() => setStep('status')} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. RECOVERY CODES SCREEN */}
      {step === 'recovery' && (
        <div className="animate-text-reveal">
          <div className="flex-row align-center gap-10 margin-bottom-12">
            <ShieldAlert size={32} className="text-red" />
            <div>
              <h3>Save Your Recovery Keys</h3>
              <p className="helper-text" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Store these recovery codes securely. Each code can only be used once.
              </p>
            </div>
          </div>
          <div className="form-divider"></div>

          <div className="recovery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            {recoveryCodes.map((code, index) => (
              <div key={index} style={{ fontFamily: 'monospace', fontSize: '14px', display: 'flex', gap: '8px', color: '#fff' }}>
                <span style={{ color: 'var(--text-muted)' }}>{index + 1}.</span>
                <strong>{code}</strong>
              </div>
            ))}
          </div>

          <div className="flex-row gap-10 margin-top-20">
            <button onClick={downloadRecoveryCodes} className="btn-secondary" style={{ gap: '8px', borderRadius: '8px', flexGrow: 1 }}>
              <Download size={16} />
              <span>Download Codes (.txt)</span>
            </button>
            <button onClick={() => setStep('status')} className="btn-primary" style={{ gap: '8px', borderRadius: '8px', flexGrow: 1 }}>
              <span>Finish Setup</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. DISABLE CONFIRM SCREEN */}
      {step === 'disable_confirm' && (
        <form onSubmit={handleDisable2FA} className="animate-text-reveal">
          <div className="flex-row align-center gap-10 margin-bottom-12">
            <Lock size={32} className="text-red" />
            <div>
              <h3>Deactivate 2FA Security</h3>
              <p className="helper-text" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Verify your identity to disable two-factor authentication.
              </p>
            </div>
          </div>
          <div className="form-divider"></div>

          <div className="form-group">
            <label>Account Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to confirm"
                className="form-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex-row gap-10 margin-top-20">
            <button type="submit" disabled={loading} className="btn-accent" style={{ borderRadius: '8px', flexGrow: 1 }}>
              {loading ? 'Deactivating...' : 'Confirm Deactivation'}
            </button>
            <button type="button" onClick={() => setStep('status')} className="btn-secondary" style={{ borderRadius: '8px', flexGrow: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

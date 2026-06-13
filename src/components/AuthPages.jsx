import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Mail, Lock, User, MapPin, Plus, Trash2, Key, Check, ShieldAlert, ArrowRight, Download, RefreshCw, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '8px' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function AuthPages() {
  const {
  handleLogin,
  handleVerify2FA,
  handleGoogleSignIn,
  handleRegister,
  setActivePage,
  isLoggedIn,
  userRole,
  setUserRole
} = useContext(AppContext);
  const [isLoginView, setIsLoginView] = useState(true);

  // Form Inputs
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [familyHead, setFamilyHead] = useState('');
  const [familyMembers, setFamilyMembers] = useState(['']);



  // 2FA Dialog States
  const [show2FAVerifyScreen, setShow2FAVerifyScreen] = useState(false);
  const [temp2FAToken, setTemp2FAToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // 2FA Setup Setup Wizard States (on Registration/First Login)
  const [show2FASetupScreen, setShow2FASetupScreen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [setupInstructions, setSetupInstructions] = useState([]);

  // 2FA Recovery Codes screen
  const [showRecoveryCodesScreen, setShowRecoveryCodesScreen] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  // Reset 2FA screen (Lost Device recovery)
  const [showReset2FAScreen, setShowReset2FAScreen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetRecoveryCode, setResetRecoveryCode] = useState('');

  // UI status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddFamilyMember = () => {
    if (familyMembers.length < 10) {
      setFamilyMembers([...familyMembers, '']);
    }
  };

  const handleRemoveFamilyMember = (index) => {
    const updated = familyMembers.filter((_, idx) => idx !== index);
    setFamilyMembers(updated);
  };

  const handleFamilyMemberChange = (index, value) => {
    const updated = [...familyMembers];
    updated[index] = value;
    setFamilyMembers(updated);
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let finalUsername = usernameOrEmail.trim();
    let finalPassword = password.trim();

    
    if (!finalUsername || !finalPassword) {
      setErrorMessage('Please fill in both fields.');
      return;
    }

    const res = await handleLogin(finalUsername, finalPassword);
    if (res.success) {
      setUserRole(res.user?.roleName || "Member");
      if (res.twoFactorRequired) {
        setTemp2FAToken(res.tempToken);
        setShow2FAVerifyScreen(true);
      } else {
        setSuccessMessage('Logged in successfully!');
        setTimeout(() => {
          if (res.user?.roleName === 'Super Admin') {
            setActivePage('admin-dashboard');
          } else if (res.user?.roleName === 'Pastor') {
            setActivePage('pastor-dashboard');
          } else {
            setActivePage('member-dashboard');
          }
        }, 1000);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  // Submit TOTP login code
  const submit2FAVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!totpCode || totpCode.trim().length < 6) {
      setErrorMessage('Please enter a valid 6-digit verification code.');
      return;
    }

    const res = await handleVerify2FA(temp2FAToken, totpCode);
    if (res.success) {
      setUserRole(res.user?.roleName || "Member");
      setSuccessMessage('2FA Authentication Successful!');
      setTimeout(() => {
        if (res.user?.roleName === 'Super Admin') {
          setActivePage('admin-dashboard');
        } else if (res.user?.roleName === 'Pastor') {
          setActivePage('pastor-dashboard');
        } else {
          setActivePage('member-dashboard');
        }
      }, 1000);
    } else {
      setErrorMessage(res.message || 'Incorrect verification code. Please try again.');
    }
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    const userInfo = {
      name,
      email,
      password,
      mobile,
      address,
      familyHead: familyHead || name,
      familyMembers: familyMembers.filter(m => m.trim() !== '')
    };

    const res = await handleRegister(userInfo);
    if (res.success) {
      // Upon successful registration, prompt user to set up 2FA immediately for security
      initiate2FASetup();
    } else {
      setErrorMessage(res.message);
    }
  };

  // Triggers Speakeasy setup on backend
  const initiate2FASetup = async () => {
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecretCode(data.secretCode);
        setSetupInstructions(data.instructions);
        setShow2FASetupScreen(true);
      } else {
        // If 2FA setup fails, log them into dashboard anyway, they can do it later
        setActivePage('member-dashboard');
      }
    } catch (err) {
      console.error(err);
      setActivePage('member-dashboard');
    }
  };

  // Validate setup code to enable 2FA
  const verifyAndEnable2FA = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!totpCode) {
      setErrorMessage('Code required.');
      return;
    }

    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode })
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryCodes(data.recoveryCodes);
        setShow2FASetupScreen(false);
        setShowRecoveryCodesScreen(true);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      setErrorMessage('Verification failed: ' + err.message);
    }
  };

  // Lost device 2FA reset
  const handleReset2FA = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetEmail || !resetRecoveryCode) {
      setErrorMessage('Please enter both your email and recovery code.');
      return;
    }

    try {
      const res = await fetch('/api/auth/2fa/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, recoveryCode: resetRecoveryCode })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          setShowReset2FAScreen(false);
          setIsLoginView(true);
          setShow2FAVerifyScreen(false);
        }, 3000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      setErrorMessage('Reset failed: ' + err.message);
    }
  };

  // Parse redirect query parameters from Google OAuth flow on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Check if 2FA verification is required after Google authentication
    if (params.get('twoFactorRequired') === 'true') {
      const token = params.get('tempToken');
      if (token) {
        setTemp2FAToken(token);
        setShow2FAVerifyScreen(true);
        // Clean query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Check if there is an authentication error returned from OAuth
    const err = params.get('authError');
    if (err) {
      setErrorMessage(decodeURIComponent(err));
      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Download recovery codes as text file
  const downloadRecoveryCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([recoveryCodes.join("\n")], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = " LEC_2FA_Recovery_Codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="auth-page section-padding">
      <div className="auth-container">

        {/* Banner Alert Messages */}
        {errorMessage && (
          <div className="alert-banner error-banner animate-text-reveal">
            <ShieldAlert size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="alert-banner success-banner animate-text-reveal">
            <Check size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. 2FA CODE VERIFICATION VIEW (LOGGING IN) */}
        {show2FAVerifyScreen && (
          <div className="auth-box glass-panel animate-text-reveal">
            <div className="auth-box-header text-center">
              <Key size={38} className="text-cyan margin-bottom-12" />
              <h3>Two-Factor Authentication</h3>
              <p>Your account is protected. Enter the 6-digit security code generated by your Authenticator app.</p>
            </div>
            <div className="form-divider"></div>

            <form onSubmit={submit2FAVerify} className="auth-form">
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="form-input text-center-input"
                  style={{ letterSpacing: '0.5em', fontSize: '20px', fontWeight: 'bold' }}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-primary w-full auth-submit-btn">
                <span>Verify & Log In</span>
              </button>

              <div className="auth-extra-row justify-center margin-top-12">
                <button
                  type="button"
                  onClick={() => {
                    setShow2FAVerifyScreen(false);
                    setTotpCode('');
                  }}
                  className="text-link-btn"
                >
                  Back to Password Sign In
                </button>
                <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset2FAScreen(true);
                    setShow2FAVerifyScreen(false);
                  }}
                  className="text-link-btn text-red"
                >
                  Lost Device? Use Recovery Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. 2FA SETUP WIZARD VIEW (DURING REGISTRATION) */}
        {show2FASetupScreen && (
          <div className="auth-box glass-panel animate-text-reveal">
            <div className="auth-box-header">
              <Smartphone size={32} className="text-cyan margin-bottom-12" />
              <h3>Secure Your Account</h3>
              <p>Set up two-factor authentication to complete your church registration.</p>
            </div>
            <div className="form-divider"></div>

            <div className="setup-wizard-layout">
              <div className="qr-code-holder">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Authenticator QR Code" className="qr-code-img" />
                ) : (
                  <div className="qr-placeholder"><RefreshCw className="spinning" /></div>
                )}
                <div className="manual-secret-box">
                  <span className="secret-label">Setup Key (Manual Entry):</span>
                  <code className="secret-value">{secretCode}</code>
                </div>
              </div>

              <div className="setup-instructions-list">
                <h4>Instructions:</h4>
                <ol>
                  {setupInstructions.map((inst, index) => (
                    <li key={index}>{inst}</li>
                  ))}
                </ol>
              </div>
            </div>

            <form onSubmit={verifyAndEnable2FA} className="auth-form margin-top-20">
              <div className="form-group">
                <label>Enter 6-digit Authenticator Code to Verify:</label>
                <input
                  type="text"
                  maxLength="6"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  className="form-input text-center-input"
                  style={{ letterSpacing: '0.2em', fontSize: '18px', fontWeight: 'bold' }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Verify and Complete Setup
              </button>
            </form>
          </div>
        )}

        {/* 3. RECOVERY CODES DISPLAY VIEW */}
        {showRecoveryCodesScreen && (
          <div className="auth-box glass-panel animate-text-reveal">
            <div className="auth-box-header">
              <ShieldAlert size={38} className="text-red margin-bottom-12" />
              <h3>Save Your Recovery Codes</h3>
              <p>If you lose your phone or delete your Authenticator app, you will need these codes to access your account. Store them in a secure location.</p>
            </div>
            <div className="form-divider"></div>

            <div className="recovery-codes-grid">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="recovery-code-card">
                  <span className="code-number">{index + 1}.</span>
                  <span className="code-text">{code}</span>
                </div>
              ))}
            </div>

            <div className="action-buttons-stack margin-top-20">
              <button onClick={downloadRecoveryCodes} className="btn-secondary w-full" style={{ gap: '10px' }}>
                <Download size={16} />
                <span>Download Codes as Text</span>
              </button>

              <button
                onClick={() => {
                  setShowRecoveryCodesScreen(false);
                  setActivePage('member-dashboard');
                }}
                className="btn-primary w-full margin-top-12"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 4. LOST DEVICE RESET 2FA VIEW */}
        {showReset2FAScreen && (
          <div className="auth-box glass-panel animate-text-reveal">
            <div className="auth-box-header text-center">
              <ShieldAlert size={38} className="text-red margin-bottom-12" />
              <h3>Reset Two-Factor Authentication</h3>
              <p>Disable 2FA on your account using one of your 6-digit recovery codes.</p>
            </div>
            <div className="form-divider"></div>

            <form onSubmit={handleReset2FA} className="auth-form">
              <div className="form-group">
                <label>Account Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>6-Digit Recovery Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={resetRecoveryCode}
                  onChange={(e) => setResetRecoveryCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="form-input text-center-input"
                  style={{ letterSpacing: '0.2em', fontWeight: 'bold' }}
                  required
                />
              </div>

              <button type="submit" className="btn-accent w-full">
                Disable 2FA Protection
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReset2FAScreen(false);
                  setIsLoginView(true);
                }}
                className="text-link-btn w-full text-center margin-top-12"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        )}

        {/* 5. MAIN LOGIN & REGISTER FORMS (DEFAULT VIEW) */}
        {!show2FAVerifyScreen && !show2FASetupScreen && !showRecoveryCodesScreen && !showReset2FAScreen && (
          <>
            {/* Toggle tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${isLoginView ? 'active' : ''}`}
                onClick={() => {
                  setIsLoginView(true);
                  setErrorMessage('');
                }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${!isLoginView ? 'active' : ''}`}
                onClick={() => {
                  setIsLoginView(false);
                  setErrorMessage('');
                }}
              >
                Join Lord's Kingdom
              </button>
            </div>

            {/* Form panel wrapper */}
            <div className="auth-box glass-panel">

              {isLoginView ? (
                /* PASSWORD SIGN IN VIEW */
                <div className="auth-form-wrapper">
                  <div className="auth-box-header">
                    <h3>Sanctuary Portal Sign In</h3>
                    <p>Enter your credentials to manage household details and prayer lists.</p>
                  </div>
                  <div className="form-divider"></div>

                  <form onSubmit={submitLogin} className="auth-form">

                    <div className="form-group">
                      <label>Email Address or Username</label>
                      <div className="input-with-icon">
  <Mail size={16} className="input-icon" />
  <input
    type="text"
    value={usernameOrEmail}
    onChange={(e) => setUsernameOrEmail(e.target.value)}
    placeholder="Enter username"
    className="form-input"
    required
  />
</div>
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <div className="input-with-icon">
                        <Lock size={16} className="input-icon" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-full auth-submit-btn">
                      <span>Kingdom Welcomes You</span>
                    </button>
                  </form>

                  <div className="oauth-divider-row">
                    <span className="line"></span>
                    <span className="text">or</span>
                    <span className="line"></span>
                  </div>

                  <button
  onClick={async () => {
    console.log("clicked");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    console.log("data", data);
    console.log("error", error);
  }}
  className="btn-secondary w-full"
>
  <GoogleIcon />
  <span>Sign In with Google</span>
</button>
                </div>
              ) : (
                /* COVENANT MEMBERSHIP REGISTRATION */
                <div className="auth-form-wrapper">
                  <div className="auth-box-header">
                    <h3>Covenant Registration</h3>
                    <p>Register your household profile to join Life Edifiers fellowship registry.</p>
                  </div>
                  <div className="form-divider"></div>
                  <div className="form-divider"></div>
                  <div className="oauth-register-section">
  <button
    type="button"
    onClick={async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error(error);
      }
    }}
    className="btn-secondary w-full"
    style={{
      background: 'rgba(255,255,255,0.02)',
      borderColor: 'var(--border-glass)',
      marginBottom: '16px'
    }}
  >
    <GoogleIcon />
    <span>Register with Google</span>
  </button>

  <div className="oauth-divider-row">
    <span className="line"></span>
    <span className="text">or register manually</span>
    <span className="line"></span>
  </div>
</div>
                  <form onSubmit={submitRegistration} className="auth-form">

                    <div className="registration-fields-grid">

                      <div className="form-group">
                        <label>Full Name *</label>
                        <div className="input-with-icon">
                          <User size={16} className="input-icon" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="form-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Email Address *</label>
                        <div className="input-with-icon">
                          <Mail size={16} className="input-icon" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@email.com"
                            className="form-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Password *</label>
                        <div className="input-with-icon">
                          <Lock size={16} className="input-icon" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="form-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Mobile Number *</label>
                        <div className="input-with-icon">
                          <Smartphone size={16} className="input-icon" />
                          <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="9876543210"
                            className="form-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group grid-span-2">
                        <label>Residential Address</label>
                        <div className="input-with-icon">
                          <MapPin size={16} className="input-icon" />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Kondapur, Hyderabad, TS"
                            className="form-input"
                          />
                        </div>
                      </div>

                      {/* Family Census Setup */}
                      <div className="form-group grid-span-2 family-builder-section">
                        <div className="section-title-row">
                          <span className="family-label">Household Registry (Family Census)</span>
                          <p className="family-desc">Link dependent members. Deletes all pre-existing simulation records.</p>
                        </div>

                        <div className="form-group margin-top-12">
                          <label>Head of Family Name (If other than self)</label>
                          <input
                            type="text"
                            value={familyHead}
                            onChange={(e) => setFamilyHead(e.target.value)}
                            placeholder="e.g. John Doe Sr."
                            className="form-input"
                          />
                        </div>

                        <div className="family-members-list">
                          <label>Family Members & Relation</label>
                          {familyMembers.map((member, index) => (
                            <div key={index} className="member-input-row margin-top-6">
                              <input
                                type="text"
                                value={member}
                                onChange={(e) => handleFamilyMemberChange(index, e.target.value)}
                                placeholder={`Member ${index + 1} (e.g. Sarah Doe - Spouse)`}
                                className="form-input"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFamilyMember(index)}
                                className="btn-remove-member"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={handleAddFamilyMember}
                            className="btn-secondary add-member-btn margin-top-12"
                          >
                            <Plus size={14} />
                            <span>Add Family Member</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    <button type="submit" className="btn-primary w-full auth-submit-btn">
                      <span>Enter into Lords Kingdom</span> 
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .auth-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: center;
        }

        .auth-container {
          max-width: 540px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          background: rgba(12, 12, 14, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: 50px;
          padding: 6px;
        }

        .auth-tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 14px;
          padding: 12px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-tab.active {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: #FFF;
        }

        .auth-box {
          padding: 40px;
          background: var(--bg-card);
        }

        @media (max-width: 576px) {
          .auth-box {
            padding: 24px;
          }
        }

        .auth-box-header {
          text-align: left;
        }

        .auth-box-header h3 {
          font-size: 24px;
          color: #FFF;
        }

        .auth-box-header p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-top: 6px;
          line-height: 1.5;
        }

        .form-divider {
          height: 1px;
          background: var(--border-glass);
          margin: 24px 0;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-with-icon {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .input-with-icon .form-input {
          padding-left: 42px;
        }

        .auth-extra-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        .text-link-btn {
          background: none;
          border: none;
          color: var(--accent-cyan);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 13px;
          text-decoration: none;
        }

        .text-link-btn:hover {
          text-decoration: underline;
        }

        .text-link-btn.text-red {
          color: #FF4D4D;
        }

        .auth-submit-btn {
          padding: 14px;
          font-size: 16px;
        }

        .oauth-divider-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 16px 0;
        }

        .oauth-divider-row .line {
          height: 1px;
          flex-grow: 1;
          background: var(--border-glass);
        }

        .oauth-divider-row .text {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        /* Registration Fields Grid */
        .registration-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 576px) {
          .registration-fields-grid {
            grid-template-columns: 1fr;
          }
          .grid-span-2 {
            grid-column: span 1 !important;
          }
        }

        .grid-span-2 {
          grid-column: span 2;
        }

        .family-builder-section {
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
          margin-top: 8px;
        }

        .section-title-row {
          text-align: left;
        }

        .family-label {
          font-family: var(--font-heading);
          font-weight: 700;
          color: #FFF;
          font-size: 14px;
        }

        .family-desc {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .margin-top-12 { margin-top: 12px; }
        .margin-top-6 { margin-top: 6px; }
        .margin-bottom-12 { margin-bottom: 12px; }

        .member-input-row {
          display: flex;
          gap: 10px;
        }

        .btn-remove-member {
          background: rgba(255, 0, 0, 0.05);
          border: 1px solid rgba(255, 0, 0, 0.2);
          color: var(--text-secondary);
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-remove-member:hover {
          background: rgba(255, 0, 0, 0.15);
          color: var(--accent-red);
        }

        .add-member-btn {
          width: 100%;
          border-radius: 8px;
          padding: 10px;
          font-size: 13.5px;
        }

        /* Alert Banners */
        .alert-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          font-family: var(--font-sans);
          font-size: 14px;
          text-align: left;
        }

        .error-banner {
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #FF4D4D;
        }

        .success-banner {
          background: rgba(0, 214, 255, 0.08);
          border: 1px solid rgba(0, 214, 255, 0.3);
          color: var(--accent-cyan);
        }

        /* 2FA Setup Wizard Layout */
        .setup-wizard-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          text-align: left;
        }

        @media (max-width: 576px) {
          .setup-wizard-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .qr-code-holder {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border-glass);
        }

        .qr-code-img {
          width: 160px;
          height: 160px;
          background: white;
          padding: 8px;
          border-radius: 8px;
        }

        .qr-placeholder {
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .spinning {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .manual-secret-box {
          margin-top: 14px;
          width: 100%;
          text-align: center;
        }

        .secret-label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
        }

        .secret-value {
          display: block;
          font-family: monospace;
          background: rgba(255,255,255,0.04);
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid var(--border-glass);
          font-size: 13px;
          color: #FFF;
          margin-top: 4px;
          word-break: break-all;
        }

        .setup-instructions-list h4 {
          font-size: 15px;
          color: #FFF;
          margin-bottom: 12px;
        }

        .setup-instructions-list ol {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 13.5px;
          line-height: 1.5;
        }

        .text-center-input {
          text-align: center;
        }

        /* Recovery codes */
        .recovery-codes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .recovery-code-card {
          display: flex;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          padding: 10px 14px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          color: #FFF;
        }

        .recovery-code-card .code-number {
          color: var(--text-muted);
        }

        .action-buttons-stack {
          display: flex;
          flex-direction: column;
        }

        /* Developer Test accounts panel */
        .test-accounts-panel {
          padding: 24px;
          background: rgba(10, 10, 12, 0.4);
          border: 1px solid var(--border-glass);
          text-align: center;
        }

        .test-accounts-panel h4 {
          font-size: 14px;
          color: #FFF;
          margin-bottom: 6px;
        }

        .test-accounts-panel p {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .test-buttons-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .test-acc-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          color: #FFF;
          padding: 8px 16px;
          border-radius: 30px;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .test-acc-btn.admin:hover {
          background: rgba(0, 80, 255, 0.05);
          border-color: var(--accent-blue);
          color: var(--accent-blue);
        }

        .test-acc-btn.member:hover {
          background: rgba(0, 214, 255, 0.05);
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }

        /* Google Sign-in Simulator Modal */
        .sim-modal-overlay, .sim-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.85);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .sim-modal-box {
          max-width: 440px;
          width: 100%;
          padding: 30px;
          background: var(--bg-card);
        }

        .sim-modal-header h3 {
          font-size: 20px;
          color: #FFF;
        }

        .sim-modal-header p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .sim-accounts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .sim-account-row {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #FFF;
        }

        .sim-account-row:hover {
          background: rgba(0, 214, 255, 0.05);
          border-color: var(--accent-cyan);
        }

        .sim-account-row .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .sim-account-row .details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sim-account-row .details strong {
          font-size: 14px;
        }

        .sim-account-row .details span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .sim-custom-user-form {
          border-top: 1px solid var(--border-glass);
          padding-top: 16px;
          margin-top: 8px;
        }

        .sim-custom-user-form p {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}

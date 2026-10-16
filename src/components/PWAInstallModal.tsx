import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Sparkles, 
  RefreshCw, 
  GitBranch, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'vercel' | 'updates'>('install');
  const [currentUrl, setCurrentUrl] = useState('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin;
      setCurrentUrl(url);
      setCustomUrl(url);
      QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#10b981', light: '#09090b' } })
        .then(setQrSvg)
        .catch(() => {});
    }
  }, [isOpen]);

  const handleUpdateQr = (url: string) => {
    setCustomUrl(url);
    if (!url) return;
    QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#10b981', light: '#09090b' } })
      .then(setQrSvg)
      .catch(() => {});
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-app-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 scrollbar-none">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Android & Continuous Deployment
              </span>
              <h3 id="install-app-title" className="text-lg font-bold text-zinc-100">
                Install & Auto-Update Guide
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
              activeTab === 'install'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. Install on Android
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
              activeTab === 'vercel'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2. Vercel Hosting
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
              activeTab === 'updates'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3. Auto-Updates
          </button>
        </div>

        {/* Tab 1: Android Installation */}
        {activeTab === 'install' && (
          <div className="space-y-4">
            {isInstalled ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1 text-center">
                <div className="font-bold text-sm flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> App Already Running in Standalone Mode
                </div>
                <p className="text-zinc-400">
                  Chronos Flow is already installed as a standalone app on this device.
                </p>
              </div>
            ) : isInstallable ? (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="text-xs font-semibold text-zinc-200">
                  One-Tap Installation Available
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App on this Phone</span>
                </button>
              </div>
            ) : null}

            {/* Android Step-by-Step Instructions */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-3 text-xs">
              <div className="font-semibold text-zinc-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>How to Install on Android Phone:</span>
              </div>
              <ol className="space-y-2.5 text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Open your app link (or your custom Vercel URL) in <strong>Google Chrome</strong> on your Android phone.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Tap the <strong>three dots menu (⋮)</strong> in the top right corner of Chrome.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Select <strong className="text-emerald-400">Install app</strong> (or <strong className="text-emerald-400">Add to Home screen</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <span>
                    Tap <strong>Install</strong>. The Chronos Flow icon appears on your home screen and drawer, opening as a full-screen native app!
                  </span>
                </li>
              </ol>
            </div>

            {/* QR Code to scan with phone */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  Scan with Phone Camera:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(customUrl)}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied Link' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {qrSvg && (
                  <div
                    className="w-28 h-28 rounded-xl bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                )}
                <div className="w-full space-y-2 text-xs">
                  <p className="text-zinc-400 text-[11px]">
                    Point your Android camera at the QR code to open the link directly on your phone.
                  </p>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => handleUpdateQr(e.target.value)}
                    placeholder="https://your-app.vercel.app"
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vercel Setup */}
        {activeTab === 'vercel' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <span>Continuous Deployment Pipeline</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Vercel is the recommended approach for continuous updates. By connecting your GitHub repository to Vercel, every change you push triggers an automatic build and deployment.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200">Step 1: Push Code to GitHub</div>
                  <p className="text-zinc-400 text-[11px]">
                    Download or export your repository and push to GitHub:
                  </p>
                  <pre className="p-2 bg-zinc-900 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto">
                    git add . && git commit -m &quot;update&quot; && git push origin main
                  </pre>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200">Step 2: Connect Vercel to GitHub</div>
                  <p className="text-zinc-400 text-[11px]">
                    Go to <strong>vercel.com</strong> &gt; Click <strong>&quot;Add New Project&quot;</strong> &gt; Select your GitHub repository.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200">Step 3: Auto-Detected Build Settings</div>
                  <ul className="text-zinc-400 text-[11px] space-y-1 list-disc list-inside">
                    <li>Framework Preset: <strong>Vite</strong></li>
                    <li>Build Command: <code className="text-zinc-300">npm run build</code></li>
                    <li>Output Directory: <code className="text-zinc-300">dist</code></li>
                  </ul>
                  <p className="text-[10px] text-emerald-400/90 pt-1">
                    ✓ The project includes pre-configured <code className="text-white">vercel.json</code> for seamless routing and cache invalidation.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Ready to link on Vercel</span>
              </div>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors"
              >
                <span>Open Vercel</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: Automatic Updates */}
        {activeTab === 'updates' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>How Automatic Updates Work</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Because Chronos Flow is built as a Progressive Web App (PWA) with an auto-updating service worker, you never have to manually reinstall or update via an app store.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-zinc-200">1. Instant Background Check</div>
                    <p className="text-zinc-400 text-[11px]">
                      Every time you open the app or switch back to it on your phone, it checks Vercel for new changes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-zinc-200">2. Zero-Cache Invalidation</div>
                    <p className="text-zinc-400 text-[11px]">
                      Our <code className="text-zinc-300">vercel.json</code> sets <code className="text-emerald-400">max-age=0</code> on the service worker, ensuring your Android phone never serves old code.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-zinc-200">3. Preserved Local Data</div>
                    <p className="text-zinc-400 text-[11px]">
                      Your completed tasks, fire streak, custom alarms, and Google Calendar connection persist securely in local storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Auto-update status: Active</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

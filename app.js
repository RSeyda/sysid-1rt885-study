/* ==========================================================================
   1RT885 System Identification Study Hub — Core Application Engine
   ========================================================================== */

(function () {
  'use strict';

  // Course Blocks Metadata (Aligned with system-identification-study-prompt.md)
  const COURSE_BLOCKS = [
    {
      id: 'block1',
      code: 'Block 1',
      title: 'Mathematical Tools & Least Squares',
      hours: '3–4 h',
      prereq: 'Basic algebra; diagnose first',
      sources: 'LinReg2021 pp.3–8; exam2023 p.2 Q3(a–b); ESI p.3 Q3(c–d), p.4 Q4(b)',
      outcome: 'Regressors φ(t), dimensions, normal equations, Euclidean/Frobenius norms, rank, uniqueness, and Moore-Penrose pseudoinverses.'
    },
    {
      id: 'block2',
      code: 'Block 2',
      title: 'Stochastic Foundations',
      hours: '2–3 h',
      prereq: 'Sums and products',
      sources: 'L13 pp.5–6; SI_rexam2020 p.1 Q2(a); E1',
      outcome: 'Expectation, variance, auto/cross-covariance R(τ), stationarity, white vs. coloured noise, and filtered noise processes.'
    },
    {
      id: 'block3',
      code: 'Block 3',
      title: 'Model Structures & Prediction',
      hours: '3–4 h',
      prereq: 'Block 1 + basic Block 2',
      sources: 'L6 pp.9–26; exam2023 p.2 Q1(a–b); E2',
      outcome: 'FIR, ARX, ARMAX, OE, BJ; G(q) and H(q); delays; deriving 1-step predictor difference equations; prediction vs. simulation.'
    },
    {
      id: 'block4',
      code: 'Block 4',
      title: 'Estimator Properties & Informative Data',
      hours: '3–4 h',
      prereq: 'Blocks 1–3',
      sources: 'LinReg2021 pp.11–15; L7 pp.17–21; exam2023 p.4 Q5(a–b); SI2020 pp.1–2 Q3',
      outcome: 'Bias, finite-sample variance with coloured noise, consistency, persistent excitation, closed-loop feedback, and noisy inputs.'
    },
    {
      id: 'block5',
      code: 'Block 5',
      title: 'Maximum Likelihood Connections',
      hours: '1–2 h',
      prereq: 'Blocks 1–3, probability density basics',
      sources: 'L7 p.5; L6 p.29',
      outcome: 'Deriving LS and PEM from Gaussian likelihood, invariance, asymptotic efficiency, and required covariance/initial conditions.'
    },
    {
      id: 'block6',
      code: 'Block 6',
      title: 'PEM, Validation & Model Assessment',
      hours: '2–3 h',
      prereq: 'Blocks 3–4',
      sources: 'L7 pp.5–8, 14–17; L8 pp.23–38; exam2023 p.3 Q4(a–b)',
      outcome: 'PEM criterion, model mismatch, order selection (AIC/BIC), pole-zero cancellation, residual correlation tests, MSE & FIT.'
    },
    {
      id: 'block7',
      code: 'Block 7',
      title: 'State-Space & Subspace Identification',
      hours: '5–7 h',
      prereq: 'Blocks 1–3; revisit probability as needed',
      sources: 'ESI pp.1–5 Q1–6; Master Guide Sec 3.5; SI2025 Q2 (reserved)',
      outcome: 'Innovations form, Riccati & Kalman gain K, extended observability O_r, projections Π = I - U†U, LQ/SVD, realization ambiguity, vec/Kronecker.'
    },
    {
      id: 'block8',
      code: 'Block 8',
      title: 'Regularization, RLS & Nonlinear Modelling',
      hours: '3–4 h',
      prereq: 'Blocks 1, 4, 6',
      sources: 'ESI-regularization pp.1–2; L10 pp.24–30; L11 pp.14, 18–21; SI_rexam2020 Q1(a); L12',
      outcome: 'Ridge & LASSO, bias-variance tuning, Recursive Least Squares (RLS) & forgetting factor, Hammerstein/Wiener & equilibrium linearization.'
    },
    {
      id: 'labs',
      code: 'Labs & Projects',
      title: 'Practical Labs & MIMO Project Concepts',
      hours: 'Integrated',
      prereq: 'Blocks 3, 6, 7',
      sources: 'processlab (1).pdf; CL1–CL4; Project2 (1).pdf; Mini_project_subspace_methods.pdf',
      outcome: 'Experiment design, sampling & anti-aliasing, mean/drift removal, SISO vs. MIMO acoustic couplings, singular value knee points.'
    }
  ];

  // Reference Index Formulas (from system-identification-progress.md)
  const FORMULA_REFERENCE = [
    {
      title: 'Linear Regression & Normal Equations',
      math: '$$\\hat{y}(t) = \\varphi^\\top(t)\\theta \\iff Y = \\Phi^\\top \\theta + E, \\quad \\hat{\\theta}_{\\text{LS}} = (\\Phi\\Phi^\\top)^{-1}\\Phi Y \\text{ or } (\\Phi^\\top\\Phi)^{-1}\\Phi^\\top Y$$',
      caution: 'Always check whether a source stacks φ(t) as columns (Φ ∈ ℝ^{d×N}, as in L8/ESI) or rows (Φ ∈ ℝ^{N×d}, as in LinReg2021 pp.5–8). Uniqueness requires full rank d.',
      source: 'LinReg2021 pp.5–8; L8 p.3'
    },
    {
      title: 'Finite-Sample LS Bias & Coloured-Noise Covariance',
      math: '$$\\mathbb{E}[\\hat{\\theta}] = \\theta_0 + \\mathbb{E}\\left[(\\Phi^\\top\\Phi)^{-1}\\Phi^\\top w\\right], \\quad \\text{Cov}(\\hat{\\theta}) = (\\Phi^\\top\\Phi)^{-1}\\Phi^\\top R_w \\Phi (\\Phi^\\top\\Phi)^{-1}$$',
      caution: 'For deterministic/open-loop input u(t) independent of coloured noise w(t) in an FIR model, LS is still unbiased! However, the variance uses the full Toeplitz covariance matrix R_w = E[ww^⊤], not λ(Φ^⊤Φ)^{-1}.',
      source: 'LinReg2021 pp.11–14; solutions2025 p.3 Q3(c)'
    },
    {
      title: 'Large-Sample Consistency Conditions',
      math: '$$\\hat{\\theta}_N \\to \\theta_0 \\iff \\mathbb{E}[\\varphi(t)\\varphi^\\top(t)] \\text{ is invertible (persistent excitation)} \\;\\land\\; \\mathbb{E}[\\varphi(t)e(t)] = 0$$',
      caution: 'Pure proportional feedback u(t) = -Ky(t) makes φ(t) = [-y(t-1), u(t-1)]^⊤ linearly dependent (det = 0). Adding an independent excitation signal v(t) or r(t) restores full rank.',
      source: 'LinReg2021 pp.14–15; solutions2025 p.4 Q5'
    },
    {
      title: 'Optimal 1-Step Predictor & Stability',
      math: '$$\\hat{y}(t|\\theta) = \\left(1 - H^{-1}(q;\\theta)\\right)y(t) + H^{-1}(q;\\theta)G(q;\\theta)u(t)$$',
      caution: 'Requires causal, stable H^{-1}(q) and H^{-1}(q)G(q) (zeros of H(q) strictly inside the unit circle). For OE (H(q)=1), 1-step prediction equals pure simulation G(q)u(t).',
      source: 'L6 pp.24–26; L8 p.5, p.28'
    },
    {
      title: 'State-Space Innovations, Riccati & Kalman Gain',
      math: '$$K = (APC^\\top + R_{12})(CPC^\\top + R_2)^{-1}, \\quad \\mathbb{E}[e(t)e^\\top(t)] = CPC^\\top + R_2$$',
      caution: 'In innovation form x̂(t+1) = Ax̂(t) + Bu(t) + Ke(t), y(t) = Cx̂(t) + Du(t) + e(t), the inverse noise filter H^{-1}(q) = I - C(qI - A + KC)^{-1}K has poles at eig(A - KC).',
      source: 'ESI.pdf pp.1–3, 6–7 (Exercises 1–2)'
    },
    {
      title: 'Matrix LS, Vectorization & Kronecker Product',
      math: '$$\\widehat{\\Theta} = \\mathbf{Y}\\mathbf{\\Phi}^\\dagger + \\mathbf{W}(I - \\mathbf{\\Phi}\\mathbf{\\Phi}^\\dagger) \\iff \\hat{\\theta} = \\text{vec}(\\widehat{\\Theta}) = F^\\dagger \\text{vec}(\\mathbf{Y}) + (I - F^\\dagger F)w, \\; F = \\mathbf{\\Phi}^\\top \\otimes I_{n+p}$$',
      caution: 'rank(A ⊗ B) = rank(A)rank(B). Unique Θ̂ requires Φ ∈ ℝ^{(n+m)×N} to have full row rank (n+m), which is equivalent to F having full column rank (n+p)(n+m).',
      source: 'ESI.pdf p.4, p.8 (Exercise 4)'
    },
    {
      title: 'Subspace Projection & LQ Factorization',
      math: '$$\\Pi = I - \\mathbf{U}^\\dagger\\mathbf{U} = I - Q_1 Q_1^\\top, \\quad G = \\mathbf{Y}\\Pi = L_{22}Q_2^\\top, \\quad \\widehat{\\Theta} = \\mathbf{Y}\\Pi\\mathbf{\\Phi}^\\top(\\mathbf{\\Phi}\\Pi\\mathbf{\\Phi}^\\top)^{-1}$$',
      caution: 'In 3-block LQ factorization [U; Φ; Y] = L Q^⊤ (MOESP), Ĝ = YΠΦ^⊤(ΦΠΦ^⊤)^{-1}ΦΠQ_2 simplifies directly to L_{32}, whose column space estimates the range space of O_r.',
      source: 'ESI.pdf p.5, pp.8–9 (Exercises 5–6); solutions2025 p.2 Q2'
    },
    {
      title: 'Ridge Regression, LASSO & RLS',
      math: '$$\\hat{\\theta}_{\\text{ridge}} = (\\Phi^\\top\\Phi + \\lambda I)^{-1}\\Phi^\\top Y, \\quad \\hat{\\theta}_{\\text{lasso},j} = \\text{sign}(\\hat{\\theta}_{\\text{LS},j})\\max\\left(0, |\\hat{\\theta}_{\\text{LS},j}| - \\frac{\\lambda}{2N}\\right)$$',
      caution: 'Caution on ESI-regularization Q3(a): training-error covariance identities require specific unbiasedness conditions and do not hold universally for arbitrary biased estimators.',
      source: 'ESI-regularization.pdf pp.1–2; L10 pp.24–30; L11 pp.14–21'
    }
  ];

  // Application State
  const QUESTIONS = window.QUESTION_BANK || [];
  const CLOUD_REPO_OWNER = 'RSeyda';
  const CLOUD_REPO_NAME = 'sysid-1rt885-study-data';

  let currentProfile = localStorage.getItem('sysid_active_profile') || 'robin';
  let userProgress = null;
  let syncState = 'local'; // 'synced', 'pending', 'local', 'error'
  let syncDetailMsg = 'Saved on this device only. Add your Cloud Sync Key in Sync & Data to sync across phone and PC.';
  let syncInFlight = false;

  // Active Session State (persisted inside userProgress.activeSession)
  let currentQuestion = null;
  let selectedTfValue = null;
  let selectedMcqIndex = null;
  let hintUsedOnCurrent = false;
  let answerSubmittedOnCurrent = false;

  // ==========================================================================
  // 1. Progress Data Schema & Storage Isolation
  // ==========================================================================
  function createDefaultProgress(profile) {
    return {
      schemaVersion: 2,
      profile: profile,
      updatedAt: Date.now(),
      cards: {}, // keyed by question.id
      bookmarks: {}, // question.id -> boolean
      flags: {}, // question.id -> string reason
      sessionHistory: [],
      activeSession: null
    };
  }

  function getCardState(qId) {
    if (!userProgress.cards[qId]) {
      userProgress.cards[qId] = {
        attempts: 0,
        independentCorrect: 0,
        assistedCorrect: 0,
        misses: 0,
        hintsUsed: 0,
        streak: 0,
        distinctReviewDays: [],
        lastReviewedAt: null,
        nextReviewAt: null,
        intervalDays: 0,
        easeFactor: 2.3,
        selfRatings: { again: 0, hard: 0, good: 0, easy: 0 },
        lastSelfRating: null,
        masteryStatus: 'unseen' // 'unseen', 'learning', 'reviewing', 'mastered'
      };
    }
    return userProgress.cards[qId];
  }

  // Documented Mastery Rule:
  // One correct answer NEVER means mastered.
  // Requires >= 3 consecutive independent (no hint) correct answers across >= 2 review intervals/sessions
  // OR >= 4 independent correct answers with >= 80% independent accuracy and streak >= 2.
  function computeMasteryStatus(card, format) {
    if (format === 'flashcard') {
      const totalSelf =
        card.selfRatings.again +
        card.selfRatings.hard +
        card.selfRatings.good +
        card.selfRatings.easy;
      if (totalSelf === 0) return 'unseen';
      if (card.lastSelfRating === 'again' || card.lastSelfRating === 'hard') {
        return 'learning';
      }
      if (card.selfRatings.good + card.selfRatings.easy >= 3 && card.intervalDays >= 3) {
        return 'mastered';
      }
      return 'reviewing';
    }

    if (card.attempts === 0) return 'unseen';
    if (card.streak === 0 && card.misses > 0) return 'learning';
    if (card.streak >= 3 && card.intervalDays >= 3) return 'mastered';
    if (
      card.independentCorrect >= 4 &&
      card.streak >= 2 &&
      card.independentCorrect / Math.max(1, card.attempts) >= 0.8
    ) {
      return 'mastered';
    }
    if (card.independentCorrect >= 1) return 'reviewing';
    return 'learning';
  }

  function getLocalKey(profile) {
    return `sysid_1rt885_progress_${profile.toLowerCase().trim()}`;
  }

  function getTokenKey(profile) {
    return `sysid_1rt885_ghtoken_${profile.toLowerCase().trim()}`;
  }

  function getPinKey(profile) {
    return `sysid_1rt885_pin_${profile.toLowerCase().trim()}`;
  }

  function loadLocalProgress(profile) {
    const key = getLocalKey(profile);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign(createDefaultProgress(profile), parsed);
      }
    } catch (e) {
      console.error('Failed to read localStorage progress:', e);
    }
    return createDefaultProgress(profile);
  }

  function saveLocalProgress() {
    if (!userProgress) return;
    userProgress.updatedAt = Date.now();
    try {
      localStorage.setItem(getLocalKey(currentProfile), JSON.stringify(userProgress));
    } catch (e) {
      console.error('Local storage write failed:', e);
      updateSyncUI('error', 'Browser storage full or blocked! Export JSON backup immediately.');
    }
  }

  // ==========================================================================
  // 2. Authenticated Cloud Sync (GitHub Private Repo REST API)
  // ==========================================================================
  function getStoredGhToken() {
    return localStorage.getItem(getTokenKey(currentProfile)) || '';
  }

  function updateSyncUI(state, detailText) {
    syncState = state;
    if (detailText) syncDetailMsg = detailText;

    const btn = document.getElementById('sync-status-btn');
    const label = document.getElementById('sync-label');
    const setBadge = document.getElementById('settings-sync-badge');
    const setDetail = document.getElementById('settings-sync-detail');

    btn.className = 'sync-pill';
    if (state === 'synced') {
      btn.classList.add('sync-ok');
      label.textContent = 'Cloud Synced';
      setBadge.textContent = 'Synced to Cloud';
      setBadge.className = 'badge ryg-green';
    } else if (state === 'pending') {
      btn.classList.add('sync-pending');
      label.textContent = 'Pending Sync';
      setBadge.textContent = 'Pending Cloud Sync';
      setBadge.className = 'badge ryg-yellow';
    } else if (state === 'error') {
      btn.classList.add('sync-error');
      label.textContent = 'Sync Issue';
      setBadge.textContent = 'Sync Error (Saved Locally)';
      setBadge.className = 'badge ryg-red';
    } else {
      btn.classList.add('sync-local');
      label.textContent = 'Device Only';
      setBadge.textContent = 'Saved on This Device Only';
      setBadge.className = 'badge ryg-unassessed';
    }

    if (setDetail) {
      setDetail.textContent = syncDetailMsg;
    }
  }

  // Merge remote and local progress safely without duplicating attempts or losing newer work
  function mergeProgressRecords(local, remote) {
    if (!remote || !remote.cards) return local;
    if (!local || !local.cards) return remote;

    const merged = createDefaultProgress(currentProfile);
    merged.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
    merged.bookmarks = Object.assign({}, remote.bookmarks || {}, local.bookmarks || {});
    merged.flags = Object.assign({}, remote.flags || {}, local.flags || {});

    const allCardIds = new Set([
      ...Object.keys(local.cards || {}),
      ...Object.keys(remote.cards || {})
    ]);

    allCardIds.forEach((id) => {
      const cLocal = local.cards[id];
      const cRemote = remote.cards[id];
      if (cLocal && !cRemote) {
        merged.cards[id] = cLocal;
      } else if (!cLocal && cRemote) {
        merged.cards[id] = cRemote;
      } else {
        // Pick the card record with more attempts, or newer lastReviewedAt timestamp
        const localTotal =
          (cLocal.attempts || 0) +
          ((cLocal.selfRatings &&
            cLocal.selfRatings.again +
              cLocal.selfRatings.hard +
              cLocal.selfRatings.good +
              cLocal.selfRatings.easy) ||
            0);
        const remoteTotal =
          (cRemote.attempts || 0) +
          ((cRemote.selfRatings &&
            cRemote.selfRatings.again +
              cRemote.selfRatings.hard +
              cRemote.selfRatings.good +
              cRemote.selfRatings.easy) ||
            0);

        if (localTotal > remoteTotal) {
          merged.cards[id] = cLocal;
        } else if (remoteTotal > localTotal) {
          merged.cards[id] = cRemote;
        } else {
          merged.cards[id] =
            (cLocal.lastReviewedAt || 0) >= (cRemote.lastReviewedAt || 0) ? cLocal : cRemote;
        }
      }
    });

    // Preserve active session from whichever device was active more recently
    if ((local.updatedAt || 0) >= (remote.updatedAt || 0)) {
      merged.activeSession = local.activeSession;
    } else {
      merged.activeSession = remote.activeSession || local.activeSession;
    }

    return merged;
  }

  async function syncWithCloud(forcePullOnly = false) {
    const token = getStoredGhToken();
    if (!token) {
      updateSyncUI(
        'local',
        'Saved in browser storage on this device only. Enter your GitHub Cloud Sync Key to enable cross-device sync.'
      );
      return;
    }

    if (!navigator.onLine) {
      updateSyncUI(
        'pending',
        'Offline: Progress is safely saved on this device and will sync automatically when connectivity returns.'
      );
      return;
    }

    if (syncInFlight) return;
    syncInFlight = true;
    updateSyncUI('pending', 'Syncing progress with private GitHub cloud storage...');

    const filePath = `progress_${currentProfile.toLowerCase().trim()}.json`;
    const apiUrl = `https://api.github.com/repos/${CLOUD_REPO_OWNER}/${CLOUD_REPO_NAME}/contents/${filePath}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    try {
      // 1. Verify authenticated user identity on server & fetch existing cloud file
      let existingSha = null;
      let remoteData = null;

      const getResp = await fetch(apiUrl, { method: 'GET', headers, cache: 'no-store' });
      if (getResp.status === 200) {
        const fileMeta = await getResp.json();
        existingSha = fileMeta.sha;
        const decoded = decodeURIComponent(escape(atob(fileMeta.content.replace(/\s/g, ''))));
        remoteData = JSON.parse(decoded);
      } else if (getResp.status === 401 || getResp.status === 403) {
        throw new Error('GitHub token rejected (401/403). Check your Cloud Sync Key in settings.');
      } else if (getResp.status !== 404) {
        throw new Error(`Cloud check returned HTTP ${getResp.status}`);
      }

      // 2. Merge remote and local state without losing newer work
      if (remoteData) {
        userProgress = mergeProgressRecords(userProgress, remoteData);
        saveLocalProgress();
      }

      if (forcePullOnly) {
        syncInFlight = false;
        updateSyncUI(
          'synced',
          `Pulled & merged latest cloud state (${new Date().toLocaleTimeString()}).`
        );
        refreshAllViews();
        return;
      }

      // 3. Push merged state back to private GitHub repo
      const jsonStr = JSON.stringify(userProgress, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));
      const putBody = {
        message: `Sync study progress for ${currentProfile} (${new Date().toISOString()})`,
        content: base64Content
      };
      if (existingSha) {
        putBody.sha = existingSha;
      }

      const putResp = await fetch(apiUrl, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        body: JSON.stringify(putBody)
      });

      if (!putResp.ok) {
        throw new Error(`Cloud write failed with HTTP ${putResp.status}`);
      }

      updateSyncUI(
        'synced',
        `Verified & synced to private repo ${CLOUD_REPO_OWNER}/${CLOUD_REPO_NAME} at ${new Date().toLocaleTimeString()}.`
      );
    } catch (err) {
      console.warn('Cloud sync warning:', err);
      updateSyncUI(
        'error',
        `Saved locally on this device. Cloud sync paused: ${err.message}`
      );
    } finally {
      syncInFlight = false;
      refreshDashboardUI();
    }
  }

  window.addEventListener('online', () => {
    if (getStoredGhToken()) {
      syncWithCloud(false);
    }
  });

  // ==========================================================================
  // 3. Math Rendering Helper (KaTeX)
  // ==========================================================================
  function renderMathInElement(el) {
    if (!el) return;
    if (typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn('KaTeX render warning:', e);
      }
    }
  }

  function setHtmlAndMath(el, text) {
    if (!el) return;
    if (!text) {
      el.innerHTML = '';
      return;
    }
    // Convert newlines to <br> outside math blocks and preserve clean formatting
    const formatted = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    el.innerHTML = formatted;
    renderMathInElement(el);
  }

  // ==========================================================================
  // 4. Numeric Input Parser (Decimal comma, scientific notation, fractions)
  // ==========================================================================
  function parseFlexibleNumeric(rawInput) {
    if (rawInput === null || rawInput === undefined) {
      return { valid: false, reason: 'Please enter a numeric value before submitting.' };
    }
    let cleaned = String(rawInput).trim().replace(/\s+/g, '');
    if (cleaned.length === 0) {
      return { valid: false, reason: 'Answer cannot be blank. Enter a number to check your work.' };
    }
    // Replace Unicode minus with standard hyphen-minus
    cleaned = cleaned.replace(/[−–—]/g, '-');
    // Replace decimal comma with decimal point
    cleaned = cleaned.replace(/,/g, '.');

    // Support simple rational fractions like -1/2 or 3/4
    if (/^[+-]?\d+(\.\d+)?\/[+-]?\d+(\.\d+)?$/.test(cleaned)) {
      const parts = cleaned.split('/');
      const num = Number(parts[0]);
      const den = Number(parts[1]);
      if (den === 0 || Number.isNaN(num) || Number.isNaN(den)) {
        return { valid: false, reason: 'Division by zero is undefined.' };
      }
      return { valid: true, value: num / den };
    }

    // Standard decimal or scientific notation (e.g., -0.5, 1.4e-2)
    if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(cleaned)) {
      return {
        valid: false,
        reason:
          'Malformed number format. Use digits, a decimal point or comma (e.g. -0.5 or -0,5), scientific notation (1.5e-2), or a fraction (1/2).'
      };
    }

    const val = Number(cleaned);
    if (!Number.isFinite(val)) {
      return { valid: false, reason: 'Invalid numerical value.' };
    }
    return { valid: true, value: val };
  }

  // ==========================================================================
  // 5. Spaced Repetition Scheduling Engine
  // ==========================================================================
  function recordObjectiveAttempt(question, isCorrect, usedHint) {
    const card = getCardState(question.id);
    const now = Date.now();
    const todayStr = new Date(now).toISOString().slice(0, 10);

    card.attempts += 1;
    card.lastReviewedAt = now;

    if (usedHint) {
      card.hintsUsed += 1;
    }

    if (isCorrect && !usedHint) {
      card.independentCorrect += 1;
      card.streak += 1;
      if (!card.distinctReviewDays.includes(todayStr)) {
        card.distinctReviewDays.push(todayStr);
      }

      // Interval progression: 1d -> 3d -> 7d -> 14d...
      if (card.streak === 1) {
        card.intervalDays = 1;
      } else if (card.streak === 2) {
        card.intervalDays = 3;
      } else {
        card.intervalDays = Math.round(card.intervalDays * card.easeFactor);
      }
      card.easeFactor = Math.min(2.8, card.easeFactor + 0.08);
      card.nextReviewAt = now + card.intervalDays * 24 * 60 * 60 * 1000;
    } else if (isCorrect && usedHint) {
      // Assisted correct: does NOT increment independent streak or independent mastery
      card.assistedCorrect += 1;
      card.intervalDays = 0.5; // Review again in 12 hours
      card.nextReviewAt = now + 12 * 60 * 60 * 1000;
    } else {
      // Incorrect answer: reset streak and schedule immediate review (10 minutes)
      card.misses += 1;
      card.streak = 0;
      card.intervalDays = 0;
      card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
      card.nextReviewAt = now + 10 * 60 * 1000;
    }

    card.masteryStatus = computeMasteryStatus(card, question.format);
    saveLocalProgress();
    syncWithCloud(false);
    return card;
  }

  function recordFlashcardSelfRating(question, rating) {
    const card = getCardState(question.id);
    const now = Date.now();
    card.lastReviewedAt = now;
    card.lastSelfRating = rating;

    if (card.selfRatings[rating] !== undefined) {
      card.selfRatings[rating] += 1;
    }

    if (rating === 'again') {
      card.intervalDays = 0;
      card.nextReviewAt = now + 10 * 60 * 1000; // 10 minutes
    } else if (rating === 'hard') {
      card.intervalDays = 1;
      card.nextReviewAt = now + 24 * 60 * 60 * 1000; // 1 day
    } else if (rating === 'good') {
      card.intervalDays = Math.max(3, Math.round((card.intervalDays || 1) * 2));
      card.nextReviewAt = now + card.intervalDays * 24 * 60 * 60 * 1000;
    } else if (rating === 'easy') {
      card.intervalDays = Math.max(5, Math.round((card.intervalDays || 2) * 2.5));
      card.nextReviewAt = now + card.intervalDays * 24 * 60 * 60 * 1000;
    }

    card.masteryStatus = computeMasteryStatus(card, 'flashcard');
    saveLocalProgress();
    syncWithCloud(false);
    return card;
  }

  // ==========================================================================
  // 6. Dashboard & Topic Progress UI Rendering
  // ==========================================================================
  function getDefaultPracticeBank() {
    return QUESTIONS.filter((q) => !q.isMockExam);
  }

  function getDueQuestions() {
    const now = Date.now();
    return getDefaultPracticeBank().filter((q) => {
      const c = userProgress.cards[q.id];
      return c && c.nextReviewAt && c.nextReviewAt <= now;
    });
  }

  function getMissedOrWeakQuestions() {
    return getDefaultPracticeBank().filter((q) => {
      const c = userProgress.cards[q.id];
      if (!c) return false;
      return (
        c.misses > 0 &&
        (c.streak < 2 || c.masteryStatus === 'learning')
      ) || (c.hintsUsed > 0 && c.independentCorrect === 0);
    });
  }

  function computeBlockRYG(blockId) {
    const blockQs = getDefaultPracticeBank().filter((q) => q.block === blockId);
    let attempted = 0;
    let mastered = 0;
    let reviewing = 0;
    let misses = 0;

    blockQs.forEach((q) => {
      const c = userProgress.cards[q.id];
      if (c && (c.attempts > 0 || c.lastSelfRating)) {
        attempted++;
        if (c.masteryStatus === 'mastered') mastered++;
        else if (c.masteryStatus === 'reviewing') reviewing++;
        if (c.misses > 0 && c.streak === 0) misses++;
      }
    });

    if (attempted === 0) {
      return { label: 'Unassessed', cls: 'ryg-unassessed', attempted, mastered, total: blockQs.length };
    }
    if (mastered >= Math.ceil(blockQs.length * 0.5) && misses === 0) {
      return { label: 'Green (Usable)', cls: 'ryg-green', attempted, mastered, total: blockQs.length };
    }
    if (reviewing + mastered >= 2 && misses <= Math.floor(attempted * 0.5)) {
      return { label: 'Yellow (Assisted/Developing)', cls: 'ryg-yellow', attempted, mastered, total: blockQs.length };
    }
    return { label: 'Red (Needs Foundation Work)', cls: 'ryg-red', attempted, mastered, total: blockQs.length };
  }

  function refreshDashboardUI() {
    if (!userProgress) return;

    const mainBank = getDefaultPracticeBank();
    const mockBank = QUESTIONS.filter((q) => q.isMockExam);
    const dueQs = getDueQuestions();
    const missedQs = getMissedOrWeakQuestions();

    // Update countdown badge
    const examDate = new Date('2026-10-29T08:00:00+01:00');
    const daysLeft = Math.max(0, Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24)));
    document.getElementById('exam-countdown-badge').textContent =
      daysLeft > 0 ? `Exam: 29 Oct (${daysLeft}d left)` : 'Exam: 29 Oct';

    document.getElementById('active-profile-pill').textContent = `👤 ${currentProfile}`;
    document.getElementById('bank-summary-line').textContent =
      `${mainBank.length} core practice questions + ${mockBank.length} reserved mock exam tasks (${QUESTIONS.length} total verified)`;

    // Resumable session banner
    const resumeCard = document.getElementById('resume-session-card');
    const sess = userProgress.activeSession;
    if (sess && sess.questionIds && sess.currentIndex < sess.questionIds.length) {
      resumeCard.classList.remove('hidden');
      document.getElementById('resume-session-title').textContent =
        sess.title || 'Continue Studying';
      document.getElementById('resume-session-meta').textContent =
        `Question ${sess.currentIndex + 1} of ${sess.questionIds.length} • ${sess.subtitle || 'Saved Session'}`;
    } else {
      resumeCard.classList.add('hidden');
    }

    // Due count
    document.getElementById('stat-due-count').textContent = dueQs.length;
    document.getElementById('stat-due-desc').textContent =
      dueQs.length > 0
        ? `${dueQs.length} spaced-review card(s) due right now`
        : 'All caught up! Start a fresh practice block below.';

    // Diagnostic D1 card status
    const d1Card = userProgress.cards['b1-001'];
    const d1Badge = document.getElementById('stat-d1-badge');
    const d1Desc = document.getElementById('stat-next-task-desc');
    if (!d1Card || d1Card.attempts === 0) {
      d1Badge.textContent = 'Start D1';
      setHtmlAndMath(d1Desc, 'Diagnostic D1: Regressors $\\varphi(t)$, dimensions &amp; $\\theta$ setup');
    } else {
      d1Badge.textContent = 'Continue Roadmap';
      setHtmlAndMath(d1Desc, 'D1 completed! Continue Block 1–8 adaptive foundation sequence');
    }

    // Mastery counts
    let cMastered = 0;
    let cReviewing = 0;
    let cLearning = 0;
    let cUnseen = 0;

    mainBank.forEach((q) => {
      const c = userProgress.cards[q.id];
      const st = c ? computeMasteryStatus(c, q.format) : 'unseen';
      if (st === 'mastered') cMastered++;
      else if (st === 'reviewing') cReviewing++;
      else if (st === 'learning') cLearning++;
      else cUnseen++;
    });

    const totalMain = Math.max(1, mainBank.length);
    document.getElementById('bar-mastered').style.width = `${(cMastered / totalMain) * 100}%`;
    document.getElementById('bar-reviewing').style.width = `${(cReviewing / totalMain) * 100}%`;
    document.getElementById('bar-learning').style.width = `${(cLearning / totalMain) * 100}%`;

    document.getElementById('count-mastered').textContent = cMastered;
    document.getElementById('count-reviewing').textContent = cReviewing;
    document.getElementById('count-missed').textContent = cLearning;
    document.getElementById('count-unseen').textContent = cUnseen;

    // Update mode subtitles
    document.getElementById('mode-missed-sub').textContent =
      `${missedQs.length} weak/missed question(s) queued`;
    const bookmarkedCount = Object.keys(userProgress.bookmarks || {}).filter(
      (k) => userProgress.bookmarks[k]
    ).length;
    const flaggedCount = Object.keys(userProgress.flags || {}).filter(
      (k) => userProgress.flags[k]
    ).length;
    document.getElementById('mode-bookmarked-sub').textContent =
      `${bookmarkedCount} bookmarked • ${flaggedCount} flagged`;

    // Topic progress list
    const topicListEl = document.getElementById('topic-progress-list');
    topicListEl.innerHTML = '';

    COURSE_BLOCKS.forEach((blk) => {
      const ryg = computeBlockRYG(blk.id);
      const pct = ryg.total > 0 ? Math.round((ryg.mastered / ryg.total) * 100) : 0;
      const row = document.createElement('div');
      row.className = 'topic-row';
      row.innerHTML = `
        <div class="topic-row-top">
          <span class="topic-row-title">${blk.code}: ${blk.title}</span>
          <span class="ryg-badge ${ryg.cls}">${ryg.label}</span>
        </div>
        <div class="session-mini-bar">
          <div class="session-mini-fill" style="width: ${pct}%"></div>
        </div>
        <div class="topic-row-meta">
          <span>Attempted: ${ryg.attempted} / ${ryg.total}</span>
          <span>Mastered: ${ryg.mastered} (${pct}%)</span>
        </div>
      `;
      row.addEventListener('click', () => {
        startTopicSession(blk.id);
      });
      topicListEl.appendChild(row);
    });
  }

  // ==========================================================================
  // 7. Practice Setup & Filtering Engine
  // ==========================================================================
  function initPracticeSetupUI() {
    const grid = document.getElementById('setup-topics-grid');
    grid.innerHTML = '';
    COURSE_BLOCKS.forEach((blk) => {
      const count = getDefaultPracticeBank().filter((q) => q.block === blk.id).length;
      const label = document.createElement('label');
      label.className = 'topic-check-item';
      label.innerHTML = `
        <input type="checkbox" class="setup-topic-cb" value="${blk.id}" checked />
        <span><strong>${blk.code}:</strong> ${blk.title} (${count})</span>
      `;
      label.querySelector('input').addEventListener('change', updateSetupMatchCount);
      grid.appendChild(label);
    });
    updateSetupMatchCount();
  }

  function getConfiguredCandidateQuestions() {
    const activeModeBtn = document.querySelector('#setup-mode-pills .pill-btn.active');
    const mode = activeModeBtn ? activeModeBtn.dataset.val : 'mixed';

    const selectedTopics = Array.from(document.querySelectorAll('.setup-topic-cb:checked')).map(
      (cb) => cb.value
    );
    const selectedFormats = Array.from(
      document.querySelectorAll('#setup-format-pills .pill-btn.active')
    ).map((b) => b.dataset.val);
    const selectedDiffs = Array.from(
      document.querySelectorAll('#setup-difficulty-pills .pill-btn.active')
    ).map((b) => b.dataset.val);
    const selectedOrigins = Array.from(
      document.querySelectorAll('#setup-origin-pills .pill-btn.active')
    ).map((b) => b.dataset.val);

    let pool = getDefaultPracticeBank();

    if (mode === 'due') {
      pool = getDueQuestions();
    } else if (mode === 'missed') {
      pool = getMissedOrWeakQuestions();
    } else if (mode === 'flashcards') {
      pool = pool.filter((q) => q.format === 'flashcard');
    } else if (mode === 'bookmarked') {
      pool = pool.filter(
        (q) =>
          (userProgress.bookmarks && userProgress.bookmarks[q.id]) ||
          (userProgress.flags && userProgress.flags[q.id])
      );
    }

    pool = pool.filter(
      (q) =>
        selectedTopics.includes(q.block) &&
        selectedFormats.includes(q.format) &&
        selectedDiffs.includes(q.difficulty) &&
        selectedOrigins.includes(q.origin)
    );

    return pool;
  }

  function updateSetupMatchCount() {
    const matches = getConfiguredCandidateQuestions();
    document.getElementById('setup-match-count').textContent =
      `Matching questions: ${matches.length}`;
    document.getElementById('btn-launch-configured').disabled = matches.length === 0;
  }

  // Prioritize due, weak/missed, and unseen questions before already mastered ones
  function sortAndSelectQuestions(pool, limit) {
    const now = Date.now();
    const scored = pool.map((q) => {
      const c = userProgress.cards[q.id];
      let priority = 50;
      if (q.id === 'b1-001' && (!c || c.attempts === 0)) {
        priority = 1000; // Always put Diagnostic D1 first if unattempted in Block 1
      } else if (c && c.nextReviewAt && c.nextReviewAt <= now) {
        priority = 500 - Math.min(100, c.streak * 20);
      } else if (c && c.masteryStatus === 'learning') {
        priority = 400;
      } else if (!c || c.attempts === 0) {
        priority = 300;
      } else if (c.masteryStatus === 'reviewing') {
        priority = 200;
      } else {
        priority = 50;
      }
      // Small random jitter within tier
      priority += Math.random() * 25;
      return { q, priority };
    });

    scored.sort((a, b) => b.priority - a.priority);
    const sorted = scored.map((item) => item.q);
    if (limit && limit > 0 && sorted.length > limit) {
      return sorted.slice(0, limit);
    }
    return sorted;
  }

  // ==========================================================================
  // 8. Starting & Resuming Study Sessions
  // ==========================================================================
  function launchSession(questionsList, title, subtitle) {
    if (!questionsList || questionsList.length === 0) {
      alert('No questions match this selection yet. Try broadening your filters!');
      return;
    }

    userProgress.activeSession = {
      id: 'sess_' + Date.now(),
      title: title || 'Practice Session',
      subtitle: subtitle || `${questionsList.length} Questions`,
      questionIds: questionsList.map((q) => q.id),
      currentIndex: 0,
      results: [] // { id, outcome: 'independent'|'assisted'|'wrong'|'flashcard', rating }
    };

    saveLocalProgress();
    syncWithCloud(false);
    switchView('view-session');
    renderActiveSessionQuestion();
  }

  function startTopicSession(blockId) {
    const blk = COURSE_BLOCKS.find((b) => b.id === blockId);
    const pool = getDefaultPracticeBank().filter((q) => q.block === blockId);
    const selected = sortAndSelectQuestions(pool, 10);
    launchSession(selected, `${blk.code}: ${blk.title}`, 'Focused Topic Session (10 Questions)');
  }

  function startMockExamSession(mockExamId) {
    const pool = QUESTIONS.filter((q) => q.isMockExam && q.mockExamId === mockExamId);
    if (pool.length === 0) {
      alert('Mock exam questions are still loading.');
      return;
    }
    const confirmed = confirm(
      `Launch Reserved Mock Exam (${mockExamId})?\n\nThis set contains ${pool.length} official exam subparts held out from normal practice so you can test yourself under realistic exam conditions.`
    );
    if (!confirmed) return;
    launchSession(pool, `Mock Exam: ${mockExamId}`, `Untimed Exam Rehearsal (${pool.length} Tasks)`);
  }

  // ==========================================================================
  // 9. Rendering Active Question & Grading Submissions
  // ==========================================================================
  function renderActiveSessionQuestion() {
    const sess = userProgress.activeSession;
    if (!sess || sess.currentIndex >= sess.questionIds.length) {
      renderSessionSummary();
      return;
    }

    const qId = sess.questionIds[sess.currentIndex];
    currentQuestion = QUESTIONS.find((q) => q.id === qId);
    if (!currentQuestion) {
      sess.currentIndex += 1;
      renderActiveSessionQuestion();
      return;
    }

    // Reset per-question interaction flags
    selectedTfValue = null;
    selectedMcqIndex = null;
    hintUsedOnCurrent = false;
    answerSubmittedOnCurrent = false;

    // Progress bar & header
    const total = sess.questionIds.length;
    const idx = sess.currentIndex + 1;
    document.getElementById('session-step-counter').textContent = `${idx} / ${total}`;
    document.getElementById('session-mini-fill').style.width = `${(idx / total) * 100}%`;

    // Bookmark & Flag button states
    const bmBtn = document.getElementById('btn-bookmark-card');
    const flagBtn = document.getElementById('btn-flag-card');
    bmBtn.classList.toggle('active-bookmark', !!(userProgress.bookmarks && userProgress.bookmarks[qId]));
    flagBtn.classList.toggle('active-flag', !!(userProgress.flags && userProgress.flags[qId]));
    document.getElementById('q-flag-drawer').classList.add('hidden');
    document.getElementById('flag-reason-input').value =
      (userProgress.flags && userProgress.flags[qId]) || '';

    // Metadata badges
    const blk = COURSE_BLOCKS.find((b) => b.id === currentQuestion.block);
    document.getElementById('q-topic-badge').textContent = blk ? blk.code : currentQuestion.block;
    const formatNames = {
      tf: 'True / False',
      mcq: 'Multiple Choice',
      numeric: 'Numeric',
      flashcard: 'Flashcard Recall'
    };
    document.getElementById('q-format-badge').textContent =
      formatNames[currentQuestion.format] || currentQuestion.format;
    document.getElementById('q-diff-badge').textContent =
      currentQuestion.difficulty.toUpperCase();
    document.getElementById('q-origin-badge').textContent =
      currentQuestion.isMockExam
        ? `Mock Exam (${currentQuestion.mockExamId})`
        : currentQuestion.origin === 'adapted'
        ? 'Adapted Source Task'
        : 'Practice Variant';
    document.getElementById('q-id-badge').textContent = currentQuestion.id;
    document.getElementById('q-subtopic-line').textContent =
      `${currentQuestion.topic} • ${currentQuestion.subtopic || ''}`;

    // Prompt
    setHtmlAndMath(document.getElementById('q-prompt-box'), currentQuestion.prompt);

    // Numeric metadata (units / rounding)
    const numMeta = document.getElementById('q-numeric-meta');
    if (currentQuestion.format === 'numeric') {
      numMeta.classList.remove('hidden');
      document.getElementById('q-unit-display').textContent =
        `Unit: ${currentQuestion.unit || 'dimensionless'}`;
      document.getElementById('q-rounding-display').textContent =
        `• ${currentQuestion.roundingNote || `Tolerance: ±${currentQuestion.tolerance || 0.01}`}`;
    } else {
      numMeta.classList.add('hidden');
    }

    // Hint box
    const hintBtn = document.getElementById('btn-show-hint');
    const hintBox = document.getElementById('q-hint-box');
    hintBox.classList.add('hidden');
    hintBtn.disabled = false;
    hintBtn.textContent = '💡 Show Hint (Recorded as assisted attempt)';
    setHtmlAndMath(hintBox, currentQuestion.hint || 'Check the dimensions and definitions carefully.');

    // Hide all input areas first
    document.getElementById('input-area-tf').classList.add('hidden');
    document.getElementById('input-area-mcq').classList.add('hidden');
    document.getElementById('input-area-numeric').classList.add('hidden');
    document.getElementById('input-area-flashcard').classList.add('hidden');
    document.getElementById('q-feedback-panel').classList.add('hidden');

    // Configure specific input area
    if (currentQuestion.format === 'tf') {
      const tfArea = document.getElementById('input-area-tf');
      tfArea.classList.remove('hidden');
      document.querySelectorAll('.tf-btn').forEach((b) => {
        b.className = 'tf-btn';
        b.disabled = false;
      });
      document.getElementById('btn-submit-tf').disabled = true;
      document.getElementById('btn-submit-tf').classList.remove('hidden');
    } else if (currentQuestion.format === 'mcq') {
      const mcqArea = document.getElementById('input-area-mcq');
      mcqArea.classList.remove('hidden');
      const list = document.getElementById('mcq-options-list');
      list.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      (currentQuestion.options || []).forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mcq-option-btn';
        btn.innerHTML = `
          <span class="mcq-option-letter">${letters[idx] || idx + 1}</span>
          <div class="mcq-option-content"></div>
        `;
        setHtmlAndMath(btn.querySelector('.mcq-option-content'), optText);
        btn.addEventListener('click', () => {
          if (answerSubmittedOnCurrent) return;
          selectedMcqIndex = idx;
          document.querySelectorAll('.mcq-option-btn').forEach((el, i) => {
            el.classList.toggle('selected', i === idx);
          });
          document.getElementById('btn-submit-mcq').disabled = false;
        });
        list.appendChild(btn);
      });
      document.getElementById('btn-submit-mcq').disabled = true;
      document.getElementById('btn-submit-mcq').classList.remove('hidden');
    } else if (currentQuestion.format === 'numeric') {
      const numArea = document.getElementById('input-area-numeric');
      numArea.classList.remove('hidden');
      const numInput = document.getElementById('numeric-answer-input');
      numInput.value = '';
      numInput.disabled = false;
      const unitAddon = document.getElementById('numeric-unit-addon');
      const hasUnit =
        currentQuestion.unit &&
        currentQuestion.unit.trim() !== '' &&
        currentQuestion.unit.trim().toLowerCase() !== 'dimensionless';
      unitAddon.textContent = hasUnit ? currentQuestion.unit : '';
      unitAddon.classList.toggle('hidden', !hasUnit);
      document.getElementById('numeric-validation-msg').classList.add('hidden');
      document.getElementById('btn-submit-numeric').disabled = false;
      document.getElementById('btn-submit-numeric').classList.remove('hidden');
    } else if (currentQuestion.format === 'flashcard') {
      const fcArea = document.getElementById('input-area-flashcard');
      fcArea.classList.remove('hidden');
      const scratch = document.getElementById('flashcard-scratch');
      scratch.value = '';
      scratch.disabled = false;
      document.getElementById('btn-reveal-flashcard').classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function displayFeedbackPanel(isCorrect, subtitleText) {
    answerSubmittedOnCurrent = true;
    const q = currentQuestion;
    const panel = document.getElementById('q-feedback-panel');
    panel.classList.remove('hidden');

    const banner = document.getElementById('q-feedback-banner');
    const icon = document.getElementById('q-feedback-icon');
    const title = document.getElementById('q-feedback-title');
    const subtitle = document.getElementById('q-feedback-subtitle');

    banner.className = 'feedback-banner';
    if (q.format === 'flashcard') {
      banner.classList.add('fb-flashcard');
      icon.textContent = '🗂️';
      title.textContent = 'Compare Your Recall Below';
      subtitle.textContent = 'Check your equations, dimensions, and assumptions before rating yourself.';
    } else if (isCorrect && !hintUsedOnCurrent) {
      banner.classList.add('fb-correct');
      icon.textContent = '✅';
      title.textContent = 'Correct (Independent)!';
      subtitle.textContent = subtitleText || 'Unassisted correct answer recorded toward mastery.';
    } else if (isCorrect && hintUsedOnCurrent) {
      banner.classList.add('fb-assisted');
      icon.textContent = '💡';
      title.textContent = 'Correct (Hint-Assisted)';
      subtitle.textContent =
        'Recorded separately from independent competence. Scheduled for follow-up review in 12h.';
    } else {
      banner.classList.add('fb-wrong');
      icon.textContent = '❌';
      title.textContent = 'Not Quite — Let’s Review the Step';
      subtitle.textContent = subtitleText || 'Scheduled for spaced review in 10 minutes.';
    }

    // Corrected statement for False T/F questions
    const corrBox = document.getElementById('q-corrected-box');
    if (q.format === 'tf' && q.correctAnswer === false && q.correctedStatement) {
      corrBox.classList.remove('hidden');
      setHtmlAndMath(document.getElementById('q-corrected-content'), q.correctedStatement);
    } else {
      corrBox.classList.add('hidden');
    }

    // Flashcard target answer box
    const fcBox = document.getElementById('q-flashcard-answer-box');
    if (q.format === 'flashcard') {
      fcBox.classList.remove('hidden');
      setHtmlAndMath(document.getElementById('q-flashcard-answer-content'), q.correctAnswer);
    } else {
      fcBox.classList.add('hidden');
    }

    // Main explanation
    setHtmlAndMath(document.getElementById('q-explanation-content'), q.explanation);

    // MCQ Distractors breakdown
    const distBox = document.getElementById('q-distractors-box');
    const distList = document.getElementById('q-distractors-list');
    if (q.format === 'mcq' && Array.isArray(q.distractorExplanations)) {
      distBox.classList.remove('hidden');
      distList.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      q.distractorExplanations.forEach((exp, idx) => {
        const li = document.createElement('li');
        const prefix = idx === q.correctAnswer ? `<strong>Option ${letters[idx]} (Correct):</strong> ` : `<strong>Option ${letters[idx]}:</strong> `;
        setHtmlAndMath(li, prefix + exp);
        distList.appendChild(li);
      });
    } else {
      distBox.classList.add('hidden');
    }

    // Source citation & mastery status pill
    const src = q.source || {};
    document.getElementById('q-source-citation').textContent =
      `📄 Source: ${src.file || 'Course Material'}${src.page ? `, p. ${src.page}` : ''}${src.question ? ` (${src.question})` : ''}`;

    const cState = getCardState(q.id);
    document.getElementById('q-mastery-status-pill').textContent =
      `Card Status: ${cState.masteryStatus.toUpperCase()} (Streak: ${cState.streak})`;

    // Toggle next vs flashcard self-rating controls
    if (q.format === 'flashcard') {
      document.getElementById('next-controls-objective').classList.add('hidden');
      document.getElementById('next-controls-flashcard').classList.remove('hidden');
    } else {
      document.getElementById('next-controls-objective').classList.remove('hidden');
      document.getElementById('next-controls-flashcard').classList.add('hidden');
    }
  }

  function advanceToNextQuestion() {
    const sess = userProgress.activeSession;
    if (!sess) return;
    sess.currentIndex += 1;
    saveLocalProgress();
    syncWithCloud(false);

    if (sess.currentIndex >= sess.questionIds.length) {
      renderSessionSummary();
    } else {
      renderActiveSessionQuestion();
    }
  }

  function renderSessionSummary() {
    const sess = userProgress.activeSession;
    if (!sess) {
      switchView('view-dashboard');
      return;
    }

    let cIndep = 0;
    let cAssist = 0;
    let cWrong = 0;
    let cFlash = 0;
    const missedIds = [];

    (sess.results || []).forEach((r) => {
      if (r.outcome === 'independent') cIndep++;
      else if (r.outcome === 'assisted') {
        cAssist++;
        missedIds.push(r.id);
      } else if (r.outcome === 'wrong') {
        cWrong++;
        missedIds.push(r.id);
      } else if (r.outcome === 'flashcard') {
        cFlash++;
        if (r.rating === 'again' || r.rating === 'hard') {
          missedIds.push(r.id);
        }
      }
    });

    document.getElementById('summary-title').textContent = sess.title || 'Session Complete';
    document.getElementById('summary-subtitle').textContent =
      `Completed ${sess.questionIds.length} question(s) • Progress synced & saved`;
    document.getElementById('sum-independent-correct').textContent = cIndep;
    document.getElementById('sum-assisted-correct').textContent = cAssist;
    document.getElementById('sum-incorrect').textContent = cWrong;
    document.getElementById('sum-flashcards').textContent = cFlash;

    const listEl = document.getElementById('summary-questions-list');
    listEl.innerHTML = '';
    (sess.results || []).forEach((r) => {
      const q = QUESTIONS.find((item) => item.id === r.id);
      if (!q) return;
      const div = document.createElement('div');
      div.className = 'summary-q-item';
      const badgeMap = {
        independent: '✅ Independent',
        assisted: '💡 Assisted',
        wrong: '❌ Missed',
        flashcard: `🗂️ Rated: ${(r.rating || '').toUpperCase()}`
      };
      div.innerHTML = `
        <span><strong>${q.id}</strong> — ${q.subtopic || q.topic}</span>
        <span>${badgeMap[r.outcome] || r.outcome}</span>
      `;
      listEl.appendChild(div);
    });

    const retryBtn = document.getElementById('btn-retry-missed');
    if (missedIds.length > 0) {
      retryBtn.classList.remove('hidden');
      retryBtn.onclick = () => {
        const retryQs = missedIds
          .map((id) => QUESTIONS.find((q) => q.id === id))
          .filter(Boolean);
        launchSession(retryQs, 'Targeted Correction Session', `${retryQs.length} Missed/Assisted Questions`);
      };
    } else {
      retryBtn.classList.add('hidden');
    }

    // Clear completed activeSession so dashboard doesn't show "Resume"
    userProgress.sessionHistory.push({
      completedAt: Date.now(),
      title: sess.title,
      total: sess.questionIds.length,
      independentCorrect: cIndep,
      assistedCorrect: cAssist,
      wrong: cWrong,
      flashcards: cFlash
    });
    userProgress.activeSession = null;
    saveLocalProgress();
    syncWithCloud(false);

    switchView('view-summary');
  }

  // ==========================================================================
  // 10. Roadmap & Reference View Rendering
  // ==========================================================================
  function renderRoadmapAndFormulas() {
    const rmContainer = document.getElementById('roadmap-blocks-container');
    rmContainer.innerHTML = '';

    COURSE_BLOCKS.forEach((blk) => {
      const ryg = computeBlockRYG(blk.id);
      const div = document.createElement('div');
      div.className = 'roadmap-item';
      div.innerHTML = `
        <div class="topic-row-top">
          <h3>${blk.code}: ${blk.title}</h3>
          <span class="ryg-badge ${ryg.cls}">${ryg.label}</span>
        </div>
        <div class="roadmap-meta">
          <strong>Budget:</strong> ${blk.hours} • <strong>Prereq:</strong> ${blk.prereq}<br/>
          <strong>Primary Sources:</strong> ${blk.sources}
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.65rem;">${blk.outcome}</p>
        <button type="button" class="btn btn-secondary btn-sm">Practice ${blk.code} (${ryg.mastered}/${ryg.total} Mastered) →</button>
      `;
      div.querySelector('button').addEventListener('click', () => startTopicSession(blk.id));
      rmContainer.appendChild(div);
    });

    const fmContainer = document.getElementById('formula-reference-container');
    fmContainer.innerHTML = '';
    FORMULA_REFERENCE.forEach((fm) => {
      const div = document.createElement('div');
      div.className = 'formula-item';
      div.innerHTML = `
        <h3>${fm.title}</h3>
        <div class="formula-math"></div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;"><strong>Caution / Assumption:</strong> ${fm.caution}</p>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.35rem;">📄 Source: ${fm.source}</div>
      `;
      setHtmlAndMath(div.querySelector('.formula-math'), fm.math);
      fmContainer.appendChild(div);
    });

    // Populate copyable Resume Note
    const resumeNoteEl = document.getElementById('resume-note-textarea');
    if (resumeNoteEl && userProgress) {
      const today = new Date().toISOString().slice(0, 10);
      const blockLines = COURSE_BLOCKS.map((blk) => {
        const ryg = computeBlockRYG(blk.id);
        return `- ${blk.code} (${blk.title}): ${ryg.label} [Attempted: ${ryg.attempted}/${ryg.total}, Mastered: ${ryg.mastered}]`;
      }).join('\n');

      const weakQs = getMissedOrWeakQuestions()
        .slice(0, 6)
        .map((q) => `${q.id} (${q.subtopic || q.topic})`)
        .join(', ');

      const d1State = userProgress.cards['b1-001'];
      const nextPriority =
        !d1State || d1State.attempts === 0
          ? 'Diagnostic D1 (b1-001: Regressors φ(t) & dimensions in Block 1)'
          : weakQs
          ? `Review weak/assisted tasks: ${weakQs}`
          : 'Continue next unassessed block in Roadmap (Blocks 1 -> 8)';

      resumeNoteEl.value = [
        `## Session Close & Resume Note (${today})`,
        `Profile: ${currentProfile} | Exam: 29 October 2026 (1RT885 System Identification)`,
        ``,
        `### Topic Progress (Red / Yellow / Green):`,
        blockLines,
        ``,
        `### Unresolved / Needs Work:`,
        weakQs || 'No active missed cards.',
        ``,
        `### Exact Next Task:`,
        nextPriority
      ].join('\n');
    }

    const copyBtn = document.getElementById('btn-copy-resume-note');
    if (copyBtn && resumeNoteEl) {
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(resumeNoteEl.value);
          copyBtn.textContent = '✅ Copied Resume Note!';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy Resume Note to Clipboard';
          }, 2000);
        } catch (err) {
          resumeNoteEl.select();
          document.execCommand('copy');
          copyBtn.textContent = '✅ Copied!';
        }
      };
    }
  }

  // ==========================================================================
  // 11. View Navigation & Event Listeners
  // ==========================================================================
  function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.toggle('active', sec.id === viewId);
    });
    document.querySelectorAll('.nav-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.target === viewId);
    });
    if (viewId === 'view-dashboard') {
      refreshDashboardUI();
    } else if (viewId === 'view-practice-setup') {
      updateSetupMatchCount();
    } else if (viewId === 'view-roadmap') {
      renderRoadmapAndFormulas();
    } else if (viewId === 'view-settings') {
      document.getElementById('set-profile-input').value = currentProfile;
      document.getElementById('set-gh-token-input').value = getStoredGhToken();
      document.getElementById('set-pin-input').value =
        localStorage.getItem(getPinKey(currentProfile)) || '1885';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function refreshAllViews() {
    refreshDashboardUI();
    updateSetupMatchCount();
    renderRoadmapAndFormulas();
  }

  function bindAllEvents() {
    // Bottom nav tabs
    document.querySelectorAll('.nav-tab').forEach((tab) => {
      tab.addEventListener('click', () => switchView(tab.dataset.target));
    });

    // Top bar brand & sync pill
    document.getElementById('nav-home-trigger').addEventListener('click', () => {
      switchView('view-dashboard');
    });
    document.getElementById('sync-status-btn').addEventListener('click', () => {
      switchView('view-settings');
    });

    // Theme toggle
    const savedTheme = localStorage.getItem('sysid_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
      const curr = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = curr === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sysid_theme', next);
      document.getElementById('theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
    });

    // Dashboard entry cards
    document.getElementById('btn-continue-session').addEventListener('click', () => {
      switchView('view-session');
      renderActiveSessionQuestion();
    });

    document.getElementById('btn-discard-session').addEventListener('click', () => {
      if (confirm('Discard current in-progress session? (Your answered cards remain saved.)')) {
        userProgress.activeSession = null;
        saveLocalProgress();
        refreshDashboardUI();
      }
    });

    document.getElementById('card-review-due').addEventListener('click', () => {
      const due = getDueQuestions();
      if (due.length > 0) {
        launchSession(sortAndSelectQuestions(due, 15), 'Spaced Repetition Review', `${due.length} Due Cards`);
      } else {
        const fallback = sortAndSelectQuestions(getDefaultPracticeBank(), 10);
        launchSession(fallback, 'Mixed Spaced Practice', '10 Adaptive Questions');
      }
    });

    document.getElementById('card-start-d1').addEventListener('click', () => {
      startTopicSession('block1');
    });

    // Quick Study Mode buttons on Dashboard
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === 'mixed') {
          const qs = sortAndSelectQuestions(getDefaultPracticeBank(), 10);
          launchSession(qs, 'Mixed Practice', '10 Adaptive Questions across Blocks 1–8');
        } else if (mode === 'missed') {
          const weak = getMissedOrWeakQuestions();
          if (weak.length === 0) {
            alert('You have no missed or weak questions right now! Launching Mixed Practice instead.');
            launchSession(sortAndSelectQuestions(getDefaultPracticeBank(), 10), 'Mixed Practice', '10 Questions');
          } else {
            launchSession(sortAndSelectQuestions(weak, 10), 'Missed & Weak Questions', `${weak.length} Targeted Questions`);
          }
        } else if (mode === 'flashcards') {
          const fcs = getDefaultPracticeBank().filter((q) => q.format === 'flashcard');
          launchSession(sortAndSelectQuestions(fcs, 10), 'Flashcard Active Recall', '10 Flashcards');
        } else if (mode === 'bookmarked') {
          const bms = getDefaultPracticeBank().filter(
            (q) =>
              (userProgress.bookmarks && userProgress.bookmarks[q.id]) ||
              (userProgress.flags && userProgress.flags[q.id])
          );
          if (bms.length === 0) {
            alert('No bookmarked or flagged questions yet! Tap 🔖 or 🚩 during any session to save cards here.');
          } else {
            launchSession(bms, 'Bookmarked & Flagged Review', `${bms.length} Saved Questions`);
          }
        }
      });
    });

    // Mock exam buttons
    document.getElementById('btn-start-mock-2025').addEventListener('click', () => {
      startMockExamSession('SI2025');
    });
    document.getElementById('btn-start-mock-2024').addEventListener('click', () => {
      startMockExamSession('HT2024');
    });

    // Practice Setup pill selectors
    document.querySelectorAll('#setup-mode-pills .pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#setup-mode-pills .pill-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        updateSetupMatchCount();
      });
    });

    document.querySelectorAll('#setup-length-pills .pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#setup-length-pills .pill-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.querySelectorAll('.multi-pill .pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        updateSetupMatchCount();
      });
    });

    document.getElementById('btn-toggle-all-topics').addEventListener('click', () => {
      const cbs = Array.from(document.querySelectorAll('.setup-topic-cb'));
      const allChecked = cbs.every((c) => c.checked);
      cbs.forEach((c) => {
        c.checked = !allChecked;
      });
      document.getElementById('btn-toggle-all-topics').textContent = allChecked
        ? 'Select All'
        : 'Deselect All';
      updateSetupMatchCount();
    });

    document.getElementById('btn-launch-configured').addEventListener('click', () => {
      const pool = getConfiguredCandidateQuestions();
      const lenBtn = document.querySelector('#setup-length-pills .pill-btn.active');
      const limit = lenBtn ? parseInt(lenBtn.dataset.val, 10) : 10;
      const selected = sortAndSelectQuestions(pool, limit);
      launchSession(
        selected,
        'Custom Practice Session',
        limit === 0 ? `Untimed (${selected.length} Questions)` : `${selected.length} Questions`
      );
    });

    // Session Header Tools
    document.getElementById('btn-exit-session').addEventListener('click', () => {
      saveLocalProgress();
      switchView('view-dashboard');
    });

    document.getElementById('btn-bookmark-card').addEventListener('click', () => {
      if (!currentQuestion) return;
      const id = currentQuestion.id;
      userProgress.bookmarks[id] = !userProgress.bookmarks[id];
      document
        .getElementById('btn-bookmark-card')
        .classList.toggle('active-bookmark', !!userProgress.bookmarks[id]);
      saveLocalProgress();
      syncWithCloud(false);
    });

    document.getElementById('btn-flag-card').addEventListener('click', () => {
      const drawer = document.getElementById('q-flag-drawer');
      drawer.classList.toggle('hidden');
    });

    document.getElementById('btn-save-flag').addEventListener('click', () => {
      if (!currentQuestion) return;
      const val = document.getElementById('flag-reason-input').value.trim();
      if (val) {
        userProgress.flags[currentQuestion.id] = val;
      } else {
        delete userProgress.flags[currentQuestion.id];
      }
      document
        .getElementById('btn-flag-card')
        .classList.toggle('active-flag', !!userProgress.flags[currentQuestion.id]);
      document.getElementById('q-flag-drawer').classList.add('hidden');
      saveLocalProgress();
      syncWithCloud(false);
    });

    // Hint Button
    document.getElementById('btn-show-hint').addEventListener('click', () => {
      hintUsedOnCurrent = true;
      document.getElementById('q-hint-box').classList.remove('hidden');
      document.getElementById('btn-show-hint').textContent = '💡 Hint Revealed (Assisted Mode)';
      document.getElementById('btn-show-hint').disabled = true;
    });

    // True / False Submission
    document.querySelectorAll('.tf-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answerSubmittedOnCurrent) return;
        selectedTfValue = btn.dataset.tf === 'true';
        document.querySelectorAll('.tf-btn').forEach((b) => {
          b.classList.toggle('selected', b === btn);
        });
        document.getElementById('btn-submit-tf').disabled = false;
      });
    });

    document.getElementById('btn-submit-tf').addEventListener('click', () => {
      if (answerSubmittedOnCurrent || selectedTfValue === null) return;
      const isCorrect = selectedTfValue === Boolean(currentQuestion.correctAnswer);
      document.querySelectorAll('.tf-btn').forEach((b) => {
        const val = b.dataset.tf === 'true';
        b.disabled = true;
        if (val === Boolean(currentQuestion.correctAnswer)) b.classList.add('correct-choice');
        else if (val === selectedTfValue && !isCorrect) b.classList.add('wrong-choice');
      });
      document.getElementById('btn-submit-tf').classList.add('hidden');

      recordObjectiveAttempt(currentQuestion, isCorrect, hintUsedOnCurrent);
      userProgress.activeSession.results.push({
        id: currentQuestion.id,
        outcome: isCorrect ? (hintUsedOnCurrent ? 'assisted' : 'independent') : 'wrong'
      });
      saveLocalProgress();
      displayFeedbackPanel(isCorrect);
    });

    // Multiple Choice Submission
    document.getElementById('btn-submit-mcq').addEventListener('click', () => {
      if (answerSubmittedOnCurrent || selectedMcqIndex === null) return;
      const isCorrect = selectedMcqIndex === Number(currentQuestion.correctAnswer);
      document.querySelectorAll('.mcq-option-btn').forEach((b, idx) => {
        b.disabled = true;
        if (idx === Number(currentQuestion.correctAnswer)) b.classList.add('correct-choice');
        else if (idx === selectedMcqIndex && !isCorrect) b.classList.add('wrong-choice');
      });
      document.getElementById('btn-submit-mcq').classList.add('hidden');

      recordObjectiveAttempt(currentQuestion, isCorrect, hintUsedOnCurrent);
      userProgress.activeSession.results.push({
        id: currentQuestion.id,
        outcome: isCorrect ? (hintUsedOnCurrent ? 'assisted' : 'independent') : 'wrong'
      });
      saveLocalProgress();
      displayFeedbackPanel(isCorrect);
    });

    // Numeric Submission
    document.getElementById('btn-submit-numeric').addEventListener('click', () => {
      if (answerSubmittedOnCurrent) return;
      const raw = document.getElementById('numeric-answer-input').value;
      const parsed = parseFlexibleNumeric(raw);
      const warnBox = document.getElementById('numeric-validation-msg');

      // Reject blank or malformed answers without counting them as conceptual mistakes!
      if (!parsed.valid) {
        warnBox.textContent = parsed.reason;
        warnBox.classList.remove('hidden');
        return;
      }
      warnBox.classList.add('hidden');

      const target = Number(currentQuestion.correctAnswer);
      const tol = currentQuestion.tolerance !== null && currentQuestion.tolerance !== undefined
        ? Number(currentQuestion.tolerance)
        : 0.01;
      const diff = Math.abs(parsed.value - target);
      const isCorrect = diff <= tol;

      document.getElementById('numeric-answer-input').disabled = true;
      document.getElementById('btn-submit-numeric').classList.add('hidden');

      recordObjectiveAttempt(currentQuestion, isCorrect, hintUsedOnCurrent);
      userProgress.activeSession.results.push({
        id: currentQuestion.id,
        outcome: isCorrect ? (hintUsedOnCurrent ? 'assisted' : 'independent') : 'wrong'
      });
      saveLocalProgress();

      const subMsg = isCorrect
        ? `Your value: ${parsed.value} (Target: ${target}, tolerance ±${tol})`
        : `Your value: ${parsed.value} • Expected: ${target} (±${tol})`;
      displayFeedbackPanel(isCorrect, subMsg);
    });

    // Allow Enter key in numeric input
    document.getElementById('numeric-answer-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!answerSubmittedOnCurrent) {
          document.getElementById('btn-submit-numeric').click();
        } else {
          document.getElementById('btn-next-question').click();
        }
      }
    });

    // Flashcard Reveal & Self-Rating
    document.getElementById('btn-reveal-flashcard').addEventListener('click', () => {
      document.getElementById('btn-reveal-flashcard').classList.add('hidden');
      document.getElementById('flashcard-scratch').disabled = true;
      displayFeedbackPanel(true);
    });

    document.querySelectorAll('.rate-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rating = btn.dataset.rating;
        recordFlashcardSelfRating(currentQuestion, rating);
        userProgress.activeSession.results.push({
          id: currentQuestion.id,
          outcome: 'flashcard',
          rating: rating
        });
        saveLocalProgress();
        advanceToNextQuestion();
      });
    });

    // Next Question Button
    document.getElementById('btn-next-question').addEventListener('click', () => {
      advanceToNextQuestion();
    });

    // Summary View Buttons
    document.getElementById('btn-summary-another').addEventListener('click', () => {
      switchView('view-practice-setup');
    });
    document.getElementById('btn-summary-home').addEventListener('click', () => {
      switchView('view-dashboard');
    });

    // Auth Gate Form
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const prof = document.getElementById('auth-profile').value.trim().toLowerCase() || 'robin';
      const pin = document.getElementById('auth-pin').value.trim();
      const ghTok = document.getElementById('auth-gh-token').value.trim();

      const expectedPin = localStorage.getItem(getPinKey(prof)) || '1885';
      const errBox = document.getElementById('auth-error');

      if (pin !== expectedPin) {
        errBox.textContent = 'Incorrect study passcode/PIN for this profile (default is 1885).';
        errBox.classList.remove('hidden');
        return;
      }

      errBox.classList.add('hidden');
      currentProfile = prof;
      localStorage.setItem('sysid_active_profile', currentProfile);
      sessionStorage.setItem('sysid_unlocked', 'true');

      if (ghTok) {
        localStorage.setItem(getTokenKey(currentProfile), ghTok);
      }

      userProgress = loadLocalProgress(currentProfile);
      document.getElementById('auth-gate').classList.add('hidden');
      refreshAllViews();
      await syncWithCloud(false);
    });

    // Settings & Cloud Sync Form
    document.getElementById('settings-auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const newProf = document.getElementById('set-profile-input').value.trim().toLowerCase() || 'robin';
      const newTok = document.getElementById('set-gh-token-input').value.trim();
      const newPin = document.getElementById('set-pin-input').value.trim() || '1885';

      if (newProf !== currentProfile) {
        currentProfile = newProf;
        localStorage.setItem('sysid_active_profile', currentProfile);
        userProgress = loadLocalProgress(currentProfile);
      }

      localStorage.setItem(getPinKey(currentProfile), newPin);
      if (newTok) {
        localStorage.setItem(getTokenKey(currentProfile), newTok);
      } else {
        localStorage.removeItem(getTokenKey(currentProfile));
      }

      saveLocalProgress();
      refreshAllViews();
      await syncWithCloud(false);
    });

    document.getElementById('btn-force-pull').addEventListener('click', async () => {
      await syncWithCloud(true);
    });

    document.getElementById('btn-lock-app').addEventListener('click', () => {
      sessionStorage.removeItem('sysid_unlocked');
      document.getElementById('auth-pin').value = '';
      document.getElementById('auth-gate').classList.remove('hidden');
    });

    // Export JSON
    document.getElementById('btn-export-json').addEventListener('click', () => {
      const dataStr = JSON.stringify(userProgress, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sysid_1rt885_progress_${currentProfile}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Import JSON
    document.getElementById('input-import-json').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!imported || typeof imported !== 'object' || !imported.cards) {
            throw new Error('Invalid progress JSON structure.');
          }
          userProgress = mergeProgressRecords(userProgress, imported);
          saveLocalProgress();
          refreshAllViews();
          await syncWithCloud(false);
          alert('Progress imported and merged successfully!');
        } catch (err) {
          alert('Could not import JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Reset Progress with Confirmation
    document.getElementById('btn-reset-progress').addEventListener('click', async () => {
      const c1 = confirm(
        `Are you sure you want to reset ALL progress, streaks, and bookmarks for profile "${currentProfile}"?`
      );
      if (!c1) return;
      const c2 = prompt(
        `Type RESET to confirm permanent deletion of progress for "${currentProfile}":`
      );
      if (c2 !== 'RESET') return;

      userProgress = createDefaultProgress(currentProfile);
      saveLocalProgress();
      refreshAllViews();
      await syncWithCloud(false);
      alert(`Progress for "${currentProfile}" has been reset.`);
    });
  }

  // ==========================================================================
  // 12. Bootstrapping Application
  // ==========================================================================
  function initApp() {
    userProgress = loadLocalProgress(currentProfile);
    initPracticeSetupUI();
    bindAllEvents();
    refreshAllViews();

    // Check URL hash or query for one-tap mobile token onboarding (stripped immediately from URL)
    if (window.location.hash && window.location.hash.includes('syncKey=')) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const key = params.get('syncKey');
      const prof = params.get('profile') || currentProfile;
      if (key) {
        currentProfile = prof.toLowerCase().trim();
        localStorage.setItem('sysid_active_profile', currentProfile);
        localStorage.setItem(getTokenKey(currentProfile), key);
        sessionStorage.setItem('sysid_unlocked', 'true');
        history.replaceState(null, '', window.location.pathname);
      }
    }

    // Show private auth gate unless already unlocked in this session
    if (sessionStorage.getItem('sysid_unlocked') !== 'true') {
      document.getElementById('auth-profile').value = currentProfile;
      document.getElementById('auth-gh-token').value = getStoredGhToken();
      document.getElementById('auth-gate').classList.remove('hidden');
    } else {
      syncWithCloud(false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

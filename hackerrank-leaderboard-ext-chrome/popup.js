// popup.js — Handles UI interactions and message passing to content script
const ext = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', async () => {
  const btnScrape    = document.getElementById('btnScrape');
  const btnText      = document.getElementById('btnText');
  const btnIcon      = btnScrape.querySelector('.btn-icon');
  const statusBadge  = document.getElementById('statusBadge');
  const pageTypeEl   = document.getElementById('pageType');
  const contestNameEl= document.getElementById('contestName');
  const logArea      = document.getElementById('logArea');
  const progressArea = document.getElementById('progressArea');
  const progressBar  = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const limitSelect  = document.getElementById('limitSelect');
  const fetchRealName= document.getElementById('fetchRealName');

  // ── Detect current tab info ─────────────────────────────────────────────
  let currentTab = null;
  let isHackerRank = false;
  let contestSlug = null;

  try {
    const tabs = await ext.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    currentTab = tab;

    if (tab && tab.url && tab.url.includes('hackerrank.com')) {
      isHackerRank = true;
      const url = new URL(tab.url);
      const segments = url.pathname.split('/').filter(Boolean);

      if (segments.includes('contests')) {
        const idx = segments.indexOf('contests');
        contestSlug = segments[idx + 1] || null;
        pageTypeEl.textContent = 'Contest Page';
        pageTypeEl.classList.add('highlight');
        contestNameEl.textContent = contestSlug
          ? contestSlug.replace(/-/g, ' ')
          : '(slug not found)';
        contestNameEl.classList.add('highlight');
      } else {
        pageTypeEl.textContent = 'Global / Profile';
        contestNameEl.textContent = '—';
      }

      btnScrape.disabled = false;
      setStatus('ready');
      addLog('info', `Halaman HackerRank terdeteksi. Siap dijalankan.`);
    } else {
      pageTypeEl.textContent = 'Bukan HackerRank';
      contestNameEl.textContent = '—';
      addLog('warn', 'Buka halaman HackerRank untuk menggunakan extension ini.');
      setStatus('error');
    }
  } catch (e) {
    addLog('error', 'Gagal membaca tab aktif: ' + e.message);
    setStatus('error');
  }

  // ── Button click ────────────────────────────────────────────────────────
  btnScrape.addEventListener('click', async () => {
    if (!isHackerRank || !currentTab) return;

    const limit = parseInt(limitSelect.value, 10);
    const wantRealName = fetchRealName.checked;

    setBtnLoading(true);
    setStatus('loading');
    clearLogs();
    showProgress(true);
    setProgress(10, 'Menghubungkan ke API HackerRank...');

    addLog('info', `Target: ${limit} peserta | Real name: ${wantRealName ? 'Aktif' : 'Nonaktif'}`);

    try {
      const scripting = ext.scripting || (typeof chrome !== 'undefined' ? chrome.scripting : null);
      if (!scripting) {
        throw new Error('API scripting tidak tersedia di browser ini.');
      }

      // Inject the scraper function into the page
      const [result] = await scripting.executeScript({
        target: { tabId: currentTab.id },
        func: runScraper,
        args: [contestSlug, limit, wantRealName],
      });

      if (result && result.result) {
        const data = result.result;

        if (data.error) {
          addLog('error', `Gagal: ${data.error}`);
          setStatus('error');
        } else {
          setProgress(100, `Selesai! ${data.count} peserta berhasil diambil.`);
          addLog('success', `Berhasil scrape ${data.count} peserta.`);
          addLog('info', `Nama file: ${data.filename}`);

          // Trigger download via the page
          await scripting.executeScript({
            target: { tabId: currentTab.id },
            func: triggerDownload,
            args: [data.jsonString, data.filename],
          });

          setStatus('done');
          addLog('success', 'File JSON otomatis terunduh!');
        }
      } else {
        addLog('error', 'Tidak ada respons dari halaman HackerRank.');
        setStatus('error');
      }
    } catch (err) {
      addLog('error', `Error: ${err.message}`);
      setStatus('error');
      console.error(err);
    } finally {
      setBtnLoading(false);
    }
  });

  // ── Helper: UI state functions ──────────────────────────────────────────

  function setStatus(state) {
    const labels = {
      ready:   'Ready',
      loading: 'Loading...',
      error:   'Error',
      done:    'Done',
    };
    statusBadge.textContent = labels[state] || state;
    statusBadge.className = 'badge ' + state;
  }

  function setBtnLoading(loading) {
    btnScrape.disabled = loading;
    btnScrape.className = loading ? 'btn-scrape loading' : 'btn-scrape';
    if (loading) {
      btnIcon.innerHTML = `
        <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      btnText.textContent = 'Memproses...';
    } else {
      btnIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      btnText.textContent = 'Download Leaderboard';
    }
  }

  function showProgress(show) {
    progressArea.style.display = show ? 'flex' : 'none';
  }

  function setProgress(pct, text) {
    progressBar.style.width = `${pct}%`;
    progressText.textContent = text;
  }

  function addLog(type, message) {
    const placeholder = logArea.querySelector('.log-entry.info:only-child');
    if (placeholder && placeholder.textContent.includes('Buka halaman')) {
      logArea.innerHTML = '';
    }

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-dot"></span><span>${message}</span>`;
    logArea.appendChild(entry);
    logArea.scrollTop = logArea.scrollHeight;
  }

  function clearLogs() {
    logArea.innerHTML = '';
  }
});

// ── Injected into page: runs the actual scraper with pagination & concurrency ──
async function runScraper(contestSlug, limit, wantRealName) {
  try {
    const filePrefix = contestSlug || 'global';
    const allModels = [];
    let offset = 0;
    const pageSize = 100; // Ukuran batch per request (HackerRank max safe limit)

    // 1. Loop pagination sampai target limit tercapai
    while (allModels.length < limit) {
      const fetchBatch = Math.min(pageSize, limit - allModels.length);
      const apiUrl = contestSlug
        ? `https://www.hackerrank.com/rest/contests/${contestSlug}/leaderboard?offset=${offset}&limit=${fetchBatch}`
        : `https://www.hackerrank.com/rest/leaderboard?offset=${offset}&limit=${fetchBatch}`;

      const lbRes = await fetch(apiUrl);
      if (!lbRes.ok) {
        throw new Error(`HTTP ${lbRes.status}: ${lbRes.statusText}`);
      }

      const lbData = await lbRes.json();
      const models = lbData.models || [];

      if (models.length === 0) break;
      allModels.push(...models);
      offset += models.length;

      // Jika response lebih sedikit dari batch yang diminta, data leaderboard sudah habis
      if (models.length < fetchBatch) break;
    }

    if (allModels.length === 0) {
      return {
        error: 'Tidak ada data peserta ditemukan. Pastikan Anda sudah login di HackerRank.',
        count: 0
      };
    }

    let cleanData;

    // 2. Fetch Real Name secara terkontrol (concurrency pool) untuk cegah Rate Limit 429
    if (wantRealName) {
      const concurrency = 8;
      const results = new Array(allModels.length);
      let currentIndex = 0;

      const worker = async () => {
        while (currentIndex < allModels.length) {
          const i = currentIndex++;
          const item = allModels[i];
          let realName = item.hacker;

          try {
            const pRes = await fetch(`https://www.hackerrank.com/rest/hackers/${item.hacker}`);
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData.model && pData.model.name) {
                realName = pData.model.name;
              }
            }
          } catch (_) {}

          const entry = {
            rank: item.rank,
            username: item.hacker,
            real_name: realName,
            score: item.score,
          };
          if (item.time_taken !== undefined) {
            entry.time_taken = item.time_taken;
          }
          results[i] = entry;
        }
      };

      const workers = Array.from(
        { length: Math.min(concurrency, allModels.length) },
        () => worker()
      );
      await Promise.all(workers);
      cleanData = results;
    } else {
      cleanData = allModels.map((item) => {
        const entry = {
          rank: item.rank,
          username: item.hacker,
          real_name: item.hacker,
          score: item.score,
        };
        if (item.time_taken !== undefined) {
          entry.time_taken = item.time_taken;
        }
        return entry;
      });
    }

    const filename = `${filePrefix}_leaderboard_clean.json`;
    const jsonString = JSON.stringify(cleanData, null, 2);

    return { count: cleanData.length, filename, jsonString };
  } catch (err) {
    return { error: err.message };
  }
}

// ── Injected into page: triggers file download ──────────────────────────
function triggerDownload(jsonString, filename) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

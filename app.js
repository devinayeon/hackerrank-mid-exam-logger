// app.js — HackerRank UTS Alpro Audit Studio & Data Ingestion
// Menyelaraskan 100% dengan konteks AGENTS.md (UTS Algoritma & Pemrograman)
// Mendukung drag-and-drop & unggah file JSON/HTML hasil scraping nyata

document.addEventListener("DOMContentLoaded", function () {
  var STORAGE_KEY = "hackerrank_uts_audit_data";
  var activePayload = null;
  var currentFilter = "all";
  var searchKeyword = "";

  // Elements
  var contestTitleEl = document.getElementById("contestTitleDisplay");
  var metricVisitorsEl = document.getElementById("metricVisitors");
  var metricSignupsEl = document.getElementById("metricSignups");
  var metricRevenueEl = document.getElementById("metricRevenue");
  var tableBodyEl = document.getElementById("tableBody");
  var filterInputEl = document.getElementById("filterInput");
  var filterPills = document.querySelectorAll(".filter-pills .filter-pill");
  var jsonFileInput = document.getElementById("jsonFileInput");
  var dashboardCard = document.getElementById("demo");

  // Modal Elements
  var modal = document.getElementById("codeModal");
  var btnCloseModal = document.getElementById("btnCloseModal");
  var btnCopyCode = document.getElementById("btnCopyCode");
  var modalCandidateName = document.getElementById("modalCandidateName");
  var modalStatusBadge = document.getElementById("modalStatusBadge");
  var modalProblemName = document.getElementById("modalProblemName");
  var modalChallengePicker = document.getElementById("modalChallengePicker");
  var modalLang = document.getElementById("modalLang");
  var modalScore = document.getElementById("modalScore");
  var modalTC = document.getElementById("modalTC");
  var modalCodeContent = document.getElementById("modalCodeContent");
  var activeCode = "";

  // -------------------------------------------------------------
  // Data Awal UTS Resmi (Berdasarkan Spesifikasi AGENTS.md §4)
  // Bobot: Ejak 15, Layanan 20, Nilai 20, Rabbit 20, Segitiga 25 (Total 100)
  // -------------------------------------------------------------
  var initialSamplePayload = {
    contest: "uts-alpro-ilkom-2026",
    generated_at: new Date().toISOString(),
    total_possible: 100,
    submission_total_visible: 342,
    challenge_weights: {
      "segitiga-bintang": { name: "Segitiga Bintang", max_score: 25 },
      "antrian-layanan": { name: "Layanan Bank", max_score: 20 },
      "rekap-nilai-mahasiswa": { name: "Nilai Mahasiswa", max_score: 20 },
      "kelinci-melompat": { name: "Rabbit Jump", max_score: 20 },
      "pola-ejak": { name: "Pola Ejak", max_score: 15 }
    },
    students: [
      {
        rank: 1,
        real_name: "Alex Rivera",
        username: "alex_rivera",
        total_score: 100,
        total_possible: 100,
        audit: {
          status: "LULUS_UTUH",
          full_solved_count: 5,
          flags: []
        },
        best_per_challenge: [
          {
            id: 201,
            challenge: "Segitiga Bintang",
            challenge_slug: "segitiga-bintang",
            score: 25,
            max_score: 25,
            selisih: 0,
            tc_passed: 15,
            tc_total: 15,
            status: "Accepted",
            language: "Python 3",
            code: "def cetak_segitiga(n):\n    # Pola segitiga simetris dengan penanganan spasi dinamis\n    for i in range(1, n + 1):\n        spasi = ' ' * (n - i)\n        bintang = '*' * (2 * i - 1)\n        print(spasi + bintang)\n\nif __name__ == '__main__':\n    import sys\n    baris = sys.stdin.read().strip()\n    if baris:\n        cetak_segitiga(int(baris))"
          },
          {
            id: 202,
            challenge: "Layanan Bank",
            challenge_slug: "antrian-layanan",
            score: 20,
            max_score: 20,
            selisih: 0,
            tc_passed: 10,
            tc_total: 10,
            status: "Accepted",
            language: "Python 3",
            code: "from collections import deque\n\ndef simulasikan_antrian(q_ops):\n    antrian = deque()\n    hasil = []\n    for op in q_ops:\n        if op[0] == 'MASUK':\n            antrian.append(op[1])\n        elif op[0] == 'LAYANI' and antrian:\n            hasil.append(antrian.popleft())\n    return hasil"
          }
        ]
      },
      {
        rank: 2,
        real_name: "Dian Pratama",
        username: "dian_pratama",
        total_score: 77,
        total_possible: 100,
        audit: {
          status: "LULUS_UTUH",
          full_solved_count: 3,
          flags: []
        },
        best_per_challenge: [
          {
            id: 203,
            challenge: "Segitiga Bintang",
            challenge_slug: "segitiga-bintang",
            score: 25,
            max_score: 25,
            selisih: 0,
            tc_passed: 15,
            tc_total: 15,
            status: "Accepted",
            language: "C++ 20",
            code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    for (int i = 1; i <= n; ++i) {\n        for (int s = 0; s < n - i; ++s) cout << ' ';\n        for (int b = 0; b < 2 * i - 1; ++b) cout << '*';\n        cout << '\\n';\n    }\n    return 0;\n}"
          },
          {
            id: 204,
            challenge: "Layanan Bank",
            challenge_slug: "antrian-layanan",
            score: 20,
            max_score: 20,
            selisih: 0,
            tc_passed: 10,
            tc_total: 10,
            status: "Accepted",
            language: "C++ 20",
            code: "// Solusi efisien O(N) dengan std::queue\n#include <iostream>\n#include <queue>\nusing namespace std;\nint main() {\n    // Lolos seluruh testcase termasuk hidden case\n    return 0;\n}"
          },
          {
            id: 205,
            challenge: "Pola Ejak",
            challenge_slug: "pola-ejak",
            score: 12,
            max_score: 15,
            selisih: 3,
            tc_passed: 8,
            tc_total: 10,
            status: "Wrong Answer",
            language: "C++ 20",
            code: "// Gagal di 2 hidden boundary testcase terakhir\n#include <iostream>\nusing namespace std;\nint main() { return 0; }"
          }
        ]
      },
      {
        rank: 3,
        real_name: "Budi Santoso",
        username: "budi_s",
        total_score: 40,
        total_possible: 100,
        audit: {
          status: "LULUS_UTUH",
          full_solved_count: 2,
          flags: []
        },
        best_per_challenge: [
          {
            id: 206,
            challenge: "Layanan Bank",
            challenge_slug: "antrian-layanan",
            score: 20,
            max_score: 20,
            selisih: 0,
            tc_passed: 10,
            tc_total: 10,
            status: "Accepted",
            language: "Java 17",
            code: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Menyelesaikan soal antrian perbankan utuh\n        Scanner sc = new Scanner(System.in);\n    }\n}"
          }
        ]
      },
      {
        rank: 4,
        real_name: "Siti Rahma",
        username: "siti_r",
        total_score: 13,
        total_possible: 100,
        audit: {
          status: "PERLU_REVIEW_MANUAL",
          full_solved_count: 0,
          flags: ["HANYA_PRINT", "SEBAGIAN_TC_LOLOS"]
        },
        best_per_challenge: [
          {
            id: 207,
            challenge: "Layanan Bank",
            challenge_slug: "antrian-layanan",
            score: 13,
            max_score: 20,
            selisih: 7,
            tc_passed: 4,
            tc_total: 10,
            status: "Wrong Answer",
            language: "Python 3",
            code: "# Akal-akalan print output: Lolos 4 sample testcases, gagal di seluruh hidden testcases\nprint(\"Bukan yang ini. SKIP!\")\nprint(2)"
          }
        ]
      },
      {
        rank: 5,
        real_name: "Kevin Chen",
        username: "kevin_c",
        total_score: 1,
        total_possible: 100,
        audit: {
          status: "BELUM_LULUS",
          full_solved_count: 0,
          flags: ["KODE_SANGAT_PENDEK", "SEBAGIAN_TC_LOLOS"]
        },
        best_per_challenge: [
          {
            id: 208,
            challenge: "Pola Ejak",
            challenge_slug: "pola-ejak",
            score: 1,
            max_score: 15,
            selisih: 14,
            tc_passed: 1,
            tc_total: 10,
            status: "Wrong Answer",
            language: "Python 3",
            code: "print(\"   x\")"
          }
        ]
      }
    ]
  };

  // -------------------------------------------------------------
  // Inisialisasi Data dari LocalStorage atau Default UTS
  // -------------------------------------------------------------
  function initData() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && (parsed.students || Array.isArray(parsed))) {
          loadScrapedPayload(parsed, false);
          return;
        }
      }
    } catch (e) {
      console.warn("Gagal membaca data cache lokal:", e);
    }
    loadScrapedPayload(initialSamplePayload, false);
  }

  // -------------------------------------------------------------
  // Ingest Scraped Data (sesuai kontrak schema AGENTS.md)
  // -------------------------------------------------------------
  function loadScrapedPayload(raw, saveToStorage) {
    if (!raw) return;

    var normalized = {
      contest: "uts-alpro-ilkom-2026",
      students: [],
      total_possible: 100
    };

    // Format A: JSON Audit Lengkap ({ contest, students, total_possible, ... })
    if (raw.students && Array.isArray(raw.students)) {
      normalized.contest = raw.contest || "Kontes UTS";
      normalized.total_possible = raw.total_possible || 100;
      normalized.students = raw.students.map(function (s, idx) {
        return {
          rank: s.rank != null ? s.rank : idx + 1,
          real_name: s.real_name || s.username || "Mahasiswa #" + (idx + 1),
          username: s.username || "mhs_" + (idx + 1),
          total_score: s.total_score != null ? s.total_score : (s.score || 0),
          total_possible: s.total_possible || normalized.total_possible,
          audit: s.audit || {
            status: (s.total_score >= 15 ? "LULUS_UTUH" : "BELUM_LULUS"),
            full_solved_count: s.full_solved || 0,
            flags: s.flags || []
          },
          best_per_challenge: s.best_per_challenge || []
        };
      });
    }
    // Format B: Leaderboard Murni (array baris [ { rank, username, score, real_name } ])
    else if (Array.isArray(raw)) {
      normalized.contest = "Leaderboard Hasil Scrape";
      normalized.students = raw.map(function (m, idx) {
        var scoreVal = Number(m.score) || 0;
        return {
          rank: m.rank != null ? m.rank : idx + 1,
          real_name: m.real_name || m.username || m.hacker || "Mahasiswa #" + (idx + 1),
          username: m.username || m.hacker || "user_" + (idx + 1),
          total_score: scoreVal,
          total_possible: 100,
          audit: {
            status: scoreVal >= 15 ? "LULUS_UTUH" : "BELUM_LULUS",
            full_solved_count: scoreVal >= 15 ? 1 : 0,
            flags: []
          },
          best_per_challenge: [
            {
              challenge: "Skor Leaderboard",
              score: scoreVal,
              max_score: 100,
              tc_passed: scoreVal > 0 ? 10 : 0,
              tc_total: 10,
              status: scoreVal > 0 ? "Scored" : "Unscored",
              language: "Leaderboard Mode",
              code: "# Mode leaderboard saja. Untuk melihat kode sumber tiap soal, gunakan mode 'Submission + audit per peserta'."
            }
          ]
        };
      });
    }

    activePayload = normalized;

    if (saveToStorage !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
      } catch (e) {
        console.warn("Storage quota:", e);
      }
    }

    updateUI();
  }

  // -------------------------------------------------------------
  // Update Statistik Metrik & Toolbar
  // -------------------------------------------------------------
  function updateUI() {
    if (!activePayload) return;
    var students = activePayload.students || [];

    if (contestTitleEl) {
      contestTitleEl.textContent = activePayload.contest || "uts-alpro-ilkom-2026";
    }

    // Hitung metrik dinamis
    var totalMahasiswa = students.length;
    var lulusUtuh = students.filter(function (s) {
      return s.audit && s.audit.status === "LULUS_UTUH";
    }).length;
    var totalPoin = students.reduce(function (acc, s) {
      return acc + (Number(s.total_score) || 0);
    }, 0);

    if (metricVisitorsEl) metricVisitorsEl.textContent = totalMahasiswa.toLocaleString();
    if (metricSignupsEl) metricSignupsEl.textContent = lulusUtuh.toLocaleString();
    if (metricRevenueEl) metricRevenueEl.textContent = totalPoin.toLocaleString() + " pts";

    // Hitung tombol filter status
    var cAll = students.length;
    var cLulus = lulusUtuh;
    var cReview = students.filter(function (s) { return s.audit && s.audit.status === "PERLU_REVIEW_MANUAL"; }).length;
    var cBelum = students.filter(function (s) { return s.audit && s.audit.status === "BELUM_LULUS"; }).length;

    filterPills.forEach(function (pill) {
      var f = pill.getAttribute("data-filter");
      if (f === "all") pill.textContent = "Semua (" + cAll + ")";
      else if (f === "LULUS_UTUH") pill.textContent = "LULUS UTUH (" + cLulus + ")";
      else if (f === "PERLU_REVIEW_MANUAL") pill.textContent = "PERLU REVIEW (" + cReview + ")";
      else if (f === "BELUM_LULUS") pill.textContent = "BELUM LULUS (" + cBelum + ")";
    });

    renderTable();
    populateStudentDropdown();
    renderCodeInspector();
  }

  // -------------------------------------------------------------
  // Render Tabel Mahasiswa UTS
  // -------------------------------------------------------------
  function renderTable() {
    if (!tableBodyEl || !activePayload) return;
    tableBodyEl.innerHTML = "";

    var students = activePayload.students || [];
    var filtered = students.filter(function (s) {
      var status = (s.audit && s.audit.status) || "";
      var matchesFilter = currentFilter === "all" || status === currentFilter;
      var matchesSearch =
        (s.real_name || "").toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (s.username || "").toLowerCase().includes(searchKeyword.toLowerCase()) ||
        status.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      var emptyTr = document.createElement("tr");
      emptyTr.innerHTML =
        '<td colspan="7" style="text-align:center; padding: 32px; color: var(--ink-tertiary);">' +
        'Tidak ada mahasiswa yang cocok dengan kriteria pencarian.<br>' +
        '<span style="font-size: 11px;">Impor file <code>*_submissions_audit.json</code> untuk melihat data kontes UTS asli Anda.</span>' +
        '</td>';
      tableBodyEl.appendChild(emptyTr);
      return;
    }

    filtered.forEach(function (s) {
      var tr = document.createElement("tr");
      var status = (s.audit && s.audit.status) || "BELUM_LULUS";
      var statusClass = "belum";
      var statusLabel = status.replace(/_/g, " ");

      if (status === "LULUS_UTUH") {
        statusClass = "lulus";
      } else if (status === "PERLU_REVIEW_MANUAL") {
        statusClass = "review";
      }

      var tcPassed = 0, tcTotal = 0;
      if (s.best_per_challenge && s.best_per_challenge.length) {
        s.best_per_challenge.forEach(function (b) {
          tcPassed += (b.tc_passed || 0);
          tcTotal += (b.tc_total || 0);
        });
      }

      var tcDisplay = tcTotal > 0 ? (tcPassed + " / " + tcTotal) : "—";
      var maxDisplay = s.total_possible > 0 ? (" / " + s.total_possible) : "";

      // Flag badge preview jika ada
      var flagHtml = "";
      if (s.audit && s.audit.flags && s.audit.flags.length) {
        flagHtml = "<div style='font-size:10px; color:#b3261e; font-weight:600; margin-top:2px;'>" +
          escapeHtml(s.audit.flags.join(", ")) + "</div>";
      }

      tr.innerHTML =
        "<td><b>#" + s.rank + "</b></td>" +
        "<td><div style='font-weight:600;'>" + escapeHtml(s.real_name) + "</div>" + flagHtml + "</td>" +
        "<td><span style='color:var(--ink-secondary); font-family:var(--font-mono); font-size:12px;'>@" + escapeHtml(s.username) + "</span></td>" +
        "<td><b>" + s.total_score + "</b> <span style='color:var(--ink-tertiary);'>" + maxDisplay + "</span></td>" +
        "<td>" + tcDisplay + "</td>" +
        "<td><span class='status-badge " + statusClass + "'>" + statusLabel + "</span></td>" +
        "<td><button class='btn-inspect' data-user='" + escapeHtml(s.username) + "'>Inspeksi</button></td>";

      tableBodyEl.appendChild(tr);
    });

    // Pasang listener tombol inspeksi
    tableBodyEl.querySelectorAll(".btn-inspect").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var user = btn.getAttribute("data-user");
        var student = activePayload.students.find(function (x) { return x.username === user; });
        if (student) {
          selectStudentInInspector(student.username);
          switchStudioTab("submissions");
          var studioCard = document.getElementById("demo");
          if (studioCard) {
            studioCard.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });
  }

  // -------------------------------------------------------------
  // Modal Peninjau Kode Mahasiswa UTS (dengan Tab Pemilih Soal)
  // -------------------------------------------------------------
  function openModal(student) {
    if (!modal) return;

    modalCandidateName.textContent = (student.real_name || student.username) + " (@" + student.username + ")";
    var status = (student.audit && student.audit.status) || "BELUM_LULUS";
    modalStatusBadge.textContent = status.replace(/_/g, " ");
    modalStatusBadge.className = "modal-badge " + (status === "LULUS_UTUH" ? "lulus" : (status === "PERLU_REVIEW_MANUAL" ? "review" : "belum"));

    var challenges = student.best_per_challenge || [];
    modalChallengePicker.innerHTML = "";

    function renderProblemDetail(ch) {
      if (!ch) {
        modalProblemName.textContent = "Soal: Submission UTS";
        modalLang.textContent = "—";
        modalScore.textContent = student.total_score;
        modalTC.textContent = "—";
        modalCodeContent.textContent = "# Berkas kode tidak tersedia untuk mahasiswa ini.";
        activeCode = "";
        return;
      }

      modalProblemName.textContent = "Soal: " + (ch.challenge || ch.challenge_slug || "Soal UTS") +
        (ch.max_score ? " (Bobot: " + ch.max_score + (ch.selisih != null ? ", Selisih: " + ch.selisih : "") + ")" : "");
      modalLang.textContent = ch.language || "Python 3";
      modalScore.textContent = ch.score + (ch.max_score ? " / " + ch.max_score : "");
      modalTC.textContent = (ch.tc_passed || 0) + " / " + (ch.tc_total || 0) + " testcase lolos";
      modalCodeContent.textContent = ch.code || "# Kode tidak tersedia (gagal diambil dari HackerRank).";
      activeCode = ch.code || "";
    }

    if (challenges.length > 0) {
      challenges.forEach(function (ch, idx) {
        var chip = document.createElement("button");
        chip.className = "filter-pill" + (idx === 0 ? " active" : "");
        chip.style.border = "1px solid var(--border-light)";
        chip.textContent = (ch.challenge || ch.challenge_slug || "Soal " + (idx + 1)) + " (" + ch.score + " pts)";
        chip.addEventListener("click", function () {
          modalChallengePicker.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
          chip.classList.add("active");
          renderProblemDetail(ch);
        });
        modalChallengePicker.appendChild(chip);
      });
      renderProblemDetail(challenges[0]);
    } else {
      renderProblemDetail(null);
    }

    modal.style.display = "flex";
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  if (btnCopyCode) {
    btnCopyCode.addEventListener("click", function () {
      if (!activeCode) return;
      navigator.clipboard.writeText(activeCode).then(function () {
        var orig = btnCopyCode.textContent;
        btnCopyCode.textContent = "Tersalin!";
        setTimeout(function () { btnCopyCode.textContent = orig; }, 1500);
      });
    });
  }

  // -------------------------------------------------------------
  // Unggah File JSON / HTML Laporan Scrape dari Komputer
  // -------------------------------------------------------------
  if (jsonFileInput) {
    jsonFileInput.addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (evt) {
        try {
          var content = evt.target.result;
          var parsed;

          // Ekstrak data JSON tertanam jika mengunggah file _laporan_audit.html
          if (file.name.endsWith(".html") || content.includes('id="d" type="application/json"')) {
            var match = content.match(/<script id="d" type="application\/json">([\s\S]*?)<\/script>/);
            if (match && match[1]) {
              parsed = JSON.parse(match[1]);
            } else {
              throw new Error("Tidak menemukan data JSON audit di dalam berkas HTML.");
            }
          } else {
            parsed = JSON.parse(content);
          }

          loadScrapedPayload(parsed, true);
          alert("Berhasil memuat data audit ujian dari: " + file.name + " (" + activePayload.students.length + " mahasiswa)");
        } catch (err) {
          alert("Gagal mem-parse berkas hasil audit: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  // Drag and drop JSON ke area dashboard card
  if (dashboardCard) {
    dashboardCard.addEventListener("dragover", function (e) {
      e.preventDefault();
      dashboardCard.style.outline = "2px dashed var(--apple-blue)";
    });
    dashboardCard.addEventListener("dragleave", function (e) {
      dashboardCard.style.outline = "";
    });
    dashboardCard.addEventListener("drop", function (e) {
      e.preventDefault();
      dashboardCard.style.outline = "";
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        var file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
          try {
            var parsed = JSON.parse(evt.target.result);
            loadScrapedPayload(parsed, true);
            alert("Berhasil memuat berkas hasil audit!");
          } catch (err) {
            alert("Gagal membaca file JSON: " + err.message);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // -------------------------------------------------------------
  // Ekspor CSV Rekap Nilai Ujian (Sesuai AGENTS.md §4)
  // -------------------------------------------------------------
  var btnExportCSV = document.getElementById("btnExportCSV");
  if (btnExportCSV) {
    btnExportCSV.addEventListener("click", function () {
      if (!activePayload || !activePayload.students.length) {
        alert("Tidak ada data mahasiswa untuk diekspor.");
        return;
      }
      var students = activePayload.students;
      var csvRows = [
        ["Rank", "Nama Mahasiswa", "Username", "Skor Total", "Bobot Total", "Status", "Flag"]
      ];
      students.forEach(function (s) {
        var status = (s.audit && s.audit.status) || "";
        var flags = (s.audit && s.audit.flags) ? s.audit.flags.join(" | ") : "";
        csvRows.push([
          s.rank,
          '"' + (s.real_name || "").replace(/"/g, '""') + '"',
          s.username,
          s.total_score,
          s.total_possible,
          status,
          '"' + flags.replace(/"/g, '""') + '"'
        ]);
      });
      var csvString = csvRows.map(function (e) { return e.join(","); }).join("\n");
      var blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = (activePayload.contest || "uts_alpro") + "_rekap_audit.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // -------------------------------------------------------------
  // Filter & Pencarian Mahasiswa
  // -------------------------------------------------------------
  if (filterInputEl) {
    filterInputEl.addEventListener("input", function (e) {
      searchKeyword = e.target.value.trim();
      renderTable();
    });
  }

  filterPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      filterPills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      currentFilter = pill.getAttribute("data-filter");
      renderTable();
    });
  });

  // -------------------------------------------------------------
  // Simulasi Animasi Scraping
  // -------------------------------------------------------------
  var btnSimulate = document.getElementById("btnSimulate");
  var simProgress = document.getElementById("simProgress");
  var progBar = document.getElementById("progBar");
  var progLabel = document.getElementById("progLabel");
  var progPercent = document.getElementById("progPercent");

  if (btnSimulate) {
    btnSimulate.addEventListener("click", function () {
      btnSimulate.disabled = true;
      simProgress.style.display = "flex";
      progBar.style.width = "0%";
      progPercent.textContent = "0%";
      progLabel.textContent = "Mengambil daftar leaderboard kontes UTS...";

      var steps = [
        { pct: "25%", label: "Leaderboard terambil (84 mahasiswa terindeks)..." },
        { pct: "60%", label: "Memproses submission per mahasiswa (pacing 1.2s)..." },
        { pct: "85%", label: "Memeriksa syarat LULUS_UTUH & mendeteksi pola print-hack..." },
        { pct: "100%", label: "Selesai! Laporan audit, JSON, dan CSV rekap nilai siap." }
      ];

      var stepIdx = 0;
      var timer = setInterval(function () {
        if (stepIdx < steps.length) {
          progBar.style.width = steps[stepIdx].pct;
          progPercent.textContent = steps[stepIdx].pct;
          progLabel.textContent = steps[stepIdx].label;
          stepIdx++;
        } else {
          clearInterval(timer);
          setTimeout(function () {
            btnSimulate.disabled = false;
            btnSimulate.innerHTML =
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span>Simulasikan Ulang</span>';
          }, 400);
        }
      }, 450);
    });
  }

  // -------------------------------------------------------------
  // Toggle Accordion FAQ
  // -------------------------------------------------------------
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var trigger = item.querySelector(".faq-trigger");
    if (trigger) {
      trigger.addEventListener("click", function () {
        var isExpanded = item.classList.contains("expanded");
        faqItems.forEach(function (other) {
          other.classList.remove("expanded");
          var otherTrigger = other.querySelector(".faq-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        });
        if (!isExpanded) {
          item.classList.add("expanded");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    }
  });

  // -------------------------------------------------------------
  // Navigasi Studio Tabs (Ringkasan Nilai, Pemeriksaan Kode, Log)
  // -------------------------------------------------------------
  var studioViews = {
    overview: document.getElementById("viewOverview"),
    submissions: document.getElementById("viewSubmissions"),
    audit: document.getElementById("viewAudit")
  };
  var studioTabTitle = document.getElementById("studioTabTitle");
  var studioTabSubtitle = document.getElementById("studioTabSubtitle");
  var sidebarItems = document.querySelectorAll(".sidebar-item");

  function switchStudioTab(tabKey) {
    sidebarItems.forEach(function (item) {
      if (item.getAttribute("data-tab") === tabKey) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    Object.keys(studioViews).forEach(function (key) {
      var viewEl = studioViews[key];
      if (viewEl) {
        if (key === tabKey) {
          viewEl.style.display = "flex";
          viewEl.classList.add("active");
        } else {
          viewEl.style.display = "none";
          viewEl.classList.remove("active");
        }
      }
    });

    if (tabKey === "overview") {
      if (studioTabTitle) studioTabTitle.textContent = "Ringkasan Ujian Tengah Semester";
      if (studioTabSubtitle) studioTabSubtitle.textContent = "Mata Kuliah: Algoritma dan Pemrograman (Ilmu Komputer)";
    } else if (tabKey === "submissions") {
      if (studioTabTitle) studioTabTitle.textContent = "Pemeriksaan Kode Mahasiswa";
      if (studioTabSubtitle) studioTabSubtitle.textContent = "Inspeksi Baris Kode, Testcase, dan Indikasi Print-Hack";
      renderCodeInspector();
    } else if (tabKey === "audit") {
      if (studioTabTitle) studioTabTitle.textContent = "Telemetry & Log Anti-Throttle";
      if (studioTabSubtitle) studioTabSubtitle.textContent = "Pacing 1.2 Detik, Single-Worker, & Proteksi HTTP 429";
    }
  }

  sidebarItems.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var tabKey = tab.getAttribute("data-tab");
      if (tabKey) switchStudioTab(tabKey);
    });
  });

  // -------------------------------------------------------------
  // Dedicated Code Inspector (Tab: Pemeriksaan Kode)
  // -------------------------------------------------------------
  var inspectorStudentSelect = document.getElementById("inspectorStudentSelect");
  var btnInspectorPrev = document.getElementById("btnInspectorPrev");
  var btnInspectorNext = document.getElementById("btnInspectorNext");
  var inspectorStatusBadge = document.getElementById("inspectorStatusBadge");
  var inspectorScoreDisplay = document.getElementById("inspectorScoreDisplay");
  var inspectorProblemPills = document.getElementById("inspectorProblemPills");
  var inspectorChallengeTitle = document.getElementById("inspectorChallengeTitle");
  var inspectorChallengeWeight = document.getElementById("inspectorChallengeWeight");
  var inspectorLangBadge = document.getElementById("inspectorLangBadge");
  var inspectorTcScore = document.getElementById("inspectorTcScore");
  var btnInspectorCopyCode = document.getElementById("btnInspectorCopyCode");
  var inspectorCodeViewport = document.getElementById("inspectorCodeViewport");
  var inspectorLineCount = document.getElementById("inspectorLineCount");
  var forensicIcon = document.getElementById("forensicIcon");
  var forensicHeading = document.getElementById("forensicHeading");
  var forensicBody = document.getElementById("forensicBody");

  var currentInspectorUser = null;
  var currentInspectorChallengeIdx = 0;
  var activeInspectorCode = "";

  function populateStudentDropdown() {
    if (!inspectorStudentSelect || !activePayload) return;
    var students = activePayload.students || [];
    inspectorStudentSelect.innerHTML = "";

    students.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s.username;
      opt.textContent = "#" + s.rank + " - " + (s.real_name || s.username) + " (@" + s.username + ") — " + s.total_score + " pts";
      inspectorStudentSelect.appendChild(opt);
    });

    if (!currentInspectorUser && students.length > 0) {
      currentInspectorUser = students[0].username;
    }
    if (currentInspectorUser) {
      inspectorStudentSelect.value = currentInspectorUser;
    }
  }

  function selectStudentInInspector(username) {
    currentInspectorUser = username;
    currentInspectorChallengeIdx = 0;
    if (inspectorStudentSelect) {
      inspectorStudentSelect.value = username;
    }
    renderCodeInspector();
  }

  function renderCodeInspector() {
    if (!activePayload || !activePayload.students.length) return;
    var students = activePayload.students;
    var student = students.find(function (s) { return s.username === currentInspectorUser; }) || students[0];
    if (!student) return;

    currentInspectorUser = student.username;
    if (inspectorStudentSelect && inspectorStudentSelect.value !== student.username) {
      inspectorStudentSelect.value = student.username;
    }

    var status = (student.audit && student.audit.status) || "BELUM_LULUS";
    var statusLabel = status.replace(/_/g, " ");
    var statusClass = status === "LULUS_UTUH" ? "lulus" : (status === "PERLU_REVIEW_MANUAL" ? "review" : "belum");

    if (inspectorStatusBadge) {
      inspectorStatusBadge.textContent = statusLabel;
      inspectorStatusBadge.className = "status-badge " + statusClass;
    }

    if (inspectorScoreDisplay) {
      var totalPossible = student.total_possible || activePayload.total_possible || 100;
      inspectorScoreDisplay.textContent = "Skor: " + student.total_score + " / " + totalPossible;
    }

    var challenges = student.best_per_challenge || [];
    if (inspectorProblemPills) {
      inspectorProblemPills.innerHTML = "";
      if (challenges.length === 0) {
        var emptyChip = document.createElement("span");
        emptyChip.style.fontSize = "12px";
        emptyChip.style.color = "var(--ink-tertiary)";
        emptyChip.textContent = "Tidak ada rekaman submission soal.";
        inspectorProblemPills.appendChild(emptyChip);
      } else {
        challenges.forEach(function (ch, idx) {
          var pill = document.createElement("button");
          pill.className = "inspector-problem-pill" + (idx === currentInspectorChallengeIdx ? " active" : "");
          pill.textContent = (ch.challenge || ch.challenge_slug || "Soal " + (idx + 1)) + " (" + (ch.score != null ? ch.score : 0) + " pts)";
          pill.addEventListener("click", function () {
            currentInspectorChallengeIdx = idx;
            renderCodeInspector();
          });
          inspectorProblemPills.appendChild(pill);
        });
      }
    }

    var activeChallenge = challenges[currentInspectorChallengeIdx] || challenges[0];
    if (activeChallenge) {
      if (inspectorChallengeTitle) {
        inspectorChallengeTitle.textContent = activeChallenge.challenge || activeChallenge.challenge_slug || "Soal UTS";
      }
      if (inspectorChallengeWeight) {
        var weightStr = "(Bobot: " + (activeChallenge.max_score != null ? activeChallenge.max_score : 0);
        if (activeChallenge.selisih != null) {
          weightStr += ", Selisih: " + activeChallenge.selisih;
        }
        weightStr += ")";
        inspectorChallengeWeight.textContent = weightStr;
      }
      if (inspectorLangBadge) {
        inspectorLangBadge.textContent = activeChallenge.language || "Python 3";
      }
      if (inspectorTcScore) {
        inspectorTcScore.textContent = (activeChallenge.tc_passed || 0) + " / " + (activeChallenge.tc_total || 0) + " testcase lolos";
      }
      var codeText = activeChallenge.code || "# Kode tidak tersedia (gagal diambil dari HackerRank).";
      activeInspectorCode = codeText;
      if (inspectorCodeViewport) {
        inspectorCodeViewport.textContent = codeText;
      }
      if (inspectorLineCount) {
        var lines = codeText.split("\n").length;
        inspectorLineCount.textContent = lines + " baris kode";
      }
    } else {
      if (inspectorChallengeTitle) inspectorChallengeTitle.textContent = "Data Tidak Tersedia";
      if (inspectorChallengeWeight) inspectorChallengeWeight.textContent = "";
      if (inspectorLangBadge) inspectorLangBadge.textContent = "—";
      if (inspectorTcScore) inspectorTcScore.textContent = "0 / 0 testcase";
      activeInspectorCode = "";
      if (inspectorCodeViewport) inspectorCodeViewport.textContent = "# Berkas kode tidak ditemukan untuk peserta ini.";
      if (inspectorLineCount) inspectorLineCount.textContent = "0 baris kode";
    }

    // Analisis Forensik Callout
    var flags = (student.audit && student.audit.flags) || [];
    if (status === "LULUS_UTUH") {
      if (forensicIcon) forensicIcon.textContent = "✓";
      if (forensicHeading) forensicHeading.textContent = "Analisis Audit Kelulusan: LULUS_UTUH";
      if (forensicBody) {
        forensicBody.innerHTML = "Mahasiswa berhasil menyelesaikan minimal 1 soal secara utuh dengan skor maksimum dan lolos seluruh testcase (termasuk hidden cases). <b>Memenuhi syarat kelulusan ujian UTS Algoritma & Pemrograman.</b>";
      }
    } else if (status === "PERLU_REVIEW_MANUAL") {
      if (forensicIcon) forensicIcon.textContent = "⚠️";
      if (forensicHeading) forensicHeading.textContent = "Analisis Audit Kelulusan: PERLU_REVIEW_MANUAL";
      if (forensicBody) {
        var flagStr = flags.length ? flags.join(", ") : "HANYA_PRINT / SEBAGIAN_TC_LOLOS";
        forensicBody.innerHTML = "Terdeteksi pola akal-akalan atau hardcoded output (<b>" + escapeHtml(flagStr) + "</b>). Mahasiswa berhasil meloloskan testcase sampel namun gagal di seluruh testcase tersembunyi (hidden testcases). Perlu evaluasi kode secara manual.";
      }
    } else {
      if (forensicIcon) forensicIcon.textContent = "✕";
      if (forensicHeading) forensicHeading.textContent = "Analisis Audit Kelulusan: BELUM_LULUS";
      if (forensicBody) {
        var reason = flags.length ? ("Flag terdeteksi: <b>" + escapeHtml(flags.join(", ")) + "</b>.") : "Belum ada satupun soal yang terselesaikan secara utuh.";
        forensicBody.innerHTML = "Mahasiswa belum memenuhi syarat kelulusan UTS. " + reason;
      }
    }
  }

  if (btnInspectorPrev) {
    btnInspectorPrev.addEventListener("click", function () {
      if (!activePayload || !activePayload.students.length) return;
      var students = activePayload.students;
      var curIdx = students.findIndex(function (s) { return s.username === currentInspectorUser; });
      var prevIdx = curIdx <= 0 ? students.length - 1 : curIdx - 1;
      selectStudentInInspector(students[prevIdx].username);
    });
  }

  if (btnInspectorNext) {
    btnInspectorNext.addEventListener("click", function () {
      if (!activePayload || !activePayload.students.length) return;
      var students = activePayload.students;
      var curIdx = students.findIndex(function (s) { return s.username === currentInspectorUser; });
      var nextIdx = curIdx >= students.length - 1 ? 0 : curIdx + 1;
      selectStudentInInspector(students[nextIdx].username);
    });
  }

  if (inspectorStudentSelect) {
    inspectorStudentSelect.addEventListener("change", function (e) {
      selectStudentInInspector(e.target.value);
    });
  }

  if (btnInspectorCopyCode) {
    btnInspectorCopyCode.addEventListener("click", function () {
      if (!activeInspectorCode) return;
      navigator.clipboard.writeText(activeInspectorCode).then(function () {
        var orig = btnInspectorCopyCode.textContent;
        btnInspectorCopyCode.textContent = "Tersalin!";
        setTimeout(function () { btnInspectorCopyCode.textContent = orig; }, 1500);
      });
    });
  }

  // -------------------------------------------------------------
  // Tab 3: Log Anti-Throttle Telemetry Simulation
  // -------------------------------------------------------------
  var terminalLogStream = document.getElementById("terminalLogStream");
  var btnRunLogSim = document.getElementById("btnRunLogSim");
  var btnClearLog = document.getElementById("btnClearLog");

  var sampleTelemetryLogs = [
    { type: "ok", tag: "[GET]", msg: "/rest/contests/uts-alpro-ilkom-2026/submissions/209 (dian_pratama #203) - HTTP 200 OK." },
    { type: "info", tag: "[PACE]", msg: "Single-worker pacing: Menunda 1.2 detik untuk menghindari rate-limit HackerRank..." },
    { type: "warn", tag: "[RATE_LIMIT]", msg: "HTTP 429 Too Many Requests terdeteksi! Mengaktifkan backoff adaptif (1.5 detik)..." },
    { type: "info", tag: "[RETRY]", msg: "Mengirim ulang request submission #210 setelah backoff berhasil (HTTP 200 OK)." },
    { type: "ok", tag: "[FETCH_CODE]", msg: "budi_s #206 (Layanan Bank) terunduh utuh (10/10 testcase lolos)." },
    { type: "warn", tag: "[FLAG]", msg: "kevin_c #208 (Pola Ejak) ditandai: KODE_SANGAT_PENDEK, SEBAGIAN_TC_LOLOS." },
    { type: "ok", tag: "[COMPLETE]", msg: "Siklus scraping selesai tanpa akun di-ban. Seluruh kode tersimpan di cache." }
  ];

  var logSimRunning = false;
  if (btnRunLogSim) {
    btnRunLogSim.addEventListener("click", function () {
      if (logSimRunning || !terminalLogStream) return;
      logSimRunning = true;
      btnRunLogSim.disabled = true;
      btnRunLogSim.textContent = "Menyimulasikan...";

      var idx = 0;
      var interval = setInterval(function () {
        if (idx < sampleTelemetryLogs.length) {
          var item = sampleTelemetryLogs[idx];
          var now = new Date();
          var timeStr = "[" + String(now.getHours()).padStart(2, "0") + ":" +
            String(now.getMinutes()).padStart(2, "0") + ":" +
            String(now.getSeconds()).padStart(2, "0") + "]";

          var tagClass = item.type === "ok" ? "term-tag-ok" : (item.type === "warn" ? "term-tag-warn" : "term-tag-info");
          var line = document.createElement("div");
          line.className = "terminal-line";
          line.innerHTML = '<span class="term-time">' + timeStr + '</span> ' +
            '<span class="' + tagClass + '">' + item.tag + '</span> ' +
            escapeHtml(item.msg);

          terminalLogStream.appendChild(line);
          terminalLogStream.scrollTop = terminalLogStream.scrollHeight;
          idx++;
        } else {
          clearInterval(interval);
          logSimRunning = false;
          btnRunLogSim.disabled = false;
          btnRunLogSim.textContent = "Simulasikan Request";
        }
      }, 700);
    });
  }

  if (btnClearLog) {
    btnClearLog.addEventListener("click", function () {
      if (terminalLogStream) {
        terminalLogStream.innerHTML =
          '<div class="terminal-line"><span class="term-time">[READY]</span> <span class="term-tag-info">[STANDBY]</span> Log dibersihkan. Menunggu permintaan scraping baru dari ekstensi...</div>';
      }
    });
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m];
    });
  }

  // Mulai
  initData();
});

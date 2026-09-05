/**
 * Admin Panel JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Toggle sidebar on mobile
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const content = document.querySelector('.main-content');
  
  if (sidebarToggle && sidebar && content) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
      content.classList.toggle('sidebar-hidden');
    });
  }
  
  // Refresh logs
  const refreshLogsBtn = document.getElementById('refreshLogs');
  const logTypeSelect = document.getElementById('logType');
  const logContent = document.getElementById('logContent');
  
  if (refreshLogsBtn && logTypeSelect && logContent) {
    refreshLogsBtn.addEventListener('click', function() {
      fetchLogs(logTypeSelect.value);
    });
    
    logTypeSelect.addEventListener('change', function() {
      fetchLogs(this.value);
    });
    
    // Initial load
    fetchLogs('out');
  }
  
  // Restart bot for QR
  const restartForQRBtn = document.getElementById('restartForQR');
  if (restartForQRBtn) {
    restartForQRBtn.addEventListener('click', function() {
      if (confirm('Apakah Anda yakin ingin me-restart bot untuk mendapatkan QR code baru?')) {
        restartBot();
      }
    });
  }
  
  // Start/Stop bot buttons
  const startBotBtn = document.getElementById('startBot');
  const stopBotBtn = document.getElementById('stopBot');
  
  if (startBotBtn) {
    startBotBtn.addEventListener('click', function() {
      if (confirm('Apakah Anda yakin ingin memulai bot?')) {
        startBot();
      }
    });
  }
  
  if (stopBotBtn) {
    stopBotBtn.addEventListener('click', function() {
      if (confirm('Apakah Anda yakin ingin menghentikan bot?')) {
        stopBot();
      }
    });
  }
  
  // Feature toggle switches
  const featureToggles = document.querySelectorAll('.feature-toggle');
  featureToggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      const featureId = this.getAttribute('data-feature');
      const isEnabled = this.checked;
      toggleFeature(featureId, isEnabled);
    });
  });
});

/**
 * Fetch logs from server
 */
function fetchLogs(type) {
  const logContent = document.getElementById('logContent');
  logContent.innerHTML = 'Loading logs...';
  
  fetch(`/api/logs?type=${type}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (data.logs && data.logs.length > 0) {
          logContent.innerHTML = '';
          data.logs.forEach(log => {
            const logLine = document.createElement('p');
            logLine.className = 'log-line';
            
            // Add class based on log level
            if (log.includes('ERROR') || log.includes('Error')) {
              logLine.classList.add('log-error');
            } else if (log.includes('WARN') || log.includes('Warning')) {
              logLine.classList.add('log-warning');
            } else if (log.includes('INFO') || log.includes('Info')) {
              logLine.classList.add('log-info');
            } else if (log.includes('SUCCESS') || log.includes('Success')) {
              logLine.classList.add('log-success');
            }
            
            logLine.textContent = log;
            logContent.appendChild(logLine);
          });
          
          // Scroll to bottom
          logContent.scrollTop = logContent.scrollHeight;
        } else {
          logContent.innerHTML = '<p class="text-center">No logs found</p>';
        }
      } else {
        logContent.innerHTML = `<p class="log-error">Error: ${data.message || 'Failed to load logs'}</p>`;
      }
    })
    .catch(error => {
      logContent.innerHTML = `<p class="log-error">Error: ${error.message || 'Failed to load logs'}</p>`;
    });
}

/**
 * Restart the bot
 */
function restartBot() {
  fetch('/api/bot/restart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Bot sedang di-restart. Halaman akan dimuat ulang dalam 5 detik.');
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } else {
      alert(`Error: ${data.message || 'Failed to restart bot'}`);
    }
  })
  .catch(error => {
    alert(`Error: ${error.message || 'Failed to restart bot'}`);
  });
}

/**
 * Start the bot
 */
function startBot() {
  fetch('/api/bot/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Bot sedang dimulai. Halaman akan dimuat ulang dalam 5 detik.');
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } else {
      alert(`Error: ${data.message || 'Failed to start bot'}`);
    }
  })
  .catch(error => {
    alert(`Error: ${error.message || 'Failed to start bot'}`);
  });
}

/**
 * Stop the bot
 */
function stopBot() {
  fetch('/api/bot/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Bot sedang dihentikan. Halaman akan dimuat ulang dalam 3 detik.');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      alert(`Error: ${data.message || 'Failed to stop bot'}`);
    }
  })
  .catch(error => {
    alert(`Error: ${error.message || 'Failed to stop bot'}`);
  });
}

/**
 * Toggle feature
 */
function toggleFeature(featureId, isEnabled) {
  fetch('/api/features/toggle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      featureId: featureId,
      enabled: isEnabled
    })
  })
  .then(response => response.json())
  .then(data => {
    if (!data.success) {
      alert(`Error: ${data.message || 'Failed to toggle feature'}`);
      // Revert toggle if failed
      const toggle = document.querySelector(`[data-feature="${featureId}"]`);
      if (toggle) {
        toggle.checked = !isEnabled;
      }
    }
  })
  .catch(error => {
    alert(`Error: ${error.message || 'Failed to toggle feature'}`);
    // Revert toggle if failed
    const toggle = document.querySelector(`[data-feature="${featureId}"]`);
    if (toggle) {
      toggle.checked = !isEnabled;
    }
  });
}
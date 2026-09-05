/**
 * WhatsApp Bot Admin Panel JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Sidebar toggle for mobile
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
  
  // Bot control buttons
  setupBotControls();
  
  // Feature toggles
  setupFeatureToggles();
  
  // Logs
  setupLogs();
  
  // Auto refresh dashboard every 30 seconds
  setupAutoRefresh();
});

/**
 * Setup bot control buttons
 */
function setupBotControls() {
  const startBot = document.getElementById('startBot');
  const stopBot = document.getElementById('stopBot');
  const restartBot = document.getElementById('restartBot');
  const restartForQR = document.getElementById('restartForQR');
  const botActionResult = document.getElementById('botActionResult');
  
  if (!botActionResult) return;
  
  if (startBot) {
    startBot.addEventListener('click', function() {
      botAction('start');
    });
  }
  
  if (stopBot) {
    stopBot.addEventListener('click', function() {
      botAction('stop');
    });
  }
  
  if (restartBot) {
    restartBot.addEventListener('click', function() {
      botAction('restart');
    });
  }
  
  if (restartForQR) {
    restartForQR.addEventListener('click', function() {
      botAction('restart');
    });
  }
  
  function botAction(action) {
    botActionResult.innerHTML = `<div class="alert alert-info">Menjalankan perintah ${action}...</div>`;
    
    fetch(`/api/bot/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        botActionResult.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        botActionResult.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      }
    })
    .catch(error => {
      botActionResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
  }
}

/**
 * Setup feature toggles
 */
function setupFeatureToggles() {
  const featureToggles = document.querySelectorAll('.feature-toggle');
  const featureToggleResult = document.getElementById('featureToggleResult');
  
  if (!featureToggleResult) return;
  
  featureToggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      const feature = this.dataset.feature;
      const enabled = this.checked;
      
      featureToggleResult.innerHTML = `<div class="alert alert-info">Mengubah status fitur ${feature}...</div>`;
      
      fetch('/api/features/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feature, enabled })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          featureToggleResult.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          setTimeout(() => {
            featureToggleResult.innerHTML = '';
          }, 3000);
        } else {
          featureToggleResult.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          // Revert toggle if failed
          this.checked = !enabled;
        }
      })
      .catch(error => {
        featureToggleResult.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        // Revert toggle if failed
        this.checked = !enabled;
      });
    });
  });
}

/**
 * Setup logs functionality
 */
function setupLogs() {
  const logType = document.getElementById('logType');
  const refreshLogs = document.getElementById('refreshLogs');
  const logContent = document.getElementById('logContent');
  
  if (!logContent) return;
  
  function loadLogs() {
    const type = logType.value;
    logContent.textContent = 'Loading logs...';
    
    fetch(`/api/logs?type=${type}&lines=100`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          logContent.textContent = data.logs || 'No logs available';
          // Scroll to bottom
          logContent.scrollTop = logContent.scrollHeight;
        } else {
          logContent.textContent = `Error: ${data.message}`;
        }
      })
      .catch(error => {
        logContent.textContent = `Error loading logs: ${error.message}`;
      });
  }
  
  if (refreshLogs) {
    refreshLogs.addEventListener('click', loadLogs);
  }
  
  if (logType) {
    logType.addEventListener('change', loadLogs);
  }
  
  // Load logs on tab activation
  const logTab = document.querySelector('a[href="#logs"]');
  if (logTab) {
    logTab.addEventListener('shown.bs.tab', loadLogs);
  }
}

/**
 * Setup auto refresh for dashboard
 */
function setupAutoRefresh() {
  setInterval(function() {
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab && activeTab.id === 'dashboard') {
      window.location.reload();
    }
  }, 30000); // 30 seconds
}
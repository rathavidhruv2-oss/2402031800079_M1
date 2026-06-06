document.addEventListener('DOMContentLoaded', function() {
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show-toast');
  window.clearTimeout(window.toastTimeout);
  window.toastTimeout = window.setTimeout(function() {
    toast.classList.remove('show-toast');
  }, 3200);
}

function showOrderMessage(item) {
  showToast('Thanks! Call us to order ' + item + '.');
}

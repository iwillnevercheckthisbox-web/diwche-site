/* Contact form: checks the fields, then hands the message to the visitor's mail app, addressed to support@diwche.com.
   The live site posts it to the backend instead once that endpoint exists. */
(() => {
  const f = document.getElementById('cform'); if (!f) return;
  const I = window.I18N, note = document.getElementById('cformNote');
  const okMail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [...f.querySelectorAll('[required]')].find(el => !el.value.trim() || (el.type === 'email' && !okMail(el.value)));
    if (bad) { note.textContent = I.t('Please fill in your name, a working email and a message.'); bad.focus(); return; }
    const d = Object.fromEntries(new FormData(f));
    const body = `${d.msg}\n\n${d.name}${d.page ? ' · ' + d.page : ''}\n${d.email}${d.early ? '\nEarly access: yes' : ''}`;
    location.href = `mailto:support@diwche.com?subject=${encodeURIComponent(d.early ? 'Diwche early access' : 'Hello Diwche')}&body=${encodeURIComponent(body)}`;
    note.textContent = I.t('Thank you. Your mail app opens with the message ready to send.');
  });
})();

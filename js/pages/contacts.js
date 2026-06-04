/* ============================================
   ZOHA FLOWERS — Contacts Page
   ============================================ */

Router.register('contacts', () => {
  const lang = I18n.getLang();

  return `
    <div class="page page-top-pad">
      <!-- Map / Store banner -->
      <div style="margin:0 16px 20px;background:linear-gradient(135deg,#3a2e2e 0%,#6b4c4c 100%);border-radius:var(--radius-xl);min-height:140px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:white;text-align:center;padding:24px">
        <div style="font-size:40px">🌸</div>
        <div style="font-family:var(--font-serif);font-size:22px">Zoha Flowers</div>
        <div style="font-size:13px;opacity:0.8;letter-spacing:1px">PREMIUM FLOWER BOUTIQUE</div>
      </div>

      <div class="contact-cards">
        <a class="contact-card" onclick="TG.openLink('tel:+998944870097')" style="text-decoration:none">
          <div class="contact-icon">📞</div>
          <div>
            <div class="contact-label" data-i18n="contact.phone">${I18n.t('contact.phone')}</div>
            <div class="contact-value">+998 94 487 00 97</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>

        <div class="contact-card" onclick="TG.openTelegramLink('https://t.me/zohid7')">
          <div class="contact-icon">✈️</div>
          <div>
            <div class="contact-label" data-i18n="contact.telegram">${I18n.t('contact.telegram')}</div>
            <div class="contact-value">@zohid7</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <div class="contact-card">
          <div class="contact-icon">🕐</div>
          <div>
            <div class="contact-label" data-i18n="contact.hours">${I18n.t('contact.hours')}</div>
            <div class="contact-value" data-i18n="contact.hours_val">${I18n.t('contact.hours_val')}</div>
          </div>
          <div style="background:var(--color-success);color:white;border-radius:var(--radius-full);padding:3px 8px;font-size:11px;font-weight:600;margin-left:auto">
            ${lang === 'uz' ? 'Ochiq' : lang === 'ru' ? 'Открыто' : 'Open'}
          </div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">📍</div>
          <div>
            <div class="contact-label">${lang === 'uz' ? 'Manzil' : lang === 'ru' ? 'Адрес' : 'Address'}</div>
            <div class="contact-value">${lang === 'uz' ? 'Toshkent shahri' : lang === 'ru' ? 'Ташкент' : 'Tashkent, Uzbekistan'}</div>
          </div>
        </div>
      </div>

      <!-- Social / Quick order -->
      <div style="margin:16px;background:var(--color-beige);border-radius:var(--radius-xl);padding:20px 24px;text-align:center">
        <div style="font-family:var(--font-serif);font-size:18px;margin-bottom:8px">
          ${lang === 'uz' ? 'Tezkor buyurtma' : lang === 'ru' ? 'Быстрый заказ' : 'Quick Order'}
        </div>
        <p style="font-size:13px;color:var(--color-text-mid);margin-bottom:16px;line-height:1.6">
          ${lang === 'uz' ? 'Telegram orqali bizga yozing — tez javob beramiz!' : lang === 'ru' ? 'Напишите нам в Telegram — ответим быстро!' : 'Message us on Telegram — we respond fast!'}
        </p>
        <button class="btn-primary" style="width:100%" onclick="TG.openTelegramLink('https://t.me/zohid7')">
          ✈️ Telegram: @zohid7
        </button>
      </div>
      <div class="spacer-16"></div>
    </div>`;
});

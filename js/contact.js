(() => {
  /* Static inquiry: prepare a draft; only the visitor's Email app sends it. */
  const recipient = 'service@hyweb.com.tw';
  const value = (data, name) => String(data.get(name) || '').trim();

  function buildInquiry(data) {
    return [
      'Lib One 設備諮詢',
      `單位名稱：${value(data, 'organization')}`,
      `聯絡人：${value(data, 'contact_name')}`,
      `Email：${value(data, 'email')}`,
      `聯絡電話：${value(data, 'phone') || '未提供'}`,
      `有興趣的設備：${data.getAll('interests[]').join('、') || '尚未指定，請協助選型'}`,
      '',
      '需求說明：',
      value(data, 'message')
    ].join('\n');
  }

  function buildMailto(data) {
    const organization = value(data, 'organization').replace(/[\r\n]+/g, ' ').slice(0, 80);
    const subject = `Lib One 設備諮詢｜${organization}`;
    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildInquiry(data))}`;
  }

  function selectProduct(form, productId) {
    const choice = [...form.querySelectorAll('input[name="interests[]"]')].find(input => input.dataset.productId === productId);
    if (!choice) return false;
    choice.checked = true;
    return true;
  }

  function initContactForm(documentRoot = document, browser = window) {
    const form = documentRoot.querySelector('#contact-form');
    if (!form) return;
    const status = form.querySelector('[role="status"]');
    const draft = form.querySelector('#inquiry-draft');
    const prepared = form.querySelector('.prepared-inquiry');
    const copyButton = form.querySelector('[data-copy-inquiry]');
    selectProduct(form, new URLSearchParams(browser.location.search).get('product'));

    function prepare() {
      if (!form.reportValidity()) return null;
      const data = new browser.FormData(form);
      draft.value = buildInquiry(data);
      prepared.hidden = false;
      return data;
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = prepare();
      if (!data) return;
      status.textContent = '請在郵件軟體中確認並寄出；本站不會自動寄信。若未開啟，可複製下方內容直接寄給我們。';
      try {
        browser.location.href = buildMailto(data);
      } catch {
        status.textContent = '無法開啟郵件軟體。請複製下方內容，寄至 service@hyweb.com.tw；您的填寫內容已保留。';
      }
    });

    copyButton.addEventListener('click', async () => {
      if (!prepare()) return;
      try {
        if (!browser.navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await browser.navigator.clipboard.writeText(draft.value);
        status.textContent = '需求內容已複製，請貼到您的 Email 並自行寄出；本站尚未寄信。';
      } catch {
        draft.focus();
        draft.select();
        status.textContent = '請手動複製下方已選取的內容，再寄至 service@hyweb.com.tw；本站尚未寄信。';
      }
    });
    form.querySelectorAll('[data-inquiry-action]').forEach(button => { button.disabled = false; });
  }

  initContactForm();
})();

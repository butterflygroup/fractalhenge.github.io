/**
 * Opens a native dialog populated from a slot card definition.
 * @param {HTMLDialogElement} dialog
 * @param {{ ordinal: number, ordinalTotal: number, title: string, subtitle?: string, sections: Array<{ heading?: string, bodyParagraphs?: string[], listItems?: string[] }> }} card
 */
export function openEmotionCardModal(dialog, card) {
  if (!dialog) return;

  const titleEl = dialog.querySelector('[data-emotion-modal-title]');
  const subtitleEl = dialog.querySelector('[data-emotion-modal-subtitle]');
  const ordinalEl = dialog.querySelector('[data-emotion-modal-ordinal]');
  const bodyEl = dialog.querySelector('[data-emotion-modal-body]');

  if (!titleEl || !bodyEl) return;

  titleEl.textContent = card.title;
  if (subtitleEl) {
    if (card.subtitle) {
      subtitleEl.textContent = card.subtitle;
      subtitleEl.hidden = false;
    } else {
      subtitleEl.textContent = '';
      subtitleEl.hidden = true;
    }
  }
  if (ordinalEl) {
    ordinalEl.textContent = `Card ${card.ordinal} of ${card.ordinalTotal}`;
    ordinalEl.hidden = false;
  }

  bodyEl.replaceChildren();

  for (const section of card.sections) {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'emotion-card-modal__section';

    if (section.heading) {
      const h = document.createElement('h3');
      h.className = 'emotion-card-modal__section-title';
      h.textContent = section.heading;
      sectionEl.appendChild(h);
    }

    if (section.bodyParagraphs) {
      for (const paragraph of section.bodyParagraphs) {
        const p = document.createElement('p');
        p.textContent = paragraph;
        sectionEl.appendChild(p);
      }
    }

    if (section.listItems && section.listItems.length > 0) {
      const ul = document.createElement('ul');
      for (const item of section.listItems) {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      }
      sectionEl.appendChild(ul);
    }

    bodyEl.appendChild(sectionEl);
  }

  dialog.showModal();
}

/**
 * @param {HTMLDialogElement} dialog
 */
export function bindEmotionCardModal(dialog) {
  if (!dialog) return;

  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  const closeBtn = dialog.querySelector('[data-emotion-modal-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dialog.close());
  }
}

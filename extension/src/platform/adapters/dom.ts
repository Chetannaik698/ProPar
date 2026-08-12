export function readElementText(element: HTMLElement): string {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    return element.value;
  }

  return element.innerText || element.textContent || '';
}

export function moveCaretToEnd(element: HTMLElement): void {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    const end = element.value.length;
    element.setSelectionRange(end, end);
    element.scrollTop = element.scrollHeight;
    return;
  }

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
  element.scrollTop = element.scrollHeight;
}

export function replaceElementText(element: HTMLElement, text: string): boolean {
  element.focus();

  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    element.value = text;
  } else {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    if (!document.execCommand?.('insertText', false, text)) {
      element.textContent = text;
    }
  }

  element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.focus();
  moveCaretToEnd(element);
  return true;
}

export function uniqueVisibleElements(elements: Iterable<HTMLElement>): HTMLElement[] {
  return [...new Set(elements)].filter((element) => element.isConnected);
}

export function isVisibleElement(element: HTMLElement): boolean {
  if (!element.isConnected) return false;

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  return true;
}



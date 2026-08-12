import { beforeEach, describe, expect, it, vi } from 'vitest';
import { linkedinAdapter } from './adapter';

function makeVisible(element: HTMLElement, rect: Partial<DOMRect> = {}): HTMLElement {
  const width = rect.width ?? 220;
  const height = rect.height ?? 36;
  const top = rect.top ?? 10;
  const left = rect.left ?? 10;
  const fullRect = {
    x: left,
    y: top,
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(fullRect);
  Object.defineProperty(element, 'offsetWidth', { configurable: true, value: width });
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: height });
  vi.spyOn(element, 'getClientRects').mockReturnValue([fullRect] as unknown as DOMRectList);

  return element;
}

function makeTreeVisible(root: HTMLElement): void {
  makeVisible(root);
  root.querySelectorAll<HTMLElement>('*').forEach((element) => makeVisible(element));
}

function createPostComposer(text = ''): { dialog: HTMLElement; composer: HTMLElement; actionbar: HTMLElement; postButton: HTMLButtonElement } {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', 'Create a post');

  const composer = document.createElement('div');
  composer.setAttribute('contenteditable', 'true');
  composer.setAttribute('role', 'textbox');
  composer.setAttribute('aria-label', 'What do you want to talk about?');
  composer.innerText = text;

  const actionbar = document.createElement('div');
  actionbar.setAttribute('role', 'toolbar');
  actionbar.setAttribute('aria-label', 'Post toolbar');

  const mediaButton = document.createElement('button');
  mediaButton.textContent = 'Add media';

  const postButton = document.createElement('button');
  postButton.textContent = 'Post';

  actionbar.append(mediaButton, postButton);
  dialog.append(composer, actionbar);
  document.body.append(dialog);
  makeTreeVisible(dialog);

  return { dialog, composer, actionbar, postButton };
}

describe('linkedinAdapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches linkedin domains', () => {
    expect(linkedinAdapter.matches({ hostname: 'linkedin.com' } as Location)).toBe(true);
    expect(linkedinAdapter.matches({ hostname: 'www.linkedin.com' } as Location)).toBe(true);
    expect(linkedinAdapter.matches({ hostname: 'mail.google.com' } as Location)).toBe(false);
  });

  it('detects a visible post composer with a toolbar and anchors before the Post button', () => {
    const { composer, actionbar, postButton } = createPostComposer('Draft post');

    expect(linkedinAdapter.getComposerCandidates()).toEqual([composer]);
    expect(linkedinAdapter.readComposer()).toBe('Draft post');
    expect(linkedinAdapter.getAnchorElement(composer)).toBe(postButton);
    expect(linkedinAdapter.getComposerContainer(composer)).toBe(actionbar);
  });

  it('ignores comment and message editors instead of treating them as post composers', () => {
    const commentBox = document.createElement('form');
    commentBox.setAttribute('aria-label', 'Comment form');

    const editor = document.createElement('div');
    editor.setAttribute('contenteditable', 'true');
    editor.setAttribute('role', 'textbox');
    editor.setAttribute('aria-label', 'Add a comment');

    const submit = document.createElement('button');
    submit.textContent = 'Comment';

    commentBox.append(editor, submit);
    document.body.append(commentBox);
    makeTreeVisible(commentBox);

    expect(linkedinAdapter.getComposerCandidates()).toEqual([]);
  });

  it('replaces text in the detected post composer', () => {
    const { composer } = createPostComposer('Old post');

    const replaced = linkedinAdapter.replaceComposer('Improved post');

    expect(replaced).toBe(true);
    expect(composer.textContent).toBe('Improved post');
  });

  it('recovers when LinkedIn rerenders the action bar', () => {
    const { composer, actionbar, postButton } = createPostComposer('Draft post');
    expect(linkedinAdapter.getAnchorElement(composer)).toBe(postButton);

    actionbar.innerHTML = '';
    const nextPostButton = document.createElement('button');
    nextPostButton.textContent = 'Post';
    actionbar.append(nextPostButton);
    makeTreeVisible(actionbar);

    expect(linkedinAdapter.getAnchorElement(composer)).toBe(nextPostButton);
  });
});

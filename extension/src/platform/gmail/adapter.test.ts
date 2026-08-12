import { beforeEach, describe, expect, it } from 'vitest';
import { gmailAdapter } from './adapter';

describe('gmailAdapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('matches mail.google.com and subdomains', () => {
    const loc1 = { hostname: 'mail.google.com' } as Location;
    const loc2 = { hostname: 'inbox.mail.google.com' } as Location;
    const loc3 = { hostname: 'google.com' } as Location;

    expect(gmailAdapter.matches(loc1)).toBe(true);
    expect(gmailAdapter.matches(loc2)).toBe(true);
    expect(gmailAdapter.matches(loc3)).toBe(false);
  });

  it('reads content from the compose body editor', () => {
    const composer = document.createElement('div');
    composer.setAttribute('aria-label', 'Message Body');
    composer.setAttribute('contenteditable', 'true');
    composer.innerText = 'Hello, this is a draft email.';
    document.body.append(composer);

    expect(gmailAdapter.readComposer()).toBe('Hello, this is a draft email.');
  });

  it('replaces content, sets subject and formats body when brackets are present', () => {
    const form = document.createElement('form');
    const composer = document.createElement('div');
    composer.setAttribute('aria-label', 'Message Body');
    composer.setAttribute('contenteditable', 'true');

    const subjectInput = document.createElement('input');
    subjectInput.name = 'subjectbox';
    subjectInput.value = '';

    form.append(subjectInput, composer);
    document.body.append(form);

    const emailContent = `[SUBJECT] Project Update
[GREETING] Dear Client,
[BODY] The project is complete.
[CLOSING] Best regards,
[SIGNATURE] Engineering Team`;

    const success = gmailAdapter.replaceComposer(emailContent);

    expect(success).toBe(true);
    expect(subjectInput.value).toBe('Project Update');
    expect(composer.textContent).toContain('Dear Client');
    expect(composer.textContent).toContain('The project is complete.');
    expect(composer.textContent).toContain('Best regards');
    expect(composer.textContent).toContain('Engineering Team');
  });

  it('replaces content directly when no bracket separators are present', () => {
    const composer = document.createElement('div');
    composer.setAttribute('aria-label', 'Message Body');
    composer.setAttribute('contenteditable', 'true');
    document.body.append(composer);

    const success = gmailAdapter.replaceComposer('Just a plain message body');

    expect(success).toBe(true);
    expect(composer.textContent).toBe('Just a plain message body');
  });
});

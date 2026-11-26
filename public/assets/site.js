const german = document.documentElement.lang.startsWith('de');
const nav=document.querySelector('.navigation'),toggle=document.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',open);nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{const tag=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('.work-item').forEach(x=>x.hidden=tag!=='all'&&x.dataset.category!==tag)}));
const enquiry = document.querySelector('#enquiry');
const enquiryEmail = enquiry?.querySelector('[name="email"]');
const verification = enquiry?.querySelector('#enquiry-verification');
let enquiryWidget;
function renderEnquiryVerification() {
  if (verification && window.turnstile) {
    enquiryWidget = window.turnstile.render(verification, {
      sitekey: verification.dataset.sitekey,
      action: 'contact',
      appearance: 'interaction-only',
      language: german ? 'de' : 'en',
    });
  }
}
if (verification) window.addEventListener('load', renderEnquiryVerification, { once: true });
const verificationWarning = german
  ? 'Bitte warte, bis die Sicherheitsprüfung abgeschlossen ist, und versuche es erneut. Du kannst mir auch direkt an matt@mattbeadle.com schreiben.'
  : 'Please wait for the security check to finish and try again. You can also email me at matt@mattbeadle.com.';
const ownAddressWarning = german
  ? 'Bitte gib deine eigene E-Mail-Adresse an. Adressen von mattbeadle.com können hier nicht verwendet werden.'
  : 'Please use your own email address. Addresses at mattbeadle.com cannot be used here.';
function validateEnquiryEmail() {
  if (!enquiryEmail) return;
  const domain = enquiryEmail.value.trim().split('@').pop().toLowerCase().replace(/\.+$/, '');
  enquiryEmail.setCustomValidity(domain === 'mattbeadle.com' || domain.endsWith('.mattbeadle.com') ? ownAddressWarning : '');
}
enquiryEmail?.addEventListener('input', validateEnquiryEmail);
enquiryEmail?.addEventListener('change', validateEnquiryEmail);
enquiry?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = enquiry.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  if (button.disabled) return;
  validateEnquiryEmail();
  if (!enquiry.reportValidity()) return;

  const formData = new FormData(enquiry);
  if (!formData.get('cf-turnstile-response')) {
    status.textContent = verificationWarning;
    return;
  }
  button.disabled = true;
  status.textContent = german ? 'Deine Anfrage wird gesendet …' : 'Sending your enquiry…';
  try {
    const response = await fetch(enquiry.action, {
      method: 'POST',
      body: new URLSearchParams(formData),
    });
    const result = await response.json();
    if (result.code === 'sender_not_allowed') {
      enquiryEmail.setCustomValidity(ownAddressWarning);
      enquiryEmail.reportValidity();
      status.textContent = ownAddressWarning;
      return;
    }
    if (result.code === 'verification_failed') {
      status.textContent = verificationWarning;
      return;
    }
    if (!response.ok || !result.ok) throw new Error('Delivery failed');
    enquiry.reset();
    status.textContent = german
      ? 'Danke für deine Anfrage. Ich freue mich darauf, mehr über deine Veranstaltung oder dein Filmprojekt zu erfahren.'
      : 'Thanks for getting in touch. I’m looking forward to hearing about your event or film.';
  } catch {
    status.textContent = german
      ? 'Deine Anfrage konnte nicht gesendet werden. Versuch es bitte erneut oder schreib mir an matt@mattbeadle.com.'
      : 'Your enquiry couldn’t be sent. Please try again or email me at matt@mattbeadle.com.';
  } finally {
    button.disabled = false;
    if (enquiryWidget !== undefined) window.turnstile.reset(enquiryWidget);
  }
});

// Honour the service carried through a language switch or enquiry link.
const enquiryService=document.querySelector('#enquiry [name="service"]');if(enquiryService){const requested=new URLSearchParams(location.search).get("service");if([...enquiryService.options].some(option=>option.value===requested))enquiryService.value=requested;}

// Keep only one website media player audible, including across open draft tabs.
const mediaChannel=typeof BroadcastChannel==='function'?new BroadcastChannel('mb-website-media'):null;
function pauseWebsiteMedia(except){document.querySelectorAll('video,audio').forEach(media=>{if(media!==except)media.pause();});}
document.addEventListener('play',event=>{if(event.target instanceof HTMLMediaElement){pauseWebsiteMedia(event.target);mediaChannel?.postMessage('pause');}},true);
if(mediaChannel)mediaChannel.onmessage=event=>{if(event.data==='pause')pauseWebsiteMedia();};
document.addEventListener('ended',event=>{if(event.target instanceof HTMLMediaElement)event.target.pause();},true);
window.addEventListener('pagehide',()=>pauseWebsiteMedia());

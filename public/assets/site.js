const german = document.documentElement.lang.startsWith('de');
const nav=document.querySelector('.navigation'),toggle=document.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',open);nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{const tag=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('.work-item').forEach(x=>x.hidden=tag!=='all'&&x.dataset.category!==tag)}));
const enquiry = document.querySelector('#enquiry');
enquiry?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = enquiry.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  if (button.disabled) return;

  button.disabled = true;
  status.textContent = german ? 'Deine Anfrage wird gesendet …' : 'Sending your enquiry…';
  try {
    const response = await fetch(enquiry.action, {
      method: 'POST',
      body: new URLSearchParams(new FormData(enquiry)),
    });
    if (!response.ok || !(await response.json()).ok) throw new Error('Delivery failed');
    enquiry.reset();
    status.textContent = german
      ? 'Danke für deine Anfrage. Ich melde mich bei dir.'
      : 'Thanks for your enquiry. I’ll be in touch.';
  } catch {
    status.textContent = german
      ? 'Deine Anfrage konnte nicht gesendet werden. Versuch es bitte erneut oder schreib mir an matt@mattbeadle.com.'
      : 'Your enquiry couldn’t be sent. Please try again or email me at matt@mattbeadle.com.';
  } finally {
    button.disabled = false;
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

const clipDialog=document.querySelector('#clip-dialog'),clipPlayer=document.querySelector('#clip-player');let clipTrigger;
const clipGerman=document.documentElement.lang.startsWith('de');
function clipDescription(href){
 const descriptions=[
 ['original-speaker-reel-2024','Original 2024 speaker reel · Complete original edit and sound.','Original-Speaker-Reel von 2024 · Vollständiger Originalschnitt und Originalton.'],
 ['entertainment-short','51 seconds.','51 Sekunden.'],
 ['entertainment-showreel','4:33.','4:33.'],
 ['training-showreel','1:25 · Nine training examples · English subtitles.','1:25 · Neun Trainingsbeispiele · Englische Untertitel.'],
 ['sc-verl','Highlights with music.','Highlights mit Musik.'],
 ['automotive-showreel','72-second reel · Eight films · BMW, MAN and Mercedes-Benz · Original sound.','72 Sekunden · Acht Filme · BMW, MAN und Mercedes-Benz · Originalton.'],
 ['live-broadcasts-showreel','54-second reel · Original speech · Studio, panel and hybrid broadcasts.','54 Sekunden · Originalton · Studio-, Panel- und Hybridsendungen.'],
 ['brand-product-showreel','71-second reel · Hands-on product demonstrations · Original sound.','71 Sekunden · Produkte in Aktion · Originalton.'],
 ['facilitation-showreel','73-second reel · Team exercises and geographic sociometrics.','73 Sekunden · Teamübungen und geografische Soziometrie.'],
 ['speaker-showreel','2:39 · Strengths, leadership and personal development · English subtitles.','2:39 · Stärken, Führung und persönliche Entwicklung · Englische Untertitel.'],
 ['podcast-montage','2:54 · Ten sources · English subtitles · Original audio with tuning transitions.','2:54 · Zehn Quellen · Englische Untertitel · Originalton mit Radioübergängen.'],
 ['events-showreel','1:48 · Live event hosting · Original speech and music.','1:48 · Live-Eventmoderation · Originalton und Musik.'],
 ['interview-showreel','1:28 · Nine question-and-answer exchanges · English and German.','1:28 · Neun Frage-Antwort-Sequenzen · Deutsch und Englisch.']
 ];
 const match=descriptions.find(([key])=>href.includes(key));return match?match[clipGerman?2:1]:'';
}
const clipLinks = [...document.querySelectorAll('.clip-local')];
function openClip(link, play) {
 clipTrigger = link;
 document.querySelector('#clip-title').textContent = link.dataset.clipTitle || link.textContent;
 const href = link.getAttribute('href');
 const caption = document.querySelector('.clip-caption');
 caption.textContent = clipDescription(href);
 caption.hidden = !caption.textContent;
 clipPlayer.src = href;
 clipDialog.showModal();
 if (play) clipPlayer.play().catch(() => {});
}

for (const link of clipLinks) {
 link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  openClip(link, true);
 });
}
for (const link of document.querySelectorAll('.clip-share')) {
 link.addEventListener('click', async event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !navigator.clipboard?.writeText) return;
  event.preventDefault();
  try {
   await navigator.clipboard.writeText(link.href);
   const label = clipGerman ? 'Link kopiert' : 'Link copied';
   link.textContent = label;
   link.setAttribute('aria-label', label);
  } catch {
   location.assign(link.href);
  }
 });
}
const sharedId = new URLSearchParams(location.search).get('clip');
const sharedClip = clipLinks.find(link => link.dataset.clipId === sharedId);
if (sharedClip) openClip(sharedClip, false);
document.querySelector('.clip-close')?.addEventListener('click',()=>clipDialog.close());clipDialog?.addEventListener('click',event=>{if(event.target===clipDialog)clipDialog.close();});clipDialog?.addEventListener('close',()=>{clipPlayer.pause();clipPlayer.removeAttribute('src');clipPlayer.load();clipTrigger?.focus();});

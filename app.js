'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const whatsappIcon = "<img class=\"whatsapp-icon\" src=\"assets/whatsapp.svg\" width=\"24\" height=\"24\" alt=\"\" aria-hidden=\"true\">";
const cities = {
  astana: { name: 'Астана', phone: '77711446231' },
  aktobe: { name: 'Актобе', phone: '77055188988' },
  almaty: { name: 'Алматы', phone: '77003112808' },
  kostanay: { name: 'Костанай', phone: '77053766071' },
  kokshetau: { name: 'Кокшетау', phone: '77010595517' }
};
// The page opens a prepared WhatsApp message; it never reports an unsent lead as sent.
function whatsappLink(cityKey, message) {
  const url = new URL(`https://wa.me/${cities[cityKey].phone}`);
  url.searchParams.set('text', message);
  return url.href;
}
const contactDialog = $('#contact-dialog');
const dialogTitle = $('#dialog-title');
const dialogDescription = $('#dialog-description');
const dialogContent = $('#dialog-content');
let previousFocus = null;

function showDialog() {
  closeMenu();
  previousFocus = document.activeElement;
  contactDialog.showModal();
  document.body.classList.add('modal-open');
}
function cityContact(context = 'consultation', message = '') {
  dialogTitle.textContent = context === 'id' ? 'Ваш первый шаг — ID-код' : context === 'address' ? 'Проверим адрес доставки' : 'Выберите свой город';
  dialogDescription.textContent = context === 'address' ? 'Выберите свой город. В WhatsApp прикрепите скриншот заполненного адреса склада — менеджер проверит его перед покупкой.' : 'Откроем WhatsApp вашего офиса с готовым сообщением. Останется нажать «Отправить».';
  const base = context === 'id' ? 'Здравствуйте! Хочу получить ID-код и адрес склада в Китае.' : context === 'address' ? 'Здравствуйте! Хочу проверить, правильно ли я указал(а) адрес склада в Китае. Прикрепляю скриншот заполненного адреса.' : context === 'commercial' ? 'Здравствуйте! Хочу уточнить коммерческий тариф для оптовой партии из Китая.' : context === 'quote' ? 'Здравствуйте! Хочу уточнить тариф и стоимость доставки из Китая.' : 'Здравствуйте! Хочу уточнить условия доставки из Китая.';
  dialogContent.innerHTML = Object.entries(cities).map(([key, city]) => `<a class="contact-city" href="${whatsappLink(key, `${message || base}\nГород получения: ${city.name}.`)}" target="_blank" rel="noopener"><span>${city.name}</span>${whatsappIcon}</a>`).join('') + '<p class="dialog-footnote">Вы общаетесь напрямую с Silkway Cargo. На этой странице сообщение не отправляется и персональные данные не сохраняются.</p>';
  showDialog();
}
$$('[data-contact]').forEach((button) => button.addEventListener('click', () => cityContact(button.dataset.contact)));
$('#contact-dialog [data-close-dialog]').addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  previousFocus?.focus({ preventScroll: true });
});
contactDialog.addEventListener('click', (event) => {
  if (event.target !== contactDialog) return;
  const bounds = contactDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) contactDialog.close();
});

const mobileMenu = $('#mobile-menu');
const menuToggle = $('#menu-toggle');
function closeMenu() { mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Открыть меню'); }
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = open;
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', open ? 'Открыть меню' : 'Закрыть меню');
});
$$('a', mobileMenu).forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuToggle.focus(); } });
document.addEventListener('click', (event) => { if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu(); });

// Only the selected breakpoint's video is loaded. One play settles on the brand frame.
const heroVideo = $('#hero-video');
const hero = $('.hero');
const videoControl = $('#video-control');
const mobileMedia = matchMedia('(max-width: 600px)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let manuallyPaused = false;
let animationFrame = 0;
let videoHasPlayed = false;
let ended = false;
let skyColors = null;
fetch('sky-colors.json').then(response=>response.json()).then(colors=>{skyColors=colors;setHeroTheme(reduceMotion.matches?10:heroVideo.currentTime);}).catch(()=>{});
function setHeroTheme(time) {
  const q = Math.min(1, Math.max(0, (time - 7.15) / 0.2));
  const channels = [250 + (22-250)*q, 249+(23-249)*q, 243+(20-243)*q].map(Math.round).join(' ');
  const inverse = [22+(250-22)*q, 23+(249-23)*q, 20+(243-20)*q].map(Math.round).join(' ');
  document.documentElement.style.setProperty('--hero-ink', channels);
  document.documentElement.style.setProperty('--hero-button-ink', inverse);
  hero.style.setProperty('--shade', String(1-Math.min(1, Math.max(0, (time-6.3)/2.3))));
  if (skyColors && mobileMedia.matches) {
    const sample=Math.min(skyColors.length-1,time*5);
    const a=skyColors[Math.floor(sample)],b=skyColors[Math.min(skyColors.length-1,Math.ceil(sample))],fraction=sample-Math.floor(sample);
    const blend=(side)=>a[side].map((value,i)=>Math.round(value+(b[side][i]-value)*fraction)).join(' ');
    hero.style.setProperty('--mobile-sky-left',blend(0));hero.style.setProperty('--mobile-sky-right',blend(1));
  }
}
function updateVideo() {
  setHeroTheme(heroVideo.currentTime);
  if (!heroVideo.paused && !heroVideo.ended) animationFrame = requestAnimationFrame(updateVideo);
}
function setControl(state) {
  const names = { play: ['play','Воспроизвести анимацию'], pause: ['pause','Приостановить анимацию'], replay: ['replay','Посмотреть анимацию ещё раз'] };
  $('use', videoControl).setAttribute('href', `#i-${names[state][0]}`);
  videoControl.setAttribute('aria-label', names[state][1]);
}
function loadVideo() {
  cancelAnimationFrame(animationFrame);
  heroVideo.pause();
  const prefix = mobileMedia.matches ? 'mobile' : 'desktop';
  heroVideo.poster = `assets/hero-${prefix}-${reduceMotion.matches ? 'end' : 'start'}.webp`;
  ended = false; videoHasPlayed = false; manuallyPaused = false;
  if (reduceMotion.matches) {
    heroVideo.removeAttribute('src'); heroVideo.load();
    setHeroTheme(10); setControl('play');
    return;
  }
  setHeroTheme(0); setControl('pause');
  heroVideo.src = mobileMedia.matches ? heroVideo.dataset.mobile : heroVideo.dataset.desktop;
  heroVideo.muted = true;
  heroVideo.load();
  heroVideo.play().catch(() => { setControl('play'); });
}
heroVideo.addEventListener('play', () => { videoHasPlayed = true; ended = false; setControl('pause'); cancelAnimationFrame(animationFrame); updateVideo(); });
heroVideo.addEventListener('pause', () => { cancelAnimationFrame(animationFrame); if (!ended) setControl('play'); });
heroVideo.addEventListener('ended', () => { ended = true; setHeroTheme(10); setControl('replay'); });
heroVideo.addEventListener('error', () => {
  heroVideo.removeAttribute('src');
  heroVideo.poster = `assets/hero-${mobileMedia.matches?'mobile':'desktop'}-end.webp`;
  setHeroTheme(10); setControl('replay');
});
videoControl.addEventListener('click', () => {
  if (!heroVideo.getAttribute('src')) {
    heroVideo.src = mobileMedia.matches ? heroVideo.dataset.mobile : heroVideo.dataset.desktop;
    heroVideo.load(); heroVideo.play().catch(() => setControl('play')); return;
  }
  if (ended) { heroVideo.currentTime = 0; setHeroTheme(0); }
  if (heroVideo.paused) { manuallyPaused = false; heroVideo.play().catch(() => setControl('play')); }
  else { manuallyPaused = true; heroVideo.pause(); }
});
const visibility = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) heroVideo.pause();
  else if (videoHasPlayed && !ended && !manuallyPaused && !document.hidden) heroVideo.play().catch(() => {});
}, { threshold: 0.1 });
visibility.observe(hero);
document.addEventListener('visibilitychange', () => { if (document.hidden) heroVideo.pause(); else if (videoHasPlayed && !ended && !manuallyPaused && hero.getBoundingClientRect().bottom>0) heroVideo.play().catch(() => {}); });
mobileMedia.addEventListener('change', () => { closeMenu(); loadVideo(); });
reduceMotion.addEventListener('change', loadVideo);
loadVideo();

// One city selection keeps the tariff, office contact and pickup points consistent.
function renderTariff(key) {
  const city = cities[key];
  const almaty = key === 'almaty';
  const price = almaty ? '3,5–3,75' : '3,9–4,1';
  const days = almaty ? '6–9' : '8–13';
  $('#tariff-city-value').textContent = city.name;
  $$('[data-tariff-city]').forEach(option => option.setAttribute('aria-selected', String(option.dataset.tariffCity === key)));
  $('#tariff-express-title').textContent = `Экспресс · ${city.name}`;
  $('#tariff-price').textContent = price;
  $('#tariff-days').textContent = days;
  $('#tariff-condition').textContent = almaty ? 'Точную ставку в этом диапазоне уточнит менеджер.' : 'Свыше 20 кг — 3,9 $/кг.';
  $('#tariff-door').hidden = almaty;
  $('#tariff-contact').href = whatsappLink(key, `Здравствуйте! Хочу уточнить экспресс-доставку из Китая. Город получения: ${city.name}. Тариф на сайте: ${price} $/кг.`);
  $('#tariff-contact').setAttribute('aria-label', `Написать в WhatsApp · ${city.name}`);
  $('#tariff-business-contact').href = whatsappLink(key, `Здравствуйте! Хочу обсудить коммерческую доставку партии от 50 кг из Китая. Город получения: ${city.name}.`);
}
const tariffCityPicker = $('#tariff-city-picker');
const tariffCityButton = $('#tariff-city');
const tariffCityList = $('#tariff-city-options');
const tariffCityOptions = $$('[data-tariff-city]');
function closeTariffCities(restoreFocus = false) {
  tariffCityList.hidden = true;
  tariffCityButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) tariffCityButton.focus({ preventScroll: true });
}
function openTariffCities() {
  tariffCityList.hidden = false;
  tariffCityButton.setAttribute('aria-expanded', 'true');
  const rect = tariffCityButton.getBoundingClientRect();
  const listHeight = tariffCityList.offsetHeight;
  tariffCityPicker.classList.toggle('opens-above', innerHeight - rect.bottom < listHeight + 16 && rect.top > listHeight + 16);
  tariffCityOptions.find(option => option.getAttribute('aria-selected') === 'true').focus({ preventScroll: true });
}
tariffCityButton.addEventListener('click', () => {
  if (tariffCityList.hidden) openTariffCities();
  else closeTariffCities();
});
tariffCityButton.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    openTariffCities();
  }
});
tariffCityOptions.forEach(option => option.addEventListener('click', () => {
  renderPoints(option.dataset.tariffCity);
  closeTariffCities(true);
}));
tariffCityList.addEventListener('keydown', event => {
  const index = tariffCityOptions.indexOf(document.activeElement);
  let next = index;
  if (event.key === 'ArrowDown') next = (index + 1) % tariffCityOptions.length;
  else if (event.key === 'ArrowUp') next = (index - 1 + tariffCityOptions.length) % tariffCityOptions.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = tariffCityOptions.length - 1;
  else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (index >= 0) tariffCityOptions[index].click();
    return;
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeTariffCities(true);
    return;
  } else if (event.key === 'Tab') {
    closeTariffCities(true);
    return;
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const matches = tariffCityOptions.map((option, i) => ({ option, i })).filter(({ option }) => option.textContent.trim().toLocaleLowerCase('ru').startsWith(event.key.toLocaleLowerCase('ru')));
    next = (matches.find(({ i }) => i > index) || matches[0])?.i ?? index;
  } else return;
  event.preventDefault();
  tariffCityOptions[next]?.focus({ preventScroll: true });
});
document.addEventListener('pointerdown', event => {
  if (!tariffCityPicker.contains(event.target)) closeTariffCities();
});
tariffCityPicker.addEventListener('focusout', event => {
  if (!tariffCityPicker.contains(event.relatedTarget)) closeTariffCities();
});

const pickupPanels = $$('[data-pickup-city]');
pickupPanels.forEach(panel => { $('h3', panel).hidden = true; });
let pickupCity = 'astana';
function renderPoints(key) {
  pickupCity = key;
  renderTariff(key);
  const panel = pickupPanels.find(panel => panel.dataset.pickupCity === key);
  const count = $$('.pickup-row', panel).length;
  const label = count === 1 ? 'пункт выдачи' : count < 5 ? 'пункта выдачи' : 'пунктов выдачи';
  $('#pickup-count').textContent = `${cities[key].name} · ${count} ${label}`;
  pickupPanels.forEach(cityPanel => { cityPanel.hidden = cityPanel !== panel; });
  $$('[data-city]').forEach(button => {
    const active = button.dataset.city === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
$$('[data-city]').forEach((button)=>button.addEventListener('click',()=>renderPoints(button.dataset.city)));
$('#pickup-contact').addEventListener('click',()=>{
  dialogTitle.textContent=`Пункт выдачи · ${cities[pickupCity].name}`;
  dialogDescription.textContent='Уточните график и удобный адрес перед визитом.';
  dialogContent.innerHTML=`<a class="button button-orange quote-send" href="${whatsappLink(pickupCity,`Здравствуйте! Подскажите, пожалуйста, график и удобный пункт выдачи в городе ${cities[pickupCity].name}.`)}" target="_blank" rel="noopener">${whatsappIcon}Написать своему офису</a>`;showDialog();
});
renderPoints(pickupCity);

const reviewDialog=$('#review-dialog');
$$('[data-review]').forEach(button=>button.addEventListener('click',()=>{
  $('#review-full').src=`assets/review-${button.dataset.review}.webp`;
  reviewDialog.showModal();document.body.classList.add('modal-open');
}));
$('[data-close-review]').addEventListener('click',()=>reviewDialog.close());
reviewDialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
reviewDialog.addEventListener('click',event=>{if(event.target===reviewDialog)reviewDialog.close();});

$$('[data-partner]').forEach(button=>button.addEventListener('click',()=>{
  const pvz=button.dataset.partner==='pvz';
  dialogTitle.textContent=pvz?'Откроем новый пункт':'Давайте сотрудничать';
  dialogDescription.textContent='Заполните несколько деталей. Подготовим сообщение, которое вы сможете отправить в WhatsApp.';
  dialogContent.innerHTML=`<form class="partner-form" id="partner-form"><label>Как к вам обращаться<input name="name" autocomplete="given-name" maxlength="70" required placeholder="Ваше имя"></label><label>Ваш город<select name="city">${Object.entries(cities).map(([key,city])=>`<option value="${key}">${city.name}</option>`).join('')}</select></label>${pvz?'<label>Адрес или район помещения<input name="location" maxlength="180" required placeholder="Где планируете открыть пункт"></label>':'<label>Формат сотрудничества<select name="format"><option>Блогер</option><option>Амбассадор</option><option>Обучение маркетплейсам</option><option>Промокод</option><option>Другое</option></select></label>'}<label>Комментарий<textarea name="comment" maxlength="1000" placeholder="Расскажите о своём предложении"></textarea></label><button class="button button-orange" type="submit">Подготовить сообщение ${icon('arrow')}</button><p class="dialog-footnote">Данные используются только для подготовки сообщения в вашем браузере. На следующем шаге вы сами отправите их в WhatsApp.</p></form>`;
  showDialog();
  $('#partner-form').addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.currentTarget;
    if(!form.reportValidity())return;
    const data=new FormData(form),key=data.get('city');
    const message=`Здравствуйте! Хочу ${pvz?'открыть пункт выдачи':'стать партнёром'} Silkway Cargo.\nИмя: ${data.get('name').trim()}.\nГород: ${cities[key].name}.\n${pvz?'Адрес / район: '+data.get('location').trim():'Формат: '+data.get('format')}.\nКомментарий: ${data.get('comment').trim()||'—'}`;
    dialogTitle.textContent='Сообщение подготовлено';dialogDescription.textContent='Откройте WhatsApp, проверьте сообщение и нажмите «Отправить».';
    dialogContent.replaceChildren();
    const link=document.createElement('a');link.className='button button-orange quote-send';link.href=whatsappLink(key,message);link.target='_blank';link.rel='noopener';link.innerHTML=`${whatsappIcon}Перейти в WhatsApp`;
    const note=document.createElement('p');note.className='dialog-footnote';note.textContent='Заявка ещё не отправлена. Отправка происходит в WhatsApp.';
    dialogContent.append(link,note);link.focus();
  });
}));
$('#privacy-button').addEventListener('click',()=>{
  dialogTitle.textContent='Конфиденциальность';
  dialogDescription.textContent='Как работает эта страница';
  dialogContent.innerHTML='<div class="privacy-copy"><p>Формы работают в вашем браузере. Страница не сохраняет введённые имя или комментарий на сервере и не отправляет их автоматически.</p><p>Когда вы переходите в WhatsApp, приложение получает подготовленное сообщение. Его отправляете вы; дальнейшее общение происходит напрямую с Silkway Cargo по правилам выбранного сервиса.</p><p>Ссылки на магазины приложений, YouTube, социальные сети и 2GIS открывают внешние сервисы с собственными правилами обработки данных. На этой версии страницы нет рекламных пикселей и аналитических cookies.</p><p>По вопросам доставки и обработки обращений: <a href="mailto:support@silkway-cargo.com">support@silkway-cargo.com</a>.</p></div>';
  showDialog();
});

// A user-controlled explanation, not a live shipment tracker. Nothing auto-advances.
const journey = $('#order-journey');
const journeyTabs = $$('[data-journey-step]', journey);
const journeyPanels = $$('.journey-panel', journey);
const journeyPhotos = $$('[data-step-photo]', journey);
const journeyDescriptions = [
  'Регистрация в приложении и получение личного ID-кода',
  'Оформление адреса и маркировка посылки для склада в Китае',
  'Сканирование посылки и обновление статуса на складе',
  'Получение посылки в пункте выдачи'
];
let journeyStep = 1;
function setJourneyStep(step, focusTab = false) {
  journeyStep = Math.max(1, Math.min(4, step));
  journey.dataset.stage = String(journeyStep);
  journey.style.setProperty('--journey-progress', `${(journeyStep - 1) / 3 * 100}%`);
  journeyTabs.forEach((tab, index) => {
    const selected = index + 1 === journeyStep;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.classList.toggle('is-before', index + 1 < journeyStep);
  });
  journeyPanels.forEach((panel, index) => {
    const inactive = index + 1 !== journeyStep;
    panel.hidden = inactive;
    panel.inert = inactive;
    panel.setAttribute('aria-hidden', String(inactive));
  });
  $('#journey-art').setAttribute('aria-label', journeyDescriptions[journeyStep - 1]);
  journeyPhotos.forEach((photo, index) => photo.classList.toggle('is-active', index + 1 === journeyStep));
  $('#journey-current').textContent = `${journeyStep} из 4`;
  $('#journey-prev').disabled = journeyStep === 1;
  $('#journey-next').disabled = journeyStep === 4;
  if (focusTab) journeyTabs[journeyStep - 1].focus({ preventScroll: true });
}
journeyTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setJourneyStep(index + 1));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === 3 ? 1 : index + 2;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? 4 : index;
    if (event.key === 'Home') next = 1;
    if (event.key === 'End') next = 4;
    if (next !== undefined) { event.preventDefault(); setJourneyStep(next, true); }
  });
});
function navigateJourney(step) {
  setJourneyStep(step);
  if (mobileMedia.matches) {
    journeyTabs[journeyStep - 1].focus({preventScroll:true});
    $('.journey-tabs',journey).scrollIntoView({block:'start',behavior:reduceMotion.matches?'auto':'smooth'});
  } else if (journeyStep === 1 || journeyStep === 4) {
    journeyTabs[journeyStep - 1].focus({preventScroll:true});
  }
}
$('#journey-prev').addEventListener('click', () => navigateJourney(journeyStep - 1));
$('#journey-next').addEventListener('click', () => navigateJourney(journeyStep + 1));
setJourneyStep(1);

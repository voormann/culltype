let liste = [];
let ordet = 0;
let poeng = 0;
let trykk = 0;
let seconds = 59;
let timer = false;
let suspended = false;
let randomize = true;
let beginMsg = "Start by typing the first word";

const uiEntry = document.querySelector('input');
const uiTid = document.querySelector('span');
const uiWords = document.querySelector('.words');
const uiWarn = document.querySelector('.warn');
const uiBackdrop = document.querySelector('aside');
const uiList = document.querySelector('textarea');

function restart(entry) {
    clearInterval(timer);

    if (randomize) {
        for (let i = liste.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = liste[i];

            liste[i] = liste[j];
            liste[j] = temp;
        }
    }

    ordet = 0;
    poeng = 0;
    trykk = 0;
    seconds = 59;
    timer = false;

    uiTid.firstChild.data = "01:00";
    uiWords.firstChild.data = liste.slice(0, 25).join(" ");
    uiEntry.value = "";
    uiEntry.focus();

    if (entry) {
        uiEntry.placeholder = beginMsg;
        uiEntry.className = '';
    }
}

function storForbokstav(char) {
    return char !== char.toLowerCase();
}

function removeSuspension() {
    suspended = false;

    uiEntry.className = '';
    uiEntry.value = "";
    uiEntry.placeholder = beginMsg;
}

function tick() {
    seconds--;

    if (seconds < 0) {
        let tally = ordet;

        for (let i = 0; i < poeng; i++) {
            if (storForbokstav(liste[i][0])) {
                tally += liste[i].length + 1;
            } else {
                tally += liste[i].length;
            }
        }

        document.querySelector('.opm').firstChild.data = Math.round(tally / 5);
        document.querySelector('.noy').firstChild.data = Math.round((tally / trykk) * 100) + "%";
        document.querySelector('.trykk').firstChild.data = trykk;
        document.querySelector('.stats').style.opacity = '1';
        uiEntry.className = 'suspended';

        suspended = true;

        window.setTimeout(removeSuspension, 1500);

        restart(false);

        return;
    }

    uiTid.firstChild.data = "00:" + (seconds < 10 ? "0" + seconds : seconds);
}

function customize() {
    const customText = uiList.value;
    let customList = [];

    if (customText[0] === "-") {
        customList = customText.substring(1).split(/[\s\n]+/);
        randomize = false;
    } else {
        customList = customText.split(/[\s,;\n]+/);
        randomize = true;
    }

    if (customList[0] === "") {
        uiList.focus();
        uiWarn.hidden = false;

        window.requestAnimationFrame(() => {
            uiWarn.style.animation = 'none';

            window.requestAnimationFrame(() => {
                uiWarn.style.animation = 'taylor-swift 500ms linear forwards';
            });
        });

        return;
    }

    if (customList.length < 300) {
        while (customList.length < 300)
            customList.push(...customList);

        liste = customList.slice(0, 300);
    } else {
        liste = [...customList];
    }

    restart(true);

    uiBackdrop.hidden = true;
    uiWarn.hidden = true;
    uiList.removeAttribute('style');
}

uiEntry.addEventListener('keydown', (event) => {
    if (suspended || event.repeat)
        return;

    if (!timer && event.key.length === 1) {
        timer = window.setInterval(tick, 1000);
        trykk = 0;

        uiTid.firstChild.data = "00:59";
        uiEntry.placeholder = "";
    }

    trykk++;

    if (event.key === ' ') {
        if (liste[ordet] === uiEntry.value)
            poeng++;

        ordet++;

        uiEntry.className = '';
        uiEntry.value = "";
        uiWords.firstChild.data = liste.slice(ordet, ordet + 25).join(" ");

        event.preventDefault();
    } else if (event.key === 'Tab') {
        restart(true);

        event.preventDefault();
    }
});

uiEntry.addEventListener('input', () => {
    if (!suspended)
        uiEntry.className = liste[ordet].startsWith(uiEntry.value) ? '' : 'bad';
});

function langSelect(taal) {
    beginMsg = lang[taal].type;

    uiList.placeholder = lang[taal].info;

    for (const [key, value] of Object.entries(lang[taal].ui))
        document.querySelector(`.${key}`).firstChild.data = value;

    randomize = true;
}

document.body.addEventListener('click', (event) => {
    const selected = event.target.getAttribute('class');
    
    if (selected === 'reset') {
        restart(true);
    } else if (selected === 'custom') {
        uiBackdrop.hidden = false;
        uiList.focus();
    } else if (selected === 'apply') {
        customize();
    } else if (selected === 'cancel' || event.target === uiBackdrop) {
        uiBackdrop.hidden = true;
        uiWarn.hidden = true;
        uiList.removeAttribute('style');
        uiEntry.focus();
    } else if (['en', 'no', 'nl', 'de'].includes(selected)) {
        liste = lang[selected].words.split(" ");

        langSelect(selected);
        restart(true);
    }
});

(function () {
    const language = window.navigator.language.slice(0, 2);
    let assessment = ['no', 'nb', 'nn', 'nl', 'de'].find(item => item === language) || 'en';

    if (['nb', 'nn'].includes(assessment))
        assessment = 'no';

    liste = lang[assessment].words.split(" ");

    if (assessment !== 'en')
        langSelect(assessment);

    restart(true);
})();
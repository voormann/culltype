let liste = [];
let ordet = 0;
let poeng = 0;
let trykk = 0;
let seconds = 59;
let timer = false;
let randomize = true;
let beginMsg = "Start by typing the first word";

const uiEntry = document.querySelector('input');
const uiWords = document.querySelector('header');
const uiWarn = document.querySelector('.warn');
const uiBackdrop = document.querySelector('aside');
const uiList = document.querySelector('textarea');

function mergeWords(cycle) {
    let freight = liste[cycle];

    while (freight.length < 60)
        freight += " " + liste[++cycle];

    return freight;
}

function amend() {
    uiEntry.placeholder = beginMsg;
    uiEntry.className = '';
    uiEntry.focus();
}

function restart(entry = true) {
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

    clearInterval(timer);
    timer = false;

    uiWords.firstChild.nodeValue = mergeWords(0);
    uiEntry.nextSibling.nodeValue = "01:00";
    uiEntry.value = "";

    if (entry)
        amend();
}

function tick() {
    if (--seconds < 0) {
        document.querySelector('.wpm').nextSibling.nodeValue = Math.round(poeng / 5);
        document.querySelector('.acc').nextSibling.nodeValue = Math.round((poeng / trykk) * 100) + "%";
        document.querySelector('.key').nextSibling.nodeValue = trykk;
        document.querySelector('footer').style.opacity = '1';
        uiEntry.blur();

        setTimeout(amend, 1500);
        restart(false);

        return;
    }

    uiEntry.nextSibling.nodeValue = "00:" + (seconds < 10 ? "0" + seconds : seconds);
}

function customize() {
    const excerpt = uiList.value;
    let indices = [];

    if (excerpt[0] === "-") {
        indices = excerpt.substring(1).split(/\s+/).filter(Boolean);
        randomize = false;
    } else {
        indices = excerpt.split(/[\s,;]+/).filter(Boolean);
        randomize = true;
    }

    if (indices.length === 0) {
        uiList.focus();
        uiWarn.hidden = false;

        return;
    }

    while (indices.length < 300)
        indices.push(...indices);

    liste = [...indices];

    restart();
    fulfill('toggle');
}

function liten(char) {
    return char === char.toLowerCase();
}

uiEntry.addEventListener('keyup', (event) => {
    trykk++;

    if (event.key === ' ') {
        const index = uiEntry.value;

        if (liste[ordet] + " " === index) {
            if (liten(index[0])) {
                poeng += index.length;
            } else {
                poeng += index.length + 1;
            }
        }

        uiEntry.value = "";
        uiEntry.className = '';
        uiWords.firstChild.nodeValue = mergeWords(++ordet);
    } else if (event.key === 'Enter') {
        restart();
    } else {
        if (!timer) {
            timer = setInterval(tick, 1000);

            uiEntry.nextSibling.nodeValue = "00:59";
            uiEntry.placeholder = "";
        }

        uiEntry.className = liste[ordet].startsWith(uiEntry.value) ? '' : 'bad';
    }
});

function localize(taal, verander = true) {
    if (verander) {
        uiList.placeholder = lang[taal].info;

        for (const [key, value] of Object.entries(lang[taal].ui))
            document.querySelector(`.${key}`).firstChild.nodeValue = value;

        beginMsg = lang[taal].type;
        randomize = true;
    }

    liste = lang[taal].words.split(" ");

    restart();
}

function fulfill(event) {
    const selected = event.target ? event.target.classList[0] : event;

    if (!selected)
        return;

    if (selected === 'reset') {
        restart();
    } else if (selected === 'toggle') {
        uiBackdrop.hidden = !uiBackdrop.hidden;
        (uiBackdrop.hidden ? uiEntry : uiList).focus();
        uiWarn.hidden = true;
        uiList.removeAttribute('style');
    } else if (selected === 'apply') {
        customize();
    } else if (selected.length === 2) {
        localize(selected);
    }
}

document.body.addEventListener('click', fulfill);

(function () {
    const presume = navigator.language.slice(0, 2).replace(/nb|nn/, 'no');

    if (['no', 'nl', 'de'].includes(presume)) {
        localize(presume);
    } else {
        localize('en', false);
    }
})();
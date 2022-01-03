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
const uiBackdrop = document.querySelector('.close');
const uiList = document.querySelector('textarea');

function mergeWords(cycle) {
    let freight = liste[cycle];

    while (freight.length < 60)
        freight += " " + liste[++cycle];

    return freight;
}

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

    uiTid.firstChild.nodeValue = "01:00";
    uiWords.firstChild.nodeValue = mergeWords(0);
    uiEntry.value = "";
    uiEntry.focus();

    if (entry) {
        uiEntry.placeholder = beginMsg;
        uiEntry.className = '';
    }
}

function removeSuspension() {
    suspended = false;

    uiEntry.className = '';
    uiEntry.value = "";
    uiEntry.placeholder = beginMsg;
}

function tick() {
    if (--seconds < 0) {
        poeng += ordet;

        document.querySelector('.opm').firstChild.nodeValue = Math.round(poeng / 5);
        document.querySelector('.noy').firstChild.nodeValue = Math.round((poeng / trykk) * 100) + "%";
        document.querySelector('.trykk').firstChild.nodeValue = trykk;
        document.querySelector('.stats').style.opacity = '1';
        uiEntry.className = 'suspended';

        suspended = true;

        window.setTimeout(removeSuspension, 1500);
        restart(false);

        return;
    }

    uiTid.firstChild.nodeValue = "00:" + (seconds < 10 ? "0" + seconds : seconds);
}

function customize() {
    const excerpt = uiList.value;
    let indices = [];

    if (excerpt[0] === "-") {
        indices = excerpt.substring(1).split(/[\s\n]+/);
        randomize = false;
    } else {
        indices = excerpt.split(/[\s,;\n]+/);
        randomize = true;
    }

    if (indices[0] === "") {
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

    while (indices.length < 300)
        indices.push(...indices);

    liste = [...indices];

    restart(true);

    uiBackdrop.hidden = true;
    uiWarn.hidden = true;
    uiList.removeAttribute('style');
}

function liten(char) {
    return char === char.toLowerCase();
}

uiEntry.addEventListener('keydown', (event) => {
    if (suspended || event.repeat)
        return;

    if (!timer) {
        timer = window.setInterval(tick, 1000);

        uiTid.firstChild.nodeValue = "00:59";
        uiEntry.placeholder = "";
    }

    trykk++;

    if (event.key === ' ') {
        const index = liste[ordet];

        if (index === uiEntry.value) {
            if (liten(index[0])) {
                poeng += index.length;
            } else {
                poeng += index.length + 1;
            }
        }

        uiEntry.value = "";
        uiEntry.className = '';
        uiWords.firstChild.nodeValue = mergeWords(++ordet);

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

function localize(taal, verander) {
    if (verander) {
        uiList.placeholder = lang[taal].info;

        for (const [key, value] of Object.entries(lang[taal].ui))
            document.querySelector(`.${key}`).firstChild.nodeValue = value;

        beginMsg = lang[taal].type;
        randomize = true;
    }

    liste = lang[taal].words.split(" ");

    restart(true);
}

document.body.addEventListener('click', (event) => {
    const selected = event.target.classList[0];

    if (!selected)
        return;
    
    if (selected === 'reset') {
        restart(true);
    } else if (selected === 'custom') {
        uiBackdrop.hidden = false;
        uiList.focus();
    } else if (selected === 'apply') {
        customize();
    } else if (selected === 'close') {
        uiBackdrop.hidden = true;
        uiWarn.hidden = true;
        uiList.removeAttribute('style');
        uiEntry.focus();
    } else if (selected.length === 2) {
        localize(selected, true);
    }
});

(function () {
    let presume = window.navigator.language.slice(0, 2);

    if (['nb', 'nn'].includes(presume))
        presume = 'no';

    if (['no', 'nl', 'de'].includes(presume)) {
        localize(presume, true);
    } else {
        localize('en', false);
    }
})();
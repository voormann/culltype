let liste = [];
let ordet = 0;
let poeng = 0;
let trykk = 0;
let seconds = 60;
let timer = false;
let suspended = false;
let randomize = true;
let miss = false;
let beginMsg = "Begin by typing the first word";
let focusMsg = "Click to focus";

const uiEntry = document.getElementById('entry');
const uiTid = document.getElementById('tid');
const uiWords = document.getElementById('words');
const uiWarn = document.getElementById('warn');
const uiBackdrop = document.getElementById('backdrop');
const uiList = document.getElementById('customlist');

function restart() {
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
    seconds = 60;
    timer = false;
    miss = false;

    uiTid.firstChild.data = "01:00";
    uiWords.firstChild.data = liste.slice(0, 25).join(" ");
    uiEntry.value = "";
    uiEntry.placeholder = beginMsg;
    uiEntry.className = '';
}

function removeSuspension() {
    suspended = false;
    miss = false;

    uiEntry.className = '';
    uiEntry.value = "";
}

function tick() {
    seconds--;

    if (seconds <= 0) {
        document.getElementById('opm').firstChild.data = Math.round((poeng + ordet) / 5);
        document.getElementById('noy').firstChild.data = Number((((poeng + ordet) / trykk) * 100).toFixed(2)) + "%";
        document.getElementById('trykk').firstChild.data = trykk;
        document.getElementById('stats').className = '';

        restart();

        uiEntry.className = 'suspended';

        suspended = true;

        window.setTimeout(removeSuspension, 1500);

        return;
    }

    document.getElementById('tid').firstChild.data = "00:" + (seconds < 10 ? "0" + seconds : seconds);
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
        uiWarn.style.animation = 'none';
        uiWarn.offsetWidth;
        uiWarn.style.animation = 'taylor-swift 500ms linear forwards';
        uiWarn.className = '';

        return;
    }

    if (customList.length < 300) {
        while (customList.length < 300)
            customList.push(...customList);

        if (customList.length > 300)
            customList = customList.slice(0, 300);
    }
    
    liste = [...customList];

    restart();

    uiBackdrop.className = 'hidden';
    uiWarn.className = 'hidden';
    uiWarn.removeAttribute('style');
    uiList.removeAttribute('style');
}

function storForbokstav(ord) {
    return ord[0] !== ord[0].toLowerCase();
}

uiEntry.addEventListener('keydown', event => {
    if (suspended || event.repeat)
        return;

    if (!timer) {
        timer = window.setInterval(tick, 1000);

        uiEntry.placeholder = focusMsg;
    }

    trykk++;

    if (event.key === ' ') {
        if (liste[ordet] === uiEntry.value) {
            if (storForbokstav(liste[ordet])) {
                poeng += liste[ordet].length + 1;
            } else {
                poeng += liste[ordet].length;
            }
        }

        ordet++;

        if (miss) {
            miss = false;
            
            uiEntry.className = '';
        }

        uiWords.firstChild.data = liste.slice(ordet, ordet + 25).join(" ");
        uiEntry.value = "";

        event.preventDefault();
    } else if (event.key === 'Tab') {
        restart();

        event.preventDefault();
    }
});

uiEntry.addEventListener('input', event => {
    if (suspended)
        return;

    if (liste[ordet].indexOf(uiEntry.value) === 0) {
        if (miss) {
            miss = false;

            uiEntry.className = '';
        }
    } else {
        if (!miss) {
            miss = true;

            uiEntry.className = 'bad';
        }
    }
});

function langSelect(taal) {
    beginMsg = lang[taal].type;
    focusMsg = lang[taal].focus;
    liste = [...lang[taal].entries];

    uiList.placeholder = lang[taal].info;

    for (const [key, value] of Object.entries(lang[taal].ui))
        document.getElementById(key).firstChild.data = value;

    randomize = true;
}

document.body.addEventListener('click', event => {
    if (suspended)
        return;

    const selected = event.target.id;
    
    if (selected === 'reset') {
        restart();
    } else if (selected === 'custom') {
        uiBackdrop.className = '';
    } else if (selected === 'apply') {
        customize();
    } else if (selected === 'cancel' || selected === 'backdrop') {
        uiBackdrop.className = 'hidden';
        uiWarn.className = 'hidden';
        uiWarn.removeAttribute('style');
        uiList.removeAttribute('style');
    } else if (['en', 'no', 'nl', 'de'].includes(selected)) {
        langSelect(selected);
        restart();
    }
});

(function () {
    const availableLanguages = ['no', 'nb', 'nn', 'nl', 'de'];

    let languageAssessment = [
        ...(window.navigator.languages || []),
        window.navigator.language,
        window.navigator.browserLanguage,
        window.navigator.userLanguage,
        window.navigator.systemLanguage
    ]
    .filter(Boolean)
    .map(language => language.substr(0, 2))
    .find(language => availableLanguages.includes(language)) || 'en';

    if (['nb', 'nn'].includes(languageAssessment))
        languageAssessment = 'no';

    liste = [...lang[languageAssessment].entries];

    if (languageAssessment !== 'en')
        langSelect(languageAssessment);

    restart();
})();
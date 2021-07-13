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
        document.getElementById('noy').firstChild.data = Math.round(((poeng + ordet) / trykk) * 100) + "%";
        document.getElementById('trykk').firstChild.data = trykk;
        document.getElementById('stats').className = '';

        restart();

        uiEntry.className = 'suspended';

        suspended = true;

        window.setTimeout(removeSuspension, 1500);

        return;
    }

    uiTid.firstChild.data = "00:" + (seconds < 10 ? "0" + seconds : seconds);
}

function customize() {
    const customText = document.getElementById('customlist').value;
    let customList = [];

    if (customText[0] === "-") {
        customList = customText.substring(1).split(/[\s\n]+/);
        randomize = false;
    } else {
        customList = customText.split(/[\s,;\n]+/);
        randomize = true;
    }

    if (customList[0] === "") {
        uiWarn.className = '';

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

        if (customList.length > 300)
            customList = customList.slice(0, 300);
    }
    
    liste = [...customList];

    restart();

    document.getElementById('backdrop').className = 'hidden';
    uiWarn.className = 'hidden';
    document.getElementById('customlist').removeAttribute('style');
}

function storForbokstav(char) {
    return char !== char.toLowerCase();
}

uiEntry.addEventListener('keydown', (event) => {
    if (suspended || event.repeat)
        return;

    if (!timer) {
        timer = window.setInterval(tick, 1000);

        uiEntry.placeholder = focusMsg;
    }

    trykk++;

    if (event.key === ' ') {
        if (liste[ordet] === uiEntry.value) {
            if (storForbokstav(liste[ordet][0])) {
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

        uiEntry.value = "";
        uiWords.firstChild.data = liste.slice(ordet, ordet + 25).join(" ");

        event.preventDefault();
    } else if (event.key === 'Tab') {
        restart();

        event.preventDefault();
    }
});

uiEntry.addEventListener('input', () => {
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

    document.getElementById('customlist').placeholder = lang[taal].info;

    for (const [key, value] of Object.entries(lang[taal].ui))
        document.getElementById(key).firstChild.data = value;

    randomize = true;
}

document.body.addEventListener('click', (event) => {
    if (suspended)
        return;

    const selected = event.target.id;
    
    if (selected === 'reset') {
        restart();
    } else if (selected === 'custom') {
        document.getElementById('backdrop').className = '';
    } else if (selected === 'apply') {
        customize();
    } else if (selected === 'cancel' || selected === 'backdrop') {
        document.getElementById('backdrop').className = 'hidden';
        uiWarn.className = 'hidden';
        document.getElementById('customlist').removeAttribute('style');
    } else if (['en', 'no', 'nl', 'de'].includes(selected)) {
        langSelect(selected);
        restart();
    }
});

(function () {
    const language = window.navigator.language.slice(0, 2);
    let assessment = ['no', 'nb', 'nn', 'nl', 'de'].find(item => item === language) || 'en';

    if (['nb', 'nn'].includes(assessment))
        assessment = 'no';

    liste = [...lang[assessment].entries];

    if (assessment !== 'en')
        langSelect(assessment);

    restart();
})();
let liste = [];
let ordet = 0;
let poeng = 0;
let trykk = 0;
let seconds = 60;
let timer = false;
let suspended = false;
let randomize = true;
let miss = false;
let focusMsg = "Click to focus";
let placeMsg = "Begin by typing the first word";

function stokk(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function restart() {
    clearInterval(timer);

    if (randomize)
        stokk(liste);

    ordet = 0;
    poeng = 0;
    trykk = 0;
    seconds = 60;
    timer = false;
    miss = false;

    document.getElementById('entry').value = "";
    document.getElementById('tid').firstChild.data = "01:00";
    document.getElementById('entry').placeholder = placeMsg;
    document.getElementById('current').className = '';
    document.getElementById('current').firstChild.data = liste[0];
    document.getElementById('next').firstChild.data = liste.slice(1, 25).join(" ");
}

function removeSuspension() {
    suspended = false;
    miss = false;

    document.getElementById('current').className = '';
    document.getElementById('entry').className = '';
    document.getElementById('entry').value = "";
}

function tick() {
    seconds--;

    if (seconds <= 0) {
        suspended = true;
        document.getElementById('entry').className = 'suspended';
        window.setTimeout(removeSuspension, 1500);

        document.getElementById('opm').firstChild.data = Math.round((poeng + ordet) / 5);
        document.getElementById('noy').firstChild.data = Number((((poeng + ordet) / trykk) * 100).toFixed(2)) + "%";
        document.getElementById('trykk').firstChild.data = trykk;
        document.getElementById('stats').style.visibility = 'visible';

        restart();

        return;
    }

    document.getElementById('tid').firstChild.data = "00:" + (seconds < 10 ? "0" + seconds : seconds);
}

function storForbokstav(ord) {
    return ord[0] !== ord[0].toLowerCase();
}

document.getElementById('entry').addEventListener('keydown', event => {
    if (suspended || event.repeat)
        return;

    if (!timer) {
        timer = window.setInterval(tick, 1000);

        event.target.placeholder = focusMsg;
    }

    trykk++;

    if (event.key === ' ') {
        if (liste[ordet] === event.target.value) {
            poeng += liste[ordet].length;

            if (storForbokstav(liste[ordet]))
                poeng++;
        }

        ordet++;
        miss = false;

        document.getElementById('current').className = '';
        document.getElementById('current').firstChild.data = liste[ordet];
        document.getElementById('next').firstChild.data = liste.slice(ordet + 1, ordet + 25).join(" ");
        event.target.value = "";

        event.preventDefault();
    } else if (event.key === 'Tab') {
        restart();

        event.preventDefault();
    }
});

document.getElementById('entry').addEventListener('input', event => {
    if (liste[ordet].indexOf(event.target.value) === 0) {
        if (miss) {
            miss = false;

            document.getElementById('current').className = '';
        }
    } else {
        if (!miss) {
            miss = true;

            document.getElementById('current').className = 'bad';
        }
    }
});

document.body.addEventListener('click', event => {
    if (suspended)
        return;

    const selected = event.target.id;
    
    if (selected === 'reset') {
        restart();
    } else if (selected === 'custom') {
        document.getElementById('dialog').className = '';
    } else if (selected === 'apply') {
        customize();
    } else if (selected === 'cancel' || selected === 'dialog') {
        document.getElementById('dialog').className = 'hidden';
        document.getElementById('warn').className = 'hidden';
        document.getElementById('customlist').removeAttribute('style');
    } else if (['en', 'no', 'nl', 'de'].includes(selected)) {
        placeMsg = lang[selected].type;
        focusMsg = lang[selected].focus;
        liste = [...lang[selected].entries];

        document.getElementById('customlist').placeholder = lang[selected].info;

        for (const [key, value] of Object.entries(lang[selected].ui))
            document.getElementById(key).firstChild.data = value;

        randomize = true;

        restart();
    }
});

function customize() {
    const customText = document.getElementById('customlist').value;
    let customList = [];

    if (customText.charAt(0) === "-") {
        customList = customText.substring(1).split(/[\s\n]+/);
        randomize = false;
    } else {
        customList = customText.split(/[\s,;\n]+/);
        randomize = true;
    }

    if (customList[0] === "") {
        document.getElementById('warn').className = '';

        return;
    }

    if (customList.length < 300) {
        while (customList.length < 300) {
            customList.push(...customList);
        }

        if (customList.length > 300)
            customList = customList.slice(0, 300);
    }
    
    liste = [...customList];

    restart();

    document.getElementById('dialog').className = 'hidden';
    document.getElementById('warn').className = 'hidden';
}

(function () {
    liste = [...lang.en.entries];
    restart();
})();
let liste = [];
let ordet = 0;
let poeng = 0;
let trykk = 0;
let seconds = 0;
let timer = false;
let suspended = false;
let randomize = true;
let focusMsg = "Click to focus";
let placeMsg = "Begin by typing the first word";

function stokk(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

function restart() {
    clearInterval(timer);

    if (randomize)
        stokk(liste);

    timer = false;
    seconds = 60;
    ordet = 0;
    poeng = 0;
    trykk = 0;

    document.getElementById('entry').value = "";
    document.getElementById('tid').firstChild.data = "01:00";
    document.getElementById('entry').placeholder = placeMsg;
    document.getElementById('current').className = '';
    document.getElementById('current').firstChild.data = liste[0];
    document.getElementById('next').firstChild.data = liste.slice(1, 25).join(" ");
}

function removeSuspension() {
    suspended = false;
    document.getElementById('current').className = '';
    document.getElementById('entry').className = '';
    document.getElementById('entry').value = "";
}

function tick() {
    seconds--;

    if (seconds <= 0) {
        suspended = true;
        document.getElementById('entry').className = 'suspended';
        window.setTimeout(removeSuspension, 2000);

        document.getElementById('opm').firstChild.data = Math.round((poeng + ordet) / 5);
        document.getElementById('acc').firstChild.data = Number((((poeng + ordet) / trykk) * 100).toFixed(2)) + "%";
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
        event.target.placeholder = focusMsg;
        
        timer = window.setInterval(tick, 1000);
    }

    trykk++;

    if (event.key === ' ') {
        if (liste[ordet] === event.target.value) {
            poeng += liste[ordet].length;

            if (storForbokstav(liste[ordet]))
                poeng++;
        }

        ordet++;

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
    const el = document.getElementById('current');

    if (liste[ordet].startsWith(event.target.value)) {
        if (el.className !== '')
            el.className = '';
    } else {
        if (el.className === '')
            el.className = 'bad';
    }
});

document.body.addEventListener('click', event => {
    if (suspended)
        return;

    const selected = event.target.id;
    
    if (selected === 'reset') {
        restart();
    } else if (selected === 'open') {
        document.getElementById('dialog').className = '';
    } else if (selected === 'apply') {
        customize();
    } else if (selected === 'cancel') {
        document.getElementById('dialog').className = 'hidden';
        document.getElementById('error').className = 'hidden';
    } else if (['en', 'no', 'nl', 'de'].includes(selected)) {
        placeMsg = lang[selected].ph_type;
        focusMsg = lang[selected].ph_focus;
        liste = lang[selected].words;

        document.getElementById('JLD_taal').firstChild.data = lang[selected].txt_lang;
        document.getElementById('customlist').placeholder = lang[selected].ph_info;
        document.getElementById('error').firstChild.data = lang[selected].txt_warn;
        document.getElementById('open').firstChild.data = lang[selected].btn_custom;
        document.getElementById('open').setAttribute('data-txt', lang[selected].btn_custom);
        document.getElementById('cancel').firstChild.data = lang[selected].btn_cancel;
        document.getElementById('cancel').setAttribute('data-txt', lang[selected].btn_cancel);
        document.getElementById('apply').firstChild.data = lang[selected].btn_apply;
        document.getElementById('apply').setAttribute('data-txt', lang[selected].btn_apply);
        document.getElementById('JLD_opm').firstChild.data = lang[selected].txt_wpm;
        document.getElementById('JLD_acc').firstChild.data = lang[selected].txt_acc;
        document.getElementById('JLD_trykk').firstChild.data = lang[selected].txt_key;

        randomize = true;
        restart();
    }
});

function customize() {
    let customlist = document.getElementById('customlist').value;

    if (customlist.charAt(0) === "-") {
        customlist = customlist.substring(1);
        customlist = customlist.split(/[\s\n]+/);

        randomize = false;
    } else {
        customlist = customlist.split(/[\s,;\n]+/);

        randomize = true;
    }

    if (customlist[0] === "") {
        document.getElementById('error').className = '';
        return;
    } else if (customlist.length < 300) {
        const refill = customlist;

        while (customlist.length < 300) {
            customlist = customlist.concat(refill);
        }
    
        customlist = customlist.slice(0, 300);
    }
    
    liste = customlist;
    restart();
    document.getElementById('dialog').className = 'hidden';
    document.getElementById('error').className = 'hidden';
}

(function () {
    liste = lang['en'].words;
    restart();
})();
// Polyfill for Internet Explorer
Math.log10 = function(x) {
    return Math.log(x) / Math.LN10;
}



function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

Math.round10 = function(value, exp) {
    return decimalAdjust('round', value, exp);
};

let breakpoints = [
    [0,2],
    [70,3],
    [300,4],
    [1250,6],
    [2550,7],
    [4000,8],
    [6400,10],
    [18000,15],
    [40000,20],
    [65000,25],
    [102000,30],
    [145000,35],
    [190000,40],
    [240000,45],
    [350000,50],
    [485000,55],
    [666000,60],
    [840000,70],
    [1200000,80],
    [1950000,90],
    [2850000,100]
];

function getTP(ancientSouls) {
    for(let i = breakpoints.length - 1; i >= 0; i--) {
        let bp = breakpoints[i];
        if(ancientSouls >= bp[0]) return bp[1];
    }
}

// Breakpoint skips
let goals = [
    [0,75],
    [70,300],
    [300,1250],
    [400,4000],
    [1050,6400],
    [1250,2550],
    [2550,4000],
    [4000,6400],
    [6400,18000],
    [18000,40000],
    [40000,102000],
    [65000,102000],
    [102000,145000],
    [145000,485000],
    [190000,666000],
    [240000,840000],
    [350000,1200000],
    [485000,1950000],
    [666000,2850000],
    [840000,'push']
];

/*
// No Breakpoint skips
let goals = [
    [0,70],
    [70,300],
    [300,1250],
    [1250,2550],
    [2550,4000],
    [4000,6400],
    [6400,18000],
    [18000,40000],
    [40000,65000],
    [65000,102000],
    [102000,145000],
    [145000,190000],
    [190000,240000],
    [240000,350000],
    [350000,485000],
    [485000,666000],
    [666000,840000],
    [840000,1200000],
    [1200000,1950000],
    [1950000,2850000],
    [2850000,'push']
];
*/

function getASGoal(ancientSouls) {
    for(let i = goals.length - 1; i >= 0; i--) {
        let goal = goals[i];
        if(ancientSouls >= goal[0]) return goal[1];
    }
}

function getCostFromLevel(level) {
    return (level+1)*(level/2);
}

function spendAS( ratio, as ) {
    var spendable = ratio*as;
    if( spendable<1 ) return 0;
    return Math.floor( Math.pow( 8*spendable + 1, 0.5 )/2 - 0.5 );
}

function nOS( ancientSouls, transcendentPower, zone ) {
    if(ancientSouls > 20000) {
        ancientSouls -= 11325;
        let pony = spendAS(0.88, ancientSouls);
        ancientSouls -= getCostFromLevel(pony);
        return [150, ancientSouls, pony];
    }
    let hpMultiplier = Math.min(1.545, 1.145 + zone / 500000);
    let hsMultiplier = Math.pow(1 + transcendentPower, 0.2);
    let heroDamageMultiplier = (zone > 1.2e6) ? 1000 : ((zone > 168000) ? 4.5 : 4);
    let heroCostMultiplier = (zone > 1.2e6) ? 1.22 : 1.07;
    let goldToDps = Math.log10(heroDamageMultiplier) / Math.log10(heroCostMultiplier) / 25;
    let dpsToZones = Math.log10(hpMultiplier) - Math.log10(1.15) * goldToDps;
    let chor = 0;
    let phan = 0;
    let pony = 0;

    let chorBuff = 1 / 0.95;

    while (ancientSouls > 0) {
        if (pony < 1) {
            ancientSouls -= ++pony;
            continue;
        } else if (phan < 3) {
            phan++;
            ancientSouls--;
            continue;
        }

        let damageIncrease = (phan + 2) / (phan + 1);
        let zoneIncrease = Math.log10(damageIncrease) / dpsToZones;
        let phanBuff = Math.pow(hsMultiplier, zoneIncrease);

        if (phan < 5) {
            phanBuff *= 1.3;
        }

        if (chor < ancientSouls && chor < 150) {
            let chorBpAS = Math.pow(chorBuff, 1 / (chor + 1));
            if (chorBpAS >= phanBuff) {
                if (pony < ancientSouls) {
                    let ponyBuff = (Math.pow(pony + 1, 2) * 10 + 1) / (Math.pow(pony, 2) * 10 + 1);
                    let ponyBpAS = Math.pow(ponyBuff, 1 / (pony + 1));
                    if (ponyBpAS >= chorBpAS) {
                        ancientSouls -= ++pony;
                        continue;
                    }
                }
                ancientSouls -= ++chor;
                continue;
            }
        }

        if (pony < ancientSouls) {
            let ponyBuff = (Math.pow(pony + 1, 2) * 10 + 1) / (Math.pow(pony, 2) * 10 + 1);
            let ponyBpAS = Math.pow(ponyBuff, 1 / (pony + 1));
            if (ponyBpAS >= phanBuff) {
                ancientSouls -= ++pony;
                continue;
            }
        }

        phan++;
        ancientSouls--;

    }

    return [chor, phan, pony];
}//function nOS

function getInputs() {
    var ancientSouls = parseFloat( $("#ancient_souls").val() || 0 );
    if( !(ancientSouls>=0) ) {
        alert("Calculation failed. Ancient Souls must be a non-negative number.");
        return -1;
    }

    return (ancientSouls);
}

function refresh(test, ancientSouls) {
    //IE sucks
    if (test === undefined || test === null) test = false;
    if (ancientSouls === undefined || ancientSouls === null) ancientSouls = 0;
    //Inputs
    if (!test) {
        ancientSouls = getInputs();
        if( ancientSouls==-1 ) return;
    }

    let transcendentPower = getTP(ancientSouls) / 100;
    let tp = 1 + transcendentPower;
    let targetAS = getASGoal(ancientSouls);
    
    // Find next HZE
    if (targetAS === 'push') {
        let kumaLevel = (ancientSouls / 5) / Math.log10(2);
        let borbLevel = spendAS(ancientSouls, 0.9);
        let a = 2.5 + borbLevel * 0.1 + 0.00008 * borbLevel * borbLevel;
        while (true) {
            let kumaEffect = a * Math.log(kumaLevel + 2.719);
            let zone = (kumaEffect - 8) * 5000 + 500;
            kumaLevel = Math.log10(tp) * (zone / 5 - 20) / Math.log10(2) - 10;
            kumaEffect = a * Math.log(kumaLevel + 2.719);
            let nextZone = (kumaEffect - 8) * 5000 + 500;
            if (nextZone === zone) {
                this.newHze = nextZone;
                break;
            }
        }
    } else {
        this.newHze = (targetAS / 5 - Math.log10(20 * tp / transcendentPower)) / Math.log10(tp) * 5 + 100;
    }
    this.newHze = Math.ceil(this.newHze);

    let newLogHeroSouls = Math.log10(tp) * this.newHze / 5 - 2;

    // Ancient effects
    let ancientLevels = Math.floor(newLogHeroSouls / Math.log10(2) - 3 / Math.log(2)) - 1;
    let nerfs = Math.floor(this.newHze / 500);
    let baseMPZ = 10 + nerfs * 0.1;
    let chancemult = Math.pow(nerfs + 1, -2);
    let baseHP = 10 + nerfs * 0.4;
    let kumaCoeff = (baseMPZ - 2) / Math.log(ancientLevels + 2.719);
    let atmanExp = Math.log(1 / chancemult * 100 - 25) / Math.log(Math.log(ancientLevels + 2.719));
    let bubosCoeff = (baseHP - 5) / Math.log(ancientLevels + 2.719);
    let doraExp = Math.log(1 / chancemult * 100 - 25) / Math.log(Math.log(ancientLevels + 2.719));
    
    // Outsider Caps
    let borbCap = Math.ceil((-0.1 + Math.pow(kumaCoeff / 3125 + 0.0092, 0.5)) * 6250);
    let rhageistCap = Math.ceil(-100 * Math.log(-(atmanExp - 7) / 2 + 1));
    let kariquaCap = Math.ceil((-0.4 + Math.pow(bubosCoeff * 0.00128 + 0.1568, 0.5)) / 0.00064);
    let senakhanCap = Math.ceil(-100 * Math.log(-(doraExp - 6.75) / 2 + 1));
    let orphalasCap = 0;
    
    if (isNaN(rhageistCap)) rhageistCap = spendAS(ancientSouls, 1);
    if (isNaN(senakhanCap)) senakhanCap = spendAS(ancientSouls, 1);

    // Outsider Ratios
    let xyliqilRatio = 0.2;
    let rhageistRatio = 0.4;
    let kariquaRatio = 0.02;
    let orphalasRatio = 0.01;
    let senakhanRatio = 0.05;

    // Outsider Leveling
    let borbLevel = Math.max(0, borbCap);
    if (this.getCostFromLevel(borbLevel) >= ancientSouls) borbLevel = spendAS(ancientSouls - 1, 1);
    this.remainingAncientSouls = ancientSouls - this.getCostFromLevel(borbLevel);
    let xyliqilLevel = Math.max(1, spendAS(this.remainingAncientSouls, xyliqilRatio));
    if (this.remainingAncientSouls === 0) xyliqilLevel = 0;
    if (xyliqilLevel > 196) xyliqilLevel = 196;
    else if (xyliqilLevel > 156) xyliqilLevel = 156;
    let rhageistLevel = Math.min(spendAS(this.remainingAncientSouls, rhageistRatio), rhageistCap, 530);
    let kariquaLevel = Math.min(spendAS(this.remainingAncientSouls, kariquaRatio), kariquaCap);
    let senakhanLevel = Math.min(spendAS(this.remainingAncientSouls, senakhanRatio), senakhanCap, 530);
    let orphalasLevel = spendAS(this.remainingAncientSouls, orphalasRatio);

    this.remainingAncientSouls -= this.getCostFromLevel(xyliqilLevel);
    this.remainingAncientSouls -= this.getCostFromLevel(rhageistLevel);
    this.remainingAncientSouls -= this.getCostFromLevel(kariquaLevel);
    this.remainingAncientSouls -= this.getCostFromLevel(orphalasLevel);
    this.remainingAncientSouls -= this.getCostFromLevel(senakhanLevel);

    // Chor, Phan, and Pony
    let IEsucks = this.nOS(this.remainingAncientSouls, transcendentPower, this.newHze);
    let chorLevel = IEsucks[0];
    let phanLevel = IEsucks[1];
    let ponyLevel = IEsucks[2];

    this.remainingAncientSouls -= this.getCostFromLevel(chorLevel);
    this.remainingAncientSouls -= phanLevel;
    this.remainingAncientSouls -= this.getCostFromLevel(ponyLevel);

    // End of transcension estimates
    let ponyBonus = Math.pow(ponyLevel, 2) * 10;
    let series = 1 / (1 - 1 / (1 + transcendentPower));
    atmanExp = 7 + 2 * (1 - Math.exp(-0.01 * rhageistLevel));
    let buffedPrimalBossChance = Math.pow(Math.log(ancientLevels + 2.719), atmanExp) * chancemult;
    buffedPrimalBossChance = Math.max(5, buffedPrimalBossChance);
    let pbcm = Math.min(buffedPrimalBossChance, 100) / 100;

    newLogHeroSouls = Math.log10(1 + transcendentPower) * (this.newHze - 100) / 5 + Math.log10(ponyBonus + 1) + Math.log10(20 * series * pbcm);
    this.newAncientSouls = Math.max(ancientSouls, Math.floor(newLogHeroSouls * 5));
    this.ancientSoulsDiff = this.newAncientSouls - ancientSouls;
    this.newTranscendentPower = getTP(this.newAncientSouls);

    //test log
    var unspent = this.remainingAncientSouls;
    if (test) {
        return (JSON.stringify({
            ancientSouls: ancientSouls,
            expectedLevels: [xyliqilLevel,chorLevel,phanLevel,ponyLevel,borbLevel,rhageistLevel,kariquaLevel,orphalasLevel,senakhanLevel],
            expectedRemaining: unspent,
            newHze: this.newHze,
            newLogHeroSouls: newLogHeroSouls,
            newAncientSouls: this.newAncientSouls,
            newTranscendentPower: this.newTranscendentPower
        }));
    }

    // Display the results
    $("#TP").html("TP: " + (transcendentPower*100).toFixed(4) + "%" );
    //End of Transcension
    $("#predictedHZE").html("Highest Zone: " + this.newHze.toLocaleString() );
    $("#predictedHS").html("logHS: " + newLogHeroSouls.toLocaleString() );
    $("#predictedAS").html("AncientSouls: " + this.newAncientSouls.toLocaleString() + " (+" + this.ancientSoulsDiff.toLocaleString() + ")");
    $("#predictedTP").html("TP: " + this.newTranscendentPower + "%" );
    $("#predictedAncients").html("Ancient Levels: " + ancientLevels.toLocaleString() );
    //Outsiders Table
    $("#OutsidersTable tbody").html(
        "<tr><td>Xyliqil</td><td>"+xyliqilLevel.toLocaleString()+"</td><td>"+getCostFromLevel(xyliqilLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Chor'gorloth</td><td>"+chorLevel.toLocaleString()+"</td><td>"+getCostFromLevel(chorLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Phandoryss</td><td>"+phanLevel.toLocaleString()+"</td><td>"+phanLevel.toLocaleString()+"</td><td>"+
        "<tr><td>Ponyboy</td><td>"+ponyLevel.toLocaleString()+"</td><td>"+getCostFromLevel(ponyLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Borb</td><td>"+borbLevel.toLocaleString()+"</td><td>"+getCostFromLevel(borbLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Rhageist</td><td>"+rhageistLevel.toLocaleString()+"</td><td>"+getCostFromLevel(rhageistLevel).toLocaleString()+"</td><td>"+
        "<tr><td>K'Ariqua</td><td>"+kariquaLevel.toLocaleString()+"</td><td>"+getCostFromLevel(kariquaLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Orphalas</td><td>"+orphalasLevel.toLocaleString()+"</td><td>"+getCostFromLevel(orphalasLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Sen-Akhan</td><td>"+senakhanLevel.toLocaleString()+"</td><td>"+getCostFromLevel(senakhanLevel).toLocaleString()+"</td><td>"
    );
    $("#share").html(
        xyliqilLevel+'/'+
        chorLevel+'/'+
        phanLevel+'/'+
        ponyLevel+'//'+
        borbLevel+'/'+
        rhageistLevel+'/'+
        kariquaLevel+'/'+
        orphalasLevel+'/'+
        senakhanLevel
    );
    $("#unspentAS").html( "Unspent: " + unspent );
}

function test() {
    var cases = [0,1,10,100,500,1000,5000,10000,12500,15000,17500,20000,50000,100000,200000,300000,400000,500000];
        readout = "[\n";
    for (i=0;i<cases.length;i++) {
        readout += "    " + refresh(true,cases[i]) + ",\n";
    }
    readout = readout.slice(0, -2);
    readout += "\n]";
    console.log(readout);
}

function enterKey(ev) {
    if (ev.which === 13) refresh();
}

$("#ancient_souls").keyup(enterKey);

function changeTheme() {
    if ($("#dark").is(":checked")) {
        $("#theme-light").prop("disabled", true);
        $("#theme-dark").prop("disabled", false);
    } else {
        $("#theme-light").prop("disabled", false);
        $("#theme-dark").prop("disabled", true);
    }
    if (localStorage) localStorage.setItem("darkmode", $("#dark").is(":checked"));
}

if (localStorage) {
    $("#dark").prop("checked", localStorage.getItem("darkmode")==="true");
}
$(changeTheme);
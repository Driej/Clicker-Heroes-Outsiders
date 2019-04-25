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

//Infinite Ascension HS requirements
let infAscHS = {
    0.02: 65,
    0.03: 160,
    0.04: 236,
    0.06: 7463,
    0.07: 7462,
    0.08: 7462,
    0.10: 14184,
    0.15: 43413,
    0.20: 163532,
    0.25: 285442,
    0.30: 383350,
    0.35: 463600,
    0.40: 530799,
    0.45: 612052,
    0.50: 696185,
    0.55: 746451,
    0.60: 801517,
    0.70: 873851,
    0.80: 919765,
    0.90: 955619,
    1.00: 992703
}

function getTP(ancientSouls) {
    for(let i = breakpoints.length - 1; i >= 0; i--) {
        let bp = breakpoints[i];
        if(ancientSouls >= bp[0]) return bp[1];
    }
}

// Breakpoint skips
let goalsSkip = [
    [0,75],
    [70,300],
    [300,1235],
    [800,6410],
    [1250,2550],
    [2550,4000],
    [4000,6400],
    [6400,18000],
    [18000,40000],
    [40000,145000],
    [65000,145000],
    [102000,145000],
    [145000,350000],
    [190000,350000],
    [240000,350000],
    [350000,840000],
    [485000,840000],
    [666000,1200000],
    [840000,1200000],
    [1200000,4390000],
    [4385000,24770000],
    [24766000,126400000],
    [126393000,'cap']
];

// No Breakpoint skips
let goalsNoSkip = [
    [0,75],
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
    [1950000,4390000],
    [2850000,4390000],
    [4385000,24770000],
    [24766000,126400000],
    [126393000,'cap']
];

function getASGoal(ancientSouls, skipBPs) {
    let goals = skipBPs ? goalsSkip : goalsNoSkip;
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

        // Boost Phandoryss for FANT
        if (phan < 50) {
            phanBuff *= Math.pow(1.1, 1 / phan);
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

function getBorbFant( ancientSouls, transcendentPower ) {
    let IEsucks = nOS( ancientSouls * 0.3, transcendentPower, 100 );
    let chor = IEsucks[0];
    let phan = IEsucks[1];
    let pony = IEsucks[2];
    let ponyBonus = Math.pow(pony, 2) + 1;
    let chorBonus = Math.pow(1 / 0.95, chor);
    let tp = 1 + transcendentPower;
    let s = tp * tp;
    let a = s + s * s + s * s * s;
    let HSFant = 20 * ponyBonus * a;
    let logHSFant = Math.log10(Math.max(1, HSFant));
    logHSFant += Math.log10(chorBonus);
    let kumaFant = Math.max(1, Math.floor(logHSFant / Math.log10(2) - 3 / Math.log(2)) - 1);
    let kumaCoeff = 8.4 / Math.log(kumaFant + 2.719);
    let borbRequired = Math.ceil((-0.1 + Math.pow(kumaCoeff / 3125 + 0.0092, 0.5)) * 6250);
    return borbRequired;
}

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
    let skipBPs = true;
    if (!test) {
        ancientSouls = getInputs();
        if( ancientSouls==-1 ) return;
        skipBPs = $("#bpSkip").is(":checked");
    }

    let transcendentPower = getTP(ancientSouls) / 100;
    let tp = 1 + transcendentPower;
    let targetAS = getASGoal(ancientSouls, skipBPs);
    
    // Find next HZE
    /*if (targetAS === 'push') {
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
                this.newHze = Math.min(Math.pow(2, 31) - 1, Math.ceil(nextZone / 500) * 500 + 756000);
                break;
            }
        }
    }*/
    if (targetAS === 'cap') {
        this.newHze = 2**31-1;
    } else {
        this.newHze = (targetAS / 5 - Math.log10(20 * tp / transcendentPower)) / Math.log10(tp) * 5 + 100;
    }
    this.newHze = Math.ceil(this.newHze);

    let newLogHeroSouls = Math.log10(tp) * this.newHze / 5 - 2;

    // Ancient effects
    let ancientLevels = Math.floor(newLogHeroSouls * (targetAS === 'cap' ? 1 : 0.9) / Math.log10(2) - 3 / Math.log(2)) - 1;
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
    
    // Problematic BP Skips
    if (skipBPs) {
        switch (transcendentPower) {
            case 0.4:
                borbCap += 2;
        }
    }
    
    // Broken at high levels
    if (isNaN(rhageistCap)) rhageistCap = spendAS(ancientSouls, 1);
    if (isNaN(senakhanCap)) senakhanCap = spendAS(ancientSouls, 1);

    // Outsider Ratios
    let xyliqilRatio = 0.15;
    let rhageistRatio = 0.2;
    let kariquaRatio = 0.05;
    let orphalasRatio = ancientSouls < 70 ? 0 : 0.15;
    let senakhanRatio = 0.05;

    // Outsider Leveling
    let borbFant = ancientSouls < 1250
        ? Math.min(getBorbFant( ancientSouls, transcendentPower ), spendAS(0.35, ancientSouls))
        : 0;
    let borbLevel = Math.max(0, borbCap, borbFant);
    if (this.getCostFromLevel(borbLevel) >= ancientSouls * 0.99) borbLevel = spendAS(ancientSouls * 0.99, 1);
    if (this.getCostFromLevel(borbLevel) >= ancientSouls - 5) borbLevel = spendAS(ancientSouls - 5, 1);
    this.remainingAncientSouls = ancientSouls - this.getCostFromLevel(borbLevel);
    let xyliqilLevel = Math.max(1, spendAS(this.remainingAncientSouls, xyliqilRatio));
    if (this.remainingAncientSouls === 0) xyliqilLevel = 0;
    if (xyliqilLevel > 196) xyliqilLevel = 196;
    let rhageistLevel = Math.min(spendAS(this.remainingAncientSouls, rhageistRatio), rhageistCap, 530);
    let kariquaLevel = Math.min(spendAS(this.remainingAncientSouls, kariquaRatio), kariquaCap);
    let senakhanLevel = Math.min(spendAS(this.remainingAncientSouls, senakhanRatio), senakhanCap, 530);
    let orphalasLevel = Math.min(spendAS(this.remainingAncientSouls, orphalasRatio), 864);

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
    let ponyBonus = Math.pow(ponyLevel, 2);
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
    //Buffed Stats
    let borbCoeff = 0.00008 * borbLevel * borbLevel + 0.1 * borbLevel + 2.5;
        kariquaCoeff = 0.00032 * kariquaLevel * kariquaLevel + 0.4 * kariquaLevel + 2.5;
        rhageistCoeff = 2 * (1 - Math.exp(rhageistLevel * -0.01)) + 7;
        senakhanCoeff = 2 * (1 - Math.exp(senakhanLevel * -0.01)) + 6.75;
        nerfs = Math.floor(this.newHze / 500);
        unbuffedMonstersPerZone = 10 + nerfs * 0.1;
        unbuffedTreasureChestChance = 1 / Math.pow(nerfs + 1, 2);
        unbuffedBossHealth = 10 + nerfs * 0.4;
        unbuffedBossTimer = 30 - nerfs / 200;
        unbuffedPrimalBossChance = 1 / Math.pow(nerfs + 1, 2);
        alpha = Math.log(ancientLevels + 2.719);
        buffedMPZfinal = unbuffedMonstersPerZone - alpha * borbCoeff;
        buffedTCCfinal = Math.max(1, unbuffedTreasureChestChance * (1 + Math.pow(alpha, senakhanCoeff)));
        buffedBossHPfinal = unbuffedBossHealth - alpha * kariquaCoeff;
        buffedTimerfinal = Math.max(2, unbuffedBossTimer + alpha * 10);
        buffedPBCfinal = Math.max(5, unbuffedPrimalBossChance * (25 + Math.pow(alpha, rhageistCoeff)));
        lowestHS = infAscHS[transcendentPower];
    $("#buffedMPZ").html( "Monsters per Zone: " + buffedMPZfinal.toFixed(2) + (buffedMPZfinal<2?" (2)":"") );
    $("#buffedTCC").html( "Treasure Chests: " + buffedTCCfinal.toFixed() + "%" );
    $("#buffedBossHP").html( "Boss Health: " + buffedBossHPfinal.toFixed() + "x" );
    $("#buffedTimer").html( "Boss Timer: " + buffedTimerfinal.toFixed() + "s" );
    $("#buffedPBC").html( "Primal Chance: " + buffedPBCfinal.toFixed() + "%" );
    if (lowestHS < newLogHeroSouls * (targetAS === 'cap' ? 1 : 0.9)) {
        let ancientLevels = Math.floor(lowestHS / Math.log10(2) - 3 / Math.log(2)) - 1;
            alpha = Math.log(ancientLevels + 2.719);
            buffedMPZ = unbuffedMonstersPerZone - alpha * borbCoeff;
            buffedTCC = Math.max(1, unbuffedTreasureChestChance * (1 + Math.pow(alpha, senakhanCoeff)));
            buffedBossHP = unbuffedBossHealth - alpha * kariquaCoeff;
            buffedTimer = Math.max(2, unbuffedBossTimer + alpha * 10);
            buffedPBC = Math.max(5, unbuffedPrimalBossChance * (25 + Math.pow(alpha, rhageistCoeff)));
        $("#buffedMPZ").append( " to " + buffedMPZ.toFixed(2) + (buffedMPZ<2?" (2)":"") );
        $("#buffedTCC").append( " to " + buffedTCC.toFixed() + "%" );
        $("#buffedBossHP").append( " to " + buffedBossHP.toFixed() + "x" );
        $("#buffedTimer").append( " to " + buffedTimer.toFixed() + "s" );
        $("#buffedPBC").append( " to " + buffedPBC.toFixed() + "%" );
    }
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
    
    if (!$("#helpText").is(":checked")) {
        $('#checkResults').parent().hide();
    } else {
        let hardCap = (2**31-1).toLocaleString();
        let infoMessage = "<ul>";
        if (ancientSouls == 0) {
            infoMessage += "<li>You need to have ancient souls for this to work. Transcend as soon as you unlock transcendence at zone 300.</li>";
        } else {
            if (skipBPs && ancientSouls < 1950000) {
                infoMessage += "<li>It is sometimes (but not always) possible to skip breakpoints and not all skips save time. The calculator will only tell you to do practical skips.</li>";
                if (ancientSouls < 300) {
                    infoMessage += "<li>You will not be skipping breakpoints this time.</li>";
                } else if (ancientSouls < 800) {
                    infoMessage += "<li>You do <b>not</b> want to reach the next breakpoint yet! Make sure you do not reach 1250 total Ancient Souls. (no more than +"
                    + (1249 - ancientSouls) + ") gained.</li>";
                    infoMessage += "<li>The purpose of this run is to get more levels into borb in preparation for several skips, not to reach the next breakpoint.</li>";
                } else if (ancientSouls < 1250) {
                    infoMessage += "<li>You will be skipping the 6%, 7% and 8% breakpoints and heading straight for 10% (6,400 AS). High mpz is normal, it is still a lot faster this way.</li>";
                } else if (ancientSouls < 40000) {
                    infoMessage += "<li>You will not be skipping breakpoints this time.</li>";
                } else if (ancientSouls < 65000) {
                    infoMessage += "<li>You will be skipping the 25% and 30% breakpoints and heading straight for 35% (145,000 AS).";
                } else if (ancientSouls < 102000) {
                    infoMessage += "<li>You will be skipping the 30% breakpoint and heading straight for 35% (145,000 AS).</li>";
                } else if (ancientSouls < 145000) {
                    infoMessage += "<li>You will not be skipping breakpoints this time.</li>";
                } else if (ancientSouls < 190000) {
                    infoMessage += "<li>You will be skipping the 40% and 45% breakpoints and heading straight for 50% (350,000 AS).</li>";
                } else if (ancientSouls < 240000) {
                    infoMessage += "<li>You will be skipping the 45% breakpoint and heading straight for 50% (350,000 AS).</li>";
                } else if (ancientSouls < 350000) {
                    infoMessage += "<li>You will not be skipping breakpoints this time.</li>";
                } else if (ancientSouls < 485000) {
                    infoMessage += "<li>You will be skipping the 55% and 60% breakpoints and heading straight for 70% (840,000 AS).</li>";
                } else if (ancientSouls < 666000) {
                    infoMessage += "<li>You will be skipping the 60% breakpoint and heading straight for 70% (840,000 AS).</li>";
                } else if (ancientSouls < 840000) {
                    infoMessage += "<li>You will be skipping the 70% breakpoint and heading straight for 80% (1,200,000 AS).</li>";
                } else if (ancientSouls < 1200000) {
                    infoMessage += "<li>You will not be skipping breakpoints this time.</li>";
                } else if (ancientSouls < 1950000) {
                    infoMessage += "<li>You will be skipping the 90% breakpoint and heading past 100% (2,850,000)</li>";
                }
            }
            if (!skipBPs && ancientSouls < 1950000) {
                infoMessage += "<li>You are playing the intended way by not skipping breakpoints. You can enable Skip Breakpoints for a much faster game, but you will skip a lot of the game.</li>";
            }
            if (ancientSouls < 1200000) {
                if (!(skipBPs && ancientSouls >= 300 && ancientSouls < 800)) {
                    infoMessage += "<li>In this version, TP only goes up at specific AS amounts called breakpoints. There is no reason to transcend anywhere but just after reaching a new breakpoint except in special cases;"
                    + " performing the 4% to 10% skip, and pushing past the last breakpoint.</li>"
                }
            } else if (ancientSouls < 2850000) {
                infoMessage += "<li>You can stop at the 100% breakpoint (the last breakpoint) at 2,850,000 AS and be finished, or continue playing until the game breaks.</li>";
                infoMessage += "<li>You need to transcend 3 more times to be able to reach the hard cap (zone " + hardCap + ")</il>";
            } else if (ancientSouls < 4385000) {
                infoMessage += "<li>You need to transcend 3 more times to be able to reach the hard cap (zone " + hardCap + ")</il>";
            } else if (ancientSouls < 24766000) {
                infoMessage += "<li>You need to transcend 2 more times to be able to reach the hard cap (zone " + hardCap + ")</il>";
            } else if (ancientSouls < 126393000) {
                infoMessage += "<li>You need to transcend 1 more times to be able to reach the hard cap (zone " + hardCap + ")</il>";
            } else {
                infoMessage += "<li>You can reach the hard cap (zone " + hardCap + ") this run!</il>";
            }
            if (ancientSouls >= 4385000) {
                infoMessage += "<li>Take advantage of the fact that Timelapses use your <i>current</i> mpz. Use a 168h Timelapse between 500k and 756k below your final zone. Ascend and try again if you mess this up.</li>"
            }
        }
        $('#checkResults').html(infoMessage+"</ul>");
        $('#checkResults').parent().show();
    }
    
    $("#outputsave").html("");
    if (autolevelEnabled) {
        return [xyliqilLevel, chorLevel, phanLevel, ponyLevel, borbLevel, rhageistLevel, kariquaLevel, orphalasLevel, senakhanLevel, unspent];
    }
}

function test() {
    var cases = [0,10,20,70,300,800,1240,2550,4000,6400,18000,40000,65000,102000,145000,190000,240000,350000,485000,666000,840000,1200000,1950000,2850000];
        readout = "[\n";
    for (i=0;i<cases.length;i++) {
        readout += "    " + refresh(true,cases[i]) + ",\n";
    }
    readout = readout.slice(0, -2);
    readout += "\n]";
    console.log(readout);
}

function enterKey(ev) {
    if (ev.which === 13) {
        clearOutput();
        refresh();
    }
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

function skipCB() {
    if (localStorage) localStorage.setItem("bpSkip", $("#bpSkip").is(":checked"));
    clearOutput();
    refresh();
}

if (localStorage) {
    $("#dark").prop("checked", localStorage.getItem("darkmode")==="true");
    if (localStorage.getItem("bpSkip")!==null)
        $("#bpSkip").prop("checked", localStorage.getItem("bpSkip")==="true");
    $('.collapsible .title').click(function(){
        $(this).parent().find('.content').toggle();
    });
}
$(changeTheme);
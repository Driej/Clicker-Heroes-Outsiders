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
}

var settingsVisible = false;

function showAdvancedClick() {
    $("#advancedSettings").toggle(100, function(){
        $("#showAdvanced").html( (settingsVisible = !settingsVisible) ? "Hide Advanced Settings" : "Show Advanced Settings");
    });
}

function setDefaults() {
    $("#zoneOverride").val(0);
}

function defaultClick() {
    setDefaults();
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
    let IEsucks = nOS( ancientSouls * 0.5, transcendentPower, 100 );
    let chor = IEsucks[0];
    let phan = IEsucks[1];
    let pony = IEsucks[2];
    let ponyBonus = Math.pow(pony, 2) * 10 + 1;
    let chorBonus = Math.pow(1 / 0.95, chor);
    let tp = 1 + transcendentPower;
    let s = tp * tp;
    let a = s + s * s + s * s * s;
    let HSFant = 20 * ponyBonus * a;
    let logHSFant = Math.log10(Math.max(1, HSFant));
    logHSFant += Math.log10(chorBonus);
    let kumaFant = Math.max(1, Math.floor(logHSFant / Math.log10(2) - 3 / Math.log(2)) - 1);
    let kumaEffect = 8 * (1 - Math.exp(-0.025 * kumaFant));
    let borbRequired = Math.ceil((8 / kumaEffect - 1) * 8);
    return borbRequired;
}

function findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone) {
    let transcensions = 0;
    let currentZone = 0;
    let borb;
    while(currentZone < targetZone) {
        borb = spendAS(1, ancientSouls - nonBorb);
        currentZone = borb * 5000 + 500;
        currentZone = Math.floor(currentZone * (1 + zonePush / 100));
        ancientSouls = Math.log10(1.25) * currentZone;
        transcensions++;
    }
    return transcensions;
}

function findStrategy(ancientSouls) {
    if(ancientSouls < 340000) {
        let targetZone = 4.5e6;
        let nonBorb = 4500;
        let zonePush = 1;
        let numTranscensions = findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone);
        let newNumTranscensions = numTranscensions;
        while(zonePush > 0) {
            zonePush -= 0.1;
            newNumTranscensions = findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone);
            if (newNumTranscensions > numTranscensions) {
                return [nonBorb, zonePush + 0.1];
            }
        }
        while(newNumTranscensions === numTranscensions) {
            nonBorb += 500;
            newNumTranscensions = findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone);
        }
        return [nonBorb - 500, 0];
    } else {
        return [2000, 2.5];
    }
}

function getInputs() {
    var ancientSouls = parseFloat( $("#ancient_souls").val() || 0 );
    if( !(ancientSouls>=0) ) {
        alert("Calculation failed. Ancient Souls must be a non-negative number.");
        return -1;
    }
    var val = $( "#zoneOverride" ).val();
        zoneOverride = ( val=="" ) ? 0 : parseFloat( val );
    if( isNaN(zoneOverride) || zoneOverride<0 ) {
        setDefaults();
        zoneOverride = 0;
        alert("Advanced settings were set to default values.");
    }

    return [Math.floor(ancientSouls), zoneOverride];
}

function refresh(test, ancientSouls) {
    //IE sucks
    if (test === undefined || test === null) test = false;
    if (ancientSouls === undefined || ancientSouls === null) ancientSouls = 0;
    //Inputs
    let zoneOverride = 0;
    if (!test) {
        let IEsucks = getInputs();
        ancientSouls = IEsucks[0];
        zoneOverride = IEsucks[1];
        if( ancientSouls==-1 ) return;
        this.reserve = $("#reserveAS").is(":checked");
    }
    
    var transcendentPower = (25 - 23 * Math.exp(-0.0003 * ancientSouls)) / 100;

    // Figure out goals for this transcendence
    this.newHze = Math.floor(zoneOverride||0);
    let nonBorb;
    let zonePush = 0;
    if(this.newHze==0){
    if (ancientSouls < 100) {
        let a = ancientSouls + 42;
        this.newHze = (a / 5 - 6) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
    } else if (ancientSouls < 10500) {
        this.newHze = (1 - Math.exp(-ancientSouls / 3900)) * 200000 + 4800;
    } else if (ancientSouls < 20000) {
        // 20k or +8000 Ancient Souls
        this.newHze = Math.max(215000, ancientSouls*10.32 + 90000);
    } else if (ancientSouls < 27000 ) {
        // 44.3k Ancient Souls
        this.newHze =  458000;
    } else {
        // End Game
        let IEsucks = findStrategy(ancientSouls);
        nonBorb = IEsucks[0];
        zonePush = IEsucks[1];
        let b = this.spendAS(1, ancientSouls - nonBorb);
        this.newHze = Math.min(5.5e6, b * 5000 + 500);
    }}

    // Push beyond 2mpz
    this.borbTarget = false;
    if (ancientSouls >= 27000) {
        this.borbTarget = this.newHze;
        this.newHze = Math.min(5.5e6, (1 + zonePush / 100) * this.newHze);
    }

    this.newHze = Math.floor(this.newHze);
    let newLogHeroSouls = Math.log10(1 + transcendentPower) * this.newHze / 5 + 6;

    // Ancient effects
    let ancientLevels = Math.floor(newLogHeroSouls / Math.log10(2) - 3 / Math.log10(2)) - 1;
    let kuma = -8 * (1 - Math.exp(-0.025 * ancientLevels));
    let atman = 75 * (1 - Math.exp(-0.013 * ancientLevels));
    let bubos = -5 * (1 - Math.exp(-0.002 * ancientLevels));
    let chronos = 30 * (1 - Math.exp(-0.034 * ancientLevels));
    let dora = 9900 * (1 - Math.exp(-0.002 * ancientLevels));

    // Unbuffed Stats
    let nerfs = Math.floor(this.newHze / 500);
    let unbuffedMonstersPerZone = Math.round10(10 + nerfs * 0.1, -2);
    let unbuffedTreasureChestChance = Math.exp(-0.006 * nerfs);
    let unbuffedBossHealth = 10 + nerfs * 0.4;
    let unbuffedBossTimer = 30 - nerfs * 2;
    let unbuffedPrimalBossChance = 25 - nerfs * 2;

    // Outsider Caps
    let borbCap = this.borbTarget
        ? Math.ceil((this.borbTarget - 500) / 5000)
        : ancientSouls >= 10500
            ? Math.ceil((this.newHze - 500) / 5000)
            : Math.max(0, Math.ceil(((unbuffedMonstersPerZone - 2.1) / - kuma - 1) / 0.125));
    let rhageistCap = Math.ceil(((100 - unbuffedPrimalBossChance) / atman - 1) / 0.25);
    let kariquaCap = Math.ceil(((unbuffedBossHealth - 5) / -bubos - 1) / 0.5);
    let orphalasCap = Math.max(1, Math.ceil(((2 - unbuffedBossTimer) / chronos - 1) / 0.75)) + 2;
    let senakhanCap = Math.max(1, Math.ceil((100 / unbuffedTreasureChestChance) / (dora / 100 + 1) - 1));

    // Outsider Ratios
    let rhageistRatio;
    let kariquaRatio;
    let orphalasRatio;
    let senakhanRatio;

    if (ancientSouls < 100) {
        let ratioChange = ancientSouls / 100;
        rhageistRatio = 0.2*ratioChange;
        kariquaRatio = 0.01*ratioChange;
        orphalasRatio = 0.05*ratioChange;
        senakhanRatio = 0.05*ratioChange;
    } else if (ancientSouls < 27000) {
        rhageistRatio = 0.2;
        kariquaRatio = 0.01;
        orphalasRatio = 0.05;
        senakhanRatio = 0.05;
    } else {
        rhageistRatio = 0;
        kariquaRatio = 0;
        orphalasRatio = 0;
        senakhanRatio = 0;
    }

    // Outsider Leveling
    this.remainingAncientSouls = ancientSouls;
    
    let borbFant = ancientSouls <= 2000
        ? Math.min(this.spendAS(0.35, this.remainingAncientSouls), getBorbFant(ancientSouls, transcendentPower))
        : 0;
    let borbHze = this.remainingAncientSouls >= 27000
        ? borbCap
        : Math.min(this.spendAS(0.99, this.remainingAncientSouls), borbCap + 1);
    let borbLevel = Math.max(borbFant, borbHze);

    if (this.getCostFromLevel(borbLevel) > (this.remainingAncientSouls - 5)) {
        borbLevel = this.spendAS(1, this.remainingAncientSouls - 5);
    }

    this.remainingAncientSouls -= this.getCostFromLevel(borbLevel);

    // Xyl sucks
    let xyliqilLevel = 0;
    this.remainingAncientSouls -= this.getCostFromLevel(xyliqilLevel);

    // Remove souls if using Reserve AS
    if (!test && this.reserve) {
        var unspentAncientSouls = Math.floor( this.remainingAncientSouls*0.1 )
        this.remainingAncientSouls -= unspentAncientSouls;
    }

    // Super outsiders
    let rhageistLevel = this.getCostFromLevel(rhageistCap) > (this.remainingAncientSouls * rhageistRatio)
        ? this.spendAS(rhageistRatio, this.remainingAncientSouls)
        : rhageistCap;
    let kariquaLevel = this.getCostFromLevel(kariquaCap) > (this.remainingAncientSouls * kariquaRatio)
        ? this.spendAS(kariquaRatio, this.remainingAncientSouls)
        : kariquaCap;
    let orphalasLevel = this.getCostFromLevel(orphalasCap) > (this.remainingAncientSouls * orphalasRatio)
        ? this.spendAS(orphalasRatio, this.remainingAncientSouls)
        : orphalasCap;
    let senakhanLevel = this.getCostFromLevel(senakhanCap) > (this.remainingAncientSouls * senakhanRatio)
        ? this.spendAS(senakhanRatio, this.remainingAncientSouls)
        : senakhanCap;

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
    let buffedPrimalBossChance = Math.max(5, unbuffedPrimalBossChance + atman * (1 + rhageistLevel * 0.25));
    let pbcm = Math.min(buffedPrimalBossChance, 100) / 100;

    newLogHeroSouls = Math.log10(1 + transcendentPower) * (this.newHze - 100) / 5 + Math.log10(ponyBonus + 1) + Math.log10(20 * series * pbcm);
    this.newAncientSouls = Math.max(ancientSouls, Math.floor(newLogHeroSouls * 5));
    this.ancientSoulsDiff = this.newAncientSouls - ancientSouls;
    this.newTranscendentPower = (25 - 23 * Math.exp(-0.0003 * this.newAncientSouls)) / 100;

    //test log
    var unspent = this.remainingAncientSouls + (unspentAncientSouls||0);
    if (test) {
        return (JSON.stringify({
            ancientSouls: ancientSouls,
            expectedLevels: [xyliqilLevel,chorLevel,phanLevel,ponyLevel,borbLevel,rhageistLevel,kariquaLevel,orphalasLevel,senakhanLevel],
            expectedRemaining: unspent,
            newHze: this.newHze,
            newLogHeroSouls: newLogHeroSouls,
            newAncientSouls: this.newAncientSouls,
            newTranscendentPower: this.newTranscendentPower*100
        }));
    }

    // Display the results
    $("#TP").html("TP: " + (transcendentPower*100).toFixed(4) + "%" );
    //End of Transcension
    $("#predictedHZE").html("Highest Zone: " + this.newHze.toLocaleString() );
    $("#predictedHS").html("logHS: " + newLogHeroSouls.toFixed(2).toLocaleString() );
    $("#predictedAS").html("AncientSouls: " + this.newAncientSouls.toLocaleString() + " (+" + this.ancientSoulsDiff.toLocaleString() + ")");
    $("#predictedTP").html("TP: " + (this.newTranscendentPower*100).toFixed(4) + "%" );
    $("#predictedAncients").html("Ancient Levels: " + ancientLevels.toLocaleString() );
    $("#kuma").html( kuma.toFixed(2) + " monsters per zone" );
    $("#atman").html( atman.toFixed(2) + "% chance of primal" );
    $("#bubos").html( bubos.toFixed(2) + " boss life" );
    $("#chronos").html( chronos.toFixed(2) + "s boss fight timer" );
    $("#dora").html( dora.toFixed(2) + "% treasure chests" );
    //Unbuffed Stats
    $("#unbuffedMPZ").html( "Monsters per Zone: " + unbuffedMonstersPerZone.toFixed(2) );
    $("#unbuffedTCC").html( "Treasure Chests: " + unbuffedTreasureChestChance.toFixed(6) + "x" );
    $("#unbuffedBossHP").html( "Boss Health: " + unbuffedBossHealth.toFixed(1) + "x" );
    $("#unbuffedTimer").html( "Boss Timer: " + unbuffedBossTimer + "s" );
    $("#unbuffedPBC").html( "Primal Chance: " + unbuffedPrimalBossChance + "%" );
    //Buffed Stats
    var buffedMPZ = unbuffedMonstersPerZone + kuma*( 1 + borbLevel/8 );
        buffedTCC = Math.max( 1, ( dora*( 1 + senakhanLevel)/100 + 1 )*unbuffedTreasureChestChance );
        buffedBossHP = Math.floor( Math.max( 5, unbuffedBossHealth + bubos*( 1 + kariquaLevel*0.5 ) ) );
        buffedTimer = Math.max( 2, unbuffedBossTimer + chronos*( 1 + orphalasLevel*0.75 ) );
        buffedPBC = Math.max( 5, unbuffedPrimalBossChance + atman*( 1 + rhageistLevel*0.25 ) );
    $("#buffedMPZ").html( "Monsters per Zone: " + buffedMPZ.toFixed(2) + (buffedMPZ<2?" (2)":"") );
    $("#buffedTCC").html( "Treasure Chests: " + buffedTCC.toFixed() + "%" );
    $("#buffedBossHP").html( "Boss Health: " + buffedBossHP.toFixed() + "x" );
    $("#buffedTimer").html( "Boss Timer: " + buffedTimer.toFixed() + "s" );
    $("#buffedPBC").html( "Primal Chance: " + buffedPBC.toFixed() + "%" );
    //Zone Breakpoints
    $("#HighMpz").html( "2.1 monsters per zone: " + ( -39500 - Math.floor( kuma*( 1 + borbLevel/8 )*10 )*500 ).toLocaleString() );
    $("#5PBC").html( "5% primal chance: " + ( 5500 + Math.floor( atman*( 1 + rhageistLevel/4 )/2)*500 ).toLocaleString() );
    $("#90BHP").html( "90% boss health: " + ( Math.ceil( ( bubos*( 1 + kariquaLevel/2 )*-10 - 10 )/0.4 )*500 ).toLocaleString() );
    $("#2sTimer").html( "2s boss timer: " + ( 7000 + Math.floor( chronos*( 1 + orphalasLevel*0.75 )/2 )*500 ).toLocaleString() );
    $("#99TTC").html( "99% treasure chests: " + (Math.ceil( Math.log( 0.995/( dora/10000*( 1 + senakhanLevel ) + 0.01 ) )/-0.006 )*500 ).toLocaleString() );
    $("#1TTC").html( "1% treasure chests: " + (Math.ceil( Math.log( 0.015/( dora/10000*( 1 + senakhanLevel ) + 0.01 ) )/-0.006 )*500 ).toLocaleString() );
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

$(setDefaults);
if (localStorage) {
    $("#dark").prop("checked", localStorage.getItem("darkmode")==="true");
}
$(changeTheme);
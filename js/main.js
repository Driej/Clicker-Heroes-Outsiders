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

function post4mStrategy(ancientSouls) {
    let oldHZE = Math.round(ancientSouls / 0.09691) - 170;
    let borb = spendAS(1, ancientSouls - 2000);
    let borbLimit = borb * 5000 + 500;
    let zonesTraveled = getZonesTraveled(borbLimit, 0);
    let zonesGained = borbLimit - oldHZE;
    let efficiency = zonesGained / zonesTraveled;
    let zoneAdd = 0;
    let addMPZ = 256;
    
    let zoneAddA = 0;
    let efficiencyA = efficiency;
    let zoneAddB = 0;
    let efficiencyB = efficiency;
    
    do {
        zonesTraveled = getZonesTraveled(borbLimit, zoneAdd + addMPZ * 500);
        zonesGained = borbLimit + zoneAdd + addMPZ * 500 - oldHZE;
        let newEfficiency = zonesTraveled === Infinity 
            ? - Infinity
            : zonesGained / zonesTraveled;
        if (newEfficiency > efficiency) {
            
            zoneAddA = zoneAddB;
            efficiencyA = efficiencyB;
            zoneAddB = zoneAdd;
            efficiencyB = efficiency;
            
            efficiency = newEfficiency;
            zoneAdd += addMPZ * 500;
        } else {
            
            zoneAdd = zoneAddA;
            efficiency = efficiencyA;
            zoneAddB = zoneAddA;
            efficiencyB = efficiencyA;
            if (addMPZ > 2) {
                addMPZ /= 2;
            }
            
            addMPZ = Math.floor(addMPZ / 2);
        }
    } while (addMPZ > 0);
    return zoneAdd;
}

// Starting at 76603.93 lgHS (4m Zone)
let simulatedAscensions = [
    4044232,
    4085089,
    4155170,
    4219902,
    4291233,
    4357121,
    4417981,
    4474197,
    4537681,
    4596321,
    4650485,
    4700517,
    4758279
];

function getZonesTraveled(borbLimit, zoneAdd) {
    let targetZone = borbLimit + zoneAdd;
    let zonesTraveled = 45000000;
    for (let i = 0; i < simulatedAscensions.length; i++) {
        let ascZone = simulatedAscensions[i];
        if (ascZone > targetZone) {
            zonesTraveled += targetZone - Math.round(ascZone * 0.9) + 30000;
            if (targetZone > borbLimit) {
                let zonePush = targetZone - borbLimit;
                zonesTraveled += Math.round(zonePush * zonePush / 10000);
            }
            break;
        } else {
            zonesTraveled += Math.round(ascZone / 10 + 30000);
            if (ascZone > borbLimit) {
                let zonePush = ascZone - borbLimit;
                zonesTraveled += Math.round(zonePush * zonePush / 10000);
            }
        }
    }
    if (targetZone >= 4811634) {
        let ascZone = 4811634;
        let zoneIncrease = 49283;
        do {
            if (ascZone > targetZone) {
                zonesTraveled += targetZone - Math.round(ascZone * 0.9) + 30000;
                if (targetZone > borbLimit) {
                    let zonePush = targetZone - borbLimit;
                    zonesTraveled += Math.round(zonePush * zonePush / 10000);
                }
            } else {
                zonesTraveled += Math.round(ascZone / 10 + 30000);
                if (ascZone > borbLimit) {
                    let zonePush = ascZone - borbLimit;
                    zonesTraveled += Math.round(zonePush * zonePush / 10000);
                }
            }
            ascZone += zoneIncrease;
            zoneIncrease = zoneIncrease * 0.923989;
            if (zoneIncrease < 10) {
                return Infinity;
            }
        } while (ascZone <= targetZone);
    }
    return zonesTraveled;
}

function getInputs() {
    $("#ancient_souls").val($("#ancient_souls").val().replace(/,/g, ''));
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
    let zoneAdd = 0;
    if(this.newHze==0){
    if (ancientSouls < 100) {
        let a = ancientSouls + 42;
        this.newHze = (a / 5 - 6) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
    } else if (ancientSouls < 10500) {
        this.newHze = (1 - Math.exp(-ancientSouls / 3900)) * 200000 + 4800;
    } else if (ancientSouls < 21000) {
        // 21k or +8000 Ancient Souls
        this.newHze = Math.max(225000, ancientSouls*10.32 + 90000);
    } else if (ancientSouls < 333000) {
        // End Game
        if (ancientSouls < 27000) nonBorb = 3000 + (27000 - ancientSouls) * 1.2;
        else nonBorb = 3000;
        zonePush = ancientSouls / 16e4;
        let b = this.spendAS(1, ancientSouls - nonBorb);
        this.newHze = Math.min(5.46e6, b * 5000 + 500);
    } else if (ancientSouls < 530000) {
        // Post zone 4m
        nonBorb = 2000;
        zoneAdd = post4mStrategy(ancientSouls);
        let b = this.spendAS(1, ancientSouls - nonBorb);
        this.newHze = Math.min(5.46e6, b * 5000 + 500);
    } else {
        this.newHze = 5.46e6;
    }}

    // Push beyond 2mpz
    this.borbTarget = false;
    if (ancientSouls >= 21000) {
        this.borbTarget = this.newHze;
        this.newHze = (1 + zonePush / 100) * this.newHze + zoneAdd;
        this.newHze--;
        this.newHze += 500 - this.newHze % 500;
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
    } else if (ancientSouls < 21000) {
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
    let borbHze = this.remainingAncientSouls >= 21000
        ? borbCap
        : Math.min(this.spendAS(ancientSouls >= 50 ? 0.99 : 0.5, this.remainingAncientSouls), borbCap + 1);
    let borbLevel = Math.max(borbFant, borbHze);

    if (this.getCostFromLevel(borbLevel) > (this.remainingAncientSouls - 5)) {
        borbLevel = this.spendAS(1, this.remainingAncientSouls - 5);
    }

    this.remainingAncientSouls -= this.getCostFromLevel(borbLevel);

    // logging
    if (this.newHze > 4e6) {
        console.clear();
        console.log("Durations for " + ancientSouls + " Ancient Souls:");
        let borbLimit = borbLevel * 5000 + 500;
        let endMpz = Math.floor((this.newHze - borbLimit) / 500) / 10 + 2;
        console.log(Math.ceil(getZonesTraveled(borbLimit, this.newHze - borbLimit) / 192000) + " days to reach zone " + this.newHze + " (" + endMpz + " mpz)");
        endMpz = Math.floor((5.45e6 - borbLimit) / 500) / 10 + 2;
        console.log(Math.ceil(getZonesTraveled(borbLimit, 5.45e6 - borbLimit) / 192000) + " days to reach zone " + 5.45e6 + " (" + endMpz + " mpz)");
        endMpz = Math.floor((5.459e6 - borbLimit) / 500) / 10 + 2;
        console.log(Math.ceil(getZonesTraveled(borbLimit, 5.459e6 - borbLimit) / 192000) + " days to reach zone " + 5.459e6 + " (" + endMpz + " mpz)");
    }
    
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
    
    if (!$("#helpText").is(":checked")) {
        $('#checkResults').parent().hide();
        return;
    }
    
    let infoMessage = "";
    if (ancientSouls === 0) {
        infoMessage += "You need to have ancient souls for this to work. Transcend as soon as you unlock transcendence at zone 300. It's worth it.";
    } else {
        if(ancientSouls < 2000 && ancientSouls >= 50) {
            infoMessage += "Only " + borbHze + " Borb is needed to have 2 monsters per zone on your final ascension.";
            infoMessage += " Borb may be leveled higher for earlier ascensions. Ascend at zone 130 the first time to have faster transcensions. <br>";
        }
        if (ancientSouls < 10500) {
            infoMessage += "Ascend after 3 or 4 ascensions that give new Ancient Souls. <b>Not the total amount of ascensions, only ascensions that give you AS counts!</b>";
            infoMessage += " The Highest Zone below is an estimate and you should be within a few thousand zones if you play correctly."
        } else {
            if (ancientSouls < 27000) {
                infoMessage += "The guideline that states '3 or 4 ascensions that give AS' <b>does not apply beyond 24% Transcendent Power!</b>";
                infoMessage += " Keep ascending until you reach at least the estimated Highest Zone shown below. This will take longer (more ascensions) than you are used to.<br>";
            }
            if (ancientSouls >= 21000 && this.newHze <= 5e6) {
                if (ancientSouls < 50000) {
                    infoMessage += "You have enough TP to reach any hero. Borb is the single most important Outsider for reducing transcension time.";
                    infoMessage += " The last 4 Outsiders are impractical/impossible to maintain at high zones so they are kept at 0. <b>This is not a bug!</b><br>";
                } else {
                    infoMessage += "You should push past 2 mpz. The higher your HZE, the higher past 2 mpz you should push.";
                    infoMessage += " The extra time you spend pushing past 2 mpz is not unreasonable when compared to how long a transcension can take just to beat your previous HZE.<br>";
                }
            }
            if (this.newHze >= 5e6) {
                infoMessage += "This calculator is not optimized beyond zone 5 million. Make sure you are pushing at least 200k zones from last transcension ";
                infoMessage += "if not reaching the softcap (around zone 5.46m).<br>";
                infoMessage += "Use the 'Zone override' under Advanced Settings and check your browser's console to see the estimated transcension time.";
            }
        }
    }
    $('#checkResults').html(infoMessage);
    $('#checkResults').parent().show();
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
$("#zoneOverride").keyup(enterKey);

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

$(function() {
    if (localStorage) {
        $("#dark").prop("checked", localStorage.getItem("darkmode")==="true");
    }
    $('.collapsible .title').click(function(){
        $(this).parent().find('.content').toggle();
    });

    $('.numberInput p').click(function(){
        $(this).parent().find('input').focus();
    });
});
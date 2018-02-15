//Polyfill for Internet Explorer
Math.log10 = function (x) { return Math.log(x) / Math.LN10; };

var e11 = false;

var settingsVisible = false;

function showAdvancedClick() {
	$("#advancedSettings").toggle(100, function(){
		$("#showAdvanced").html( (settingsVisible = !settingsVisible) ? "Hide Advanced Settings" : "Show Advanced Settings");
	});
}

function setDefaults() {
	$("#zoneOverride").val(0);
	$("#reservedAS").val(0.1);
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
	let hpMultiplier = Math.min(1.545, 1.145 + zone / 500000);
	let hsMultiplier = Math.pow(1 + transcendentPower, 0.2);
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
		let zoneIncrease = Math.log(damageIncrease) / Math.log(hpMultiplier) * 1.4;
		let phanBuff = Math.pow(hsMultiplier, zoneIncrease);

		if (phan < 5) {
			phanBuff *= 1.3;
		}

		if (chor < ancientSouls && chor < 150) {
			let chorBpAS = Math.pow(chorBuff, 1 / (chor + 1));
			if (chorBpAS >= phanBuff) {
				if (pony < ancientSouls) {
					let ponyBuff = (Math.pow(pony + 1, 2) * (this.useBeta ? 1 : 10) + 1) / (Math.pow(pony, 2) * (this.useBeta ? 1 : 10) + 1);
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
			let ponyBuff = (Math.pow(pony + 1, 2) * (this.useBeta ? 1 : 10) + 1) / (Math.pow(pony, 2) * (this.useBeta ? 1 : 10) + 1);
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
	var ancientSouls = parseInt( $("#ancient_souls").val() || 0 );
	if( !(ancientSouls>=0) ) {
		alert("Calculation failed. Ancient Souls must be a non-negative number.");
		return -1;
	}
	var settings = ["zoneOverride","reservedAS"];
	for(i=0; i<2; i++) {
		var val = $( "#"+settings[i] ).val();
		var setting = ( val=="" ) ? 0 : parseFloat( val );
		if( isNaN(setting) || setting<0 ) {
			setDefaults();
			settings = [0,0.1];
			alert("Advanced settings were set to default values.");
			break;
		}else settings[i] = setting;
	}
	if( settings[1]>0.5 ) {
		settings[1] = 0.5;
	}
	return [ancientSouls, settings[0], settings[1]];
}

function refresh(test=false, ancientSouls=0, useBeta) {
	//Inputs
	this.useBeta = test ? useBeta : $("#beta").is(":checked");
	if (!test) {
		var [ancientSouls, zoneOverride, reservedAS] = getInputs();
		if( ancientSouls==-1 ) return;
		this.reserve = $("#reserveAS").is(":checked");
	}
	
	var transcendentPower = (25 - 23 * Math.exp(-0.0003 * ancientSouls)) / 100;
	
	// Figure out goals for this transcendence
	this.newHze = Math.floor(zoneOverride||0);
	if(this.newHze==0){
	if (ancientSouls < 100) {
		let a = ancientSouls + 42;
		this.newHze = (a / 5 - 6) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
	} else if (ancientSouls < 10500) {
		this.newHze = (1 - Math.exp(-ancientSouls / 3900)) * 200000 + 4800;
	} else {
		if (this.useBeta) {
			if (ancientSouls >= 80000) {
				let b = this.spendAS(1, ancientSouls - 20000);
				this.newHze = Math.min(4.5e6, b * 5000);
			} else if (ancientSouls >= 20000) {
				let b = this.spendAS(1, ancientSouls * 0.75);
				this.newHze = Math.min(7e6, b * 5000);
			} else if (ancientSouls >= 17000) {
				let a = ancientSouls * 2;
				this.newHze = (a / 5 - 6) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
				this.newHze = Math.min(1236000, this.newHze);
			} else if (ancientSouls >= 14500) {
				let a = Math.max(27000, ancientSouls * 1.8);
				this.newHze = (a / 5 - 5) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
			} else {
				this.newHze = 220000;
			}
		} else {
			if (ancientSouls >= 80000) {
				let b = this.spendAS(1, ancientSouls - 20000);
				this.newHze = Math.min(4.5e6, 46500 + b * 5000);
			} else if (ancientSouls >= 20000) {
				let b = this.spendAS(1, ancientSouls * 0.75);
				this.newHze = Math.min(2716000, 46500 + b * 5000);
			} else if (ancientSouls >= 17000) {
				let as = ancientSouls * 2;
				this.newHze = (as / 5 - 6) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
				this.newHze = Math.min(1236000, this.newHze);
			} else if (ancientSouls >= 14500) {
				let a = ancientSouls * 1.8;
				this.newHze = (a / 5 - 6) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
				this.newHze = Math.min(1236000, this.newHze);
			} else {
				this.newHze = 220000;
			}
		}
	}}
	
	this.newHze = Math.floor(this.newHze);
	let newLogHeroSouls = Math.log10(1 + transcendentPower) * this.newHze / 5 + (this.useBeta ? 5 : 6);

	// Ancient effects
	let ancientLevels = Math.floor(newLogHeroSouls / Math.log10(2)) + -1;
	let kuma = this.useBeta
		? -8 * (1 - Math.exp(-0.01 * ancientLevels))
		: -100 * (1 - Math.exp(-0.0025 * ancientLevels));
	let atman = 75 * (1 - Math.exp(-0.013 * ancientLevels));
	let bubos = -5 * (1 - Math.exp(-0.002 * ancientLevels));
	let chronos = 30 * (1 - Math.exp(-0.034 * ancientLevels));
	let dora = 9900 * (1 - Math.exp(-0.002 * ancientLevels));

	// Unbuffed Stats
	let nerfs = Math.floor(this.newHze / 500) * 500 / 500;
	let unbuffedMonstersPerZone = 10 + nerfs * (this.useBeta ? 0.1 : 1);
	let unbuffedTreasureChestChance = Math.exp(-0.006 * nerfs);
	let unbuffedBossHealth = 10 + nerfs * 0.4;
	let unbuffedBossTimer = 30 - nerfs * 2;
	let unbuffedPrimalBossChance = 25 - nerfs * 2;

	// Outsider Caps
	let borbCap = Math.max(0, Math.ceil(((unbuffedMonstersPerZone - 2) / -kuma - 1) / (this.useBeta ? 0.125 : 0.1)));
	let rhageistCap = Math.ceil(((100 - unbuffedPrimalBossChance) / atman - 1) / 0.25);
	let kariquaCap = Math.ceil(((unbuffedBossHealth - 5) / -bubos - 1) / 0.5);
	let orphalasCap = Math.max(1, Math.ceil(((2 - unbuffedBossTimer) / chronos - 1) / 0.75)) + 2;
	let senakhanCap = Math.max(1, Math.ceil((100 / unbuffedTreasureChestChance) / (dora / 100 + 1) - 1));

	let rhageistRatio = 0.125;
	let kariquaRatio = 0.015;
	let orphalasRatio = 0.035;
	let senakhanRatio = 0.025;

	if (ancientSouls < 100) {
		let ratioChange = ancientSouls / 100;
		rhageistRatio *= ratioChange;
		kariquaRatio *= ratioChange;
		orphalasRatio *= ratioChange;
		senakhanRatio *= ratioChange;
	}

	// Apply limits
	rhageistCap = Math.min(rhageistCap, 107);
	kariquaCap = Math.min(kariquaCap, 164);
	orphalasCap = Math.min(orphalasCap, 147);
	senakhanCap = Math.min(senakhanCap, 71);

	// Outsider Leveling
	this.remainingAncientSouls = ancientSouls;

	let borbLevel;
	if (this.useBeta) {
		let borb15 = Math.min(15, this.spendAS(0.5, this.remainingAncientSouls));
		let borb10pc = this.spendAS(0.1, this.remainingAncientSouls);
		let borbLate = this.remainingAncientSouls >= 10000 ? borbCap : 0;
		borbLevel = Math.max(borb15, borb10pc, borbLate);
	} else {
		borbLevel = Math.max((this.remainingAncientSouls >= 300) ? 15 : this.spendAS(0.4, this.remainingAncientSouls), borbCap);
	}

	if (this.getCostFromLevel(borbLevel) > (this.remainingAncientSouls - 5)) {
		borbLevel = this.spendAS(1, this.remainingAncientSouls - 5);
	}

	this.remainingAncientSouls -= this.getCostFromLevel(borbLevel);

	// Xyl sucks
	let xyliqilLevel = 0;
	this.remainingAncientSouls -= this.getCostFromLevel(xyliqilLevel);
	
	// Remove souls if using Reserve AS
	if (!test && this.reserve) {
		var unspentAncientSouls = Math.floor( this.remainingAncientSouls*reservedAS )
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
	let levels = this.nOS(this.remainingAncientSouls, transcendentPower, this.newHze);
	let chorLevel = levels[0];
	let phanLevel = levels[1];
	let ponyLevel = levels[2];

	this.remainingAncientSouls -= this.getCostFromLevel(chorLevel);
	this.remainingAncientSouls -= phanLevel;
	this.remainingAncientSouls -= this.getCostFromLevel(ponyLevel);

	// End of transcension estimates
	let ponyBonus = Math.pow(ponyLevel, 2) * (this.useBeta ? 1 : 10);
	let series = 1 / (1 - 1 / (1 + transcendentPower));
	let buffedPrimalBossChance = Math.max(5, unbuffedPrimalBossChance + atman * (1 + rhageistLevel * 0.25));
	let pbcm = Math.min(buffedPrimalBossChance, 100) / 100;

	newLogHeroSouls = Math.log10(1 + transcendentPower) * (this.newHze - 105) / 5 + Math.log10(ponyBonus + 1) + Math.log10(20 * series * pbcm);
	this.newAncientSouls = Math.max(ancientSouls, Math.floor(newLogHeroSouls * 5));
	this.ancientSoulsDiff = this.newAncientSouls - ancientSouls;
	this.newTranscendentPower = (25 - 23 * Math.exp(-0.0003 * this.newAncientSouls)) / 100;
	
	//test log
	var unspent = this.remainingAncientSouls + (unspentAncientSouls||0);
	if (test) {
		let stringHeroSouls = ( newLogHeroSouls>=6 )
			? Math.pow(10,newLogHeroSouls%1).toFixed(3) + "e+" + Math.floor(newLogHeroSouls)
			: Math.round(Math.pow(10,newLogHeroSouls));
		console.log(JSON.stringify({
			ancientSouls: ancientSouls,
			useBeta: useBeta,
			expectedLevels: [xyliqilLevel,chorLevel,phanLevel,ponyLevel,borbLevel,rhageistLevel,kariquaLevel,orphalasLevel,senakhanLevel],
			expectedRemaining: unspent,
			newHze: this.newHze,
			newHeroSouls: stringHeroSouls,
			newAncientSouls: this.newAncientSouls,
			newTranscendentPower: this.newTranscendentPower*100
		}));
		return
	}
	
	// Display the results
	//End of Transcension
	$("#predictedHZE").html("Highest Zone: " + this.newHze.toLocaleString() );
	$("#predictedHS").html("logHS: " + newLogHeroSouls.toFixed(2).toLocaleString() );
	$("#predictedAS").html("AncientSouls: " + this.newAncientSouls.toLocaleString() + " (+" + this.ancientSoulsDiff.toLocaleString() + ")");
	$("#predictedTP").html("TP: " + this.newTranscendentPower.toFixed(4) + "%" );
	$("#predictedAncients").html("Ancient Levels: " + ancientLevels.toLocaleString() );
	$("#kuma").html( kuma.toFixed(2) + " monsters per zone" );
	$("#atman").html( atman.toFixed(2) + "% chance of primal" );
	$("#bubos").html( bubos.toFixed(2) + " boss life" );
	$("#chronos").html( chronos.toFixed(2) + "s boss fight timer" );
	$("#dora").html( dora.toFixed(2) + "% treasure chests" );
	//Unbuffed Stats
	var zone = Math.floor(this.newHze/500)*500;
		nerfs = zone/500;
		unbuffedMPZ = 10 + nerfs*(this.useBeta?0.1:1);
		unbuffedTCC = Math.exp( -0.006*nerfs );
		unbuffedBossHP = 10 + nerfs*0.4;
		unbuffedTimer = 30 - nerfs*2;
		unbuffedPBC = 25 - nerfs*2;
	$("#unbuffedMPZ").html( "Monsters per Zone: " + unbuffedMPZ.toFixed(2) );
	$("#unbuffedTCC").html( "Treasure Chests: " + unbuffedTCC.toFixed(6) + "x" );
	$("#unbuffedBossHP").html( "Boss Health: " + unbuffedBossHP.toFixed(1) + "x" );
	$("#unbuffedTimer").html( "Boss Timer: " + unbuffedTimer + "s" );
	$("#unbuffedPBC").html( "Primal Chance: " + unbuffedPBC + "%" );
	//Buffed Stats
	var buffedMPZ = unbuffedMPZ + kuma*( 1 + borbLevel/(this.useBeta?8:10) );
		buffedTCC = Math.max( 1, ( dora*( 1 + senakhanLevel)/100 + 1 )*unbuffedTCC );
		buffedBossHP = Math.floor( Math.max( 5, unbuffedBossHP + bubos*( 1 + kariquaLevel*0.5 ) ) );
		buffedTimer = Math.max( 2, unbuffedTimer + chronos*( 1 + orphalasLevel*0.75 ) );
		buffedPBC = Math.max( 5, unbuffedPBC + atman*( 1 + rhageistLevel*0.25 ) );
	$("#buffedMPZ").html( "Monsters per Zone: " + buffedMPZ.toFixed(2) + (buffedMPZ<2?" (2)":"") );
	$("#buffedTCC").html( "Treasure Chests: " + buffedTCC.toFixed() + "%" );
	$("#buffedBossHP").html( "Boss Health: " + buffedBossHP.toFixed() + "x" );
	$("#buffedTimer").html( "Boss Timer: " + buffedTimer.toFixed() + "s" );
	$("#buffedPBC").html( "Primal Chance: " + buffedPBC.toFixed() + "%" );
	//Zone Breakpoints
	if( this.useBeta ) {
		$("#3mpz").html( "3 monsters per zone: " + ( -35000 - Math.floor( kuma*( 1 + borbLevel/8 )*10 )*500 ).toLocaleString() );
	}else {
		$("#3mpz").html( "3 monsters per zone: " + ( -3500 - Math.floor( kuma*( 1 + borbLevel/10 ) )*500 ).toLocaleString() );
	}
	$("#5PBC").html( "5% primal chance: " + ( 5500 + Math.floor( atman*( 1 + rhageistLevel/4 )/2)*500 ).toLocaleString() );
	$("#90BHP").html( "90% boss health: " + ( Math.ceil( ( bubos*( 1 + kariquaLevel/2 )*-10 - 10 )/0.4 )*500 ).toLocaleString() );
	$("#2sTimer").html( "2s boss timer: " + ( 7000 + Math.floor( chronos*( 1 + orphalasLevel*0.75 )/2 )*500 ).toLocaleString() );
	$("#99TTC").html( "99% treasure chests: " + (Math.ceil( Math.log10( 0.995/( dora/10000*( 1 + senakhanLevel ) + 0.01 ) )/Math.log10( 0.99401 ) )*500 ).toLocaleString() );
	$("#1TTC").html( "1% treasure chests: " + (Math.ceil( Math.log10( 0.015/( dora/10000*( 1 + senakhanLevel ) + 0.01 ) )/Math.log10( 0.99401 ) )*500 ).toLocaleString() );
	//Outsiders Table
	$("#OutsidersTable tbody").html(
		"<tr><td>Xyliqil</td><td>"+xyliqilLevel.toLocaleString()+"</td><td>"+getCostFromLevel(xyliqilLevel).toLocaleString()+"</td><td>"+
		"<tr><td>Chor'gorloth</td><td>"+chorLevel.toLocaleString()+"</td><td>"+getCostFromLevel(chorLevel).toLocaleString()+"</td><td>"+
		"<tr><td>Phandoryss</td><td>"+phanLevel.toLocaleString()+"</td><td>"+getCostFromLevel(phanLevel).toLocaleString()+"</td><td>"+
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
	var cases = [0,1,10,100,1000,10000,100000];
	for (i=0;i<cases.length;i++) {
		refresh(true,cases[i],false);
	}
	console.log();
	for (i=0;i<cases.length;i++) {
		refresh(true,cases[i],true);
	}
}

$("#ancient_souls").keyup(function(ev) {
	if (ev.which === 13) refresh();
});

$(setDefaults)
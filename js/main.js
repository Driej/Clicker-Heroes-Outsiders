//Polyfill for Internet Explorer
Math.log10 = function (x) { return Math.log(x) / Math.LN10; };

var e11 = false;

var defaultSettings = {
	zoneOverride: 0,
	reservedAS: 0.1,
	//xyliqilRatio: 0.025,
	rhageistRatio: 0.25,
	kariquaRatio: 0.03,
	orphalasRatio: 0.07,
	senakhanRatio: 0.05
}

var settingsVisible = false;

function showAdvancedClick() {
	$("#advancedSettings").toggle(100, function(){
		$("#showAdvanced").html( (settingsVisible = !settingsVisible) ? "Hide Advanced Settings" : "Show Advanced Settings");
	});
}

function setDefaults() {
	for(var s in defaultSettings) {
		if(defaultSettings.hasOwnProperty(s)) {
			$( "#"+s ).val( defaultSettings[s] );
		}
	}
}

function defaultClick() {
	setDefaults();
}

function totalCost(level) {
	return (level+1)*(level/2);
}

function spendAS( ratio, as ) {
	var spendable = ratio*as;
	if( spendable<1 ) return 0;
	return Math.floor( Math.pow( 8*spendable + 1, 0.5 )/2 - 0.5 );
}

function nOS( as, tp, zone ) {
  
  var hp_multiplier = Math.min( 1.545, 1.145 + zone/500000 );
  var hs_multiplier = Math.pow( 1 + tp/100, 0.2 );
  var chor = 0;
  var phan = 0;
  var pony = 0;
  
  var chor_buff = 1/0.95;
  
  while( as>0 ) {
	
	if( pony<1 ) {
		as -= ++pony;
		continue;
	}else if( phan<3 ) {
		phan++;
		as--;
		continue;
	}
	
    var damage_increase = ( phan+2 ) / ( phan+1 );
    var zone_increase = Math.log( damage_increase ) / Math.log( hp_multiplier ) * 1.4;
    var phan_buff = Math.pow( hs_multiplier, zone_increase );
    
    if( phan < 5 ) phan_buff *= 1.3;
    
    if( chor<as && chor<150 ) {
      var chor_bpAS = Math.pow( chor_buff, 1/(chor+1) );
      if( chor_bpAS>=phan_buff ) {
        if( pony<as ) {
          var pony_buff = ( Math.pow( pony+1, 2 )*(e11?1:10) + 1 ) / ( Math.pow( pony, 2 )*(e11?1:10) + 1 );
          var pony_bpAS = Math.pow( pony_buff, 1/(pony+1) );
          if( pony_bpAS >= chor_bpAS ) {
            as -= ++pony;
            continue;
          }
        }
        as -= ++chor;
        continue;
      }
    }
    
    if( pony<as ) {
      var pony_buff = ( Math.pow( pony+1, 2 )*(e11?1:10) + 1 ) / ( Math.pow( pony, 2 )*(e11?1:10) + 1 );
      var pony_bpAS = Math.pow( pony_buff, 1/(pony+1) );
      if( pony_bpAS>=phan_buff ) {
        as -= ++pony;
        continue;
      }
    }
    
    phan++;
    as--;
    
  }//while
  
  return [chor, phan, pony];
  
}//function nOS

function calculateClick() {
	
	e11 = $("#beta").is(":checked");
	
	//Validate Ancient Souls
	var inputAS = parseInt( $("#ancient_souls").val() || 0 );
	if( !(inputAS>=0) ) {
		alert("Calculation failed. Ancient Souls must be a non-negative number.");
		return;
	}
	
	//Validate Advanced Settings
	var settings = {};
	for(var s in defaultSettings) {
		if(defaultSettings.hasOwnProperty(s)) {
			var val = $( "#"+s ).val();
			var setting = ( val=="" ) ? 0 : parseFloat( val );
			if( isNaN(setting) || setting<0 ) {
				setDefaults();
				settings = defaultSettings;
				alert("Advanced settings were set to default values.");
				break;
			} else {
				settings[s] = setting;
			}
		}
	}
	
	//Normalize Ratios
	var tally = 0;
	for(var s in settings) {
		if( s=="zoneOverride" ) continue;
		if( !($("#reserveAS").is(":checked")) && s=="reservedAS" ) continue;
		if( !($("#levelXyliqil").is(":checked")) && s=="xyliqilRatio" ) continue;
		if(settings.hasOwnProperty(s)) {
			tally += settings[s];
		}
	}
	if( tally>0.5000001 ) {
		alert("The relevant ratios were normalized to add up to 0.5")
		var multiplier = 0.5/tally;
		for(var s in settings) {
			if( s=="zoneOverride" ) continue;
			if( !($("#reserveAS").is(":checked")) && s=="reservedAS" ) continue;
			if( !($("#levelXyliqil").is(":checked")) && s=="xyliqilRatio" ) continue;
			if(settings.hasOwnProperty(s)) {
				settings[s] *= multiplier;
				$( "#"+s ).val( settings[s] );
			}
		}
	}
	
	//Half Super Outsiders Spending in Late Game
	for(var s in settings) {
		if( s=="zoneOverride" ) continue;
		if( !($("#reserveAS").is(":checked")) && s=="reservedAS" ) continue;
		if( !($("#levelXyliqil").is(":checked")) && s=="xyliqilRatio" ) continue;
		if(settings.hasOwnProperty(s)) {
			settings[s] = settings[s]*0.5;
		}
	}
	
	var tp = 25 - 23*Math.exp( -0.0003*inputAS );
	var logHSSacrificed = inputAS/5;
	
	$("#TP").html("TP: " + tp.toFixed(4) + "%" );
	
	//End of Transcension
	var HZE = Math.floor(settings.zoneOverride);
	if ( HZE==0 ) {
		if ( inputAS<100 ) {
			var as = inputAS + 42;
			HZE = ( as/5 - 6 )*51.8*Math.log( 1.25 )/Math.log( 1 + tp/100 );
		}else if( inputAS<10500 ) {
			HZE = ( 1 - Math.exp(-inputAS/3900) )*200000 + 4800;
		}else{
			if( e11 ) {
				if ( inputAS>=80000 ) {
					var b = spendAS(1,inputAS-20000);
						m = Math.min( 4.5e6, b*5000 );
					HZE = m;
				}else if( inputAS>=20000 ) {
					var b = spendAS(1,inputAS*0.75);
						m = Math.min( 7e6, b*5000 );
					HZE = m;
				}else if( inputAS>=17000 ) {
					var as = inputAS*2;
					HZE = ( as/5 - 6 )*51.8*Math.log( 1.25 )/Math.log( 1 + tp/100 );
					HZE = Math.min( 1236000, HZE );
				}else if( inputAS>=14500 ) {
					var as = Math.max( 27000, inputAS*1.8 );
					HZE = ( as/5 - 5 )*51.8*Math.log( 1.25 )/Math.log( 1 + tp/100 );
				}else {
					HZE = 220000;
				}
			} else {
				if ( inputAS>=80000 ) {
					var b = spendAS(1,inputAS-20000);
						m = Math.min( 4.5e6, 46500 + b*5000 );
					HZE = m;
				}else if( inputAS>=20000 ) {
					var b = spendAS(1,inputAS*0.75);
						m = Math.min( 2716000, 46500 + b*5000 );
					HZE = m;
				}else if( inputAS>=17000 ) {
					var as = inputAS*2;
					HZE = ( as/5 - 6 )*51.8*Math.log( 1.25 )/Math.log( 1 + tp/100 );
					HZE = Math.min( 1236000, HZE );
				}else if( inputAS>=14500 ) {
					var as = inputAS*1.8;
					HZE = ( as/5 - 6 )*51.8*Math.log( 1.25 )/Math.log( 1 + tp/100 );
					HZE = Math.min( 1236000, HZE );
				}else {
					HZE = 220000;
				}
				/*if( inputAS>=33000 ) {
					HZE = 1236000;
				}else if( inputAS>=19000 ) {
					HZE = 414000;
				}else if( inputAS>=15500 ) {
					HZE = 281000;
				}else{
					HZE = 205000;
				}*/
			}
		}
		HZE = Math.floor(HZE);
	}
	
	var logHS = Math.log10( 1 + tp/100 )*HZE/5 + (e11?5:6);
		AS = Math.floor( logHS*5 );
		newTP = 25 - 23*Math.exp( -0.0003*AS );
		ancientLevels = Math.floor( logHS/Math.log10(2) ) - 1;
		kuma = e11
		? -8*( 1 - Math.exp( -0.01*ancientLevels ) )
		: -100*( 1 - Math.exp( -0.0025*ancientLevels ) );
		atman = 75*( 1 - Math.exp( -0.013*ancientLevels ) );
		bubos = -5*( 1 - Math.exp( -0.002*ancientLevels ) );
		chronos = 30*( 1 - Math.exp( -0.034*ancientLevels ) );
		dora = 9900*( 1 - Math.exp( -0.002*ancientLevels ) );
	
	$("#predictedHZE").html("Highest Zone: " + HZE.toLocaleString() );
	$("#predictedHS").html("logHS: " + logHS.toFixed(2).toLocaleString() );
	$("#predictedAS").html("AncientSouls: " + AS.toLocaleString() );
	$("#predictedTP").html("TP: " + newTP.toFixed(4) + "%" );
	
	$("#predictedAncients").html("Ancient Levels: " + ancientLevels.toLocaleString() );
	$("#kuma").html( kuma.toFixed(2) + " monsters per zone" );
	$("#atman").html( atman.toFixed(2) + "% chance of primal" );
	$("#bubos").html( bubos.toFixed(2) + " boss life" );
	$("#chronos").html( chronos.toFixed(2) + "s boss fight timer" );
	$("#dora").html( dora.toFixed(2) + "% treasure chests" );
	
	//Unbuffed Stats
	var zone = Math.floor(HZE/500)*500;
		nerfs = zone/500;
		unbuffedMPZ = 10 + nerfs*(e11?0.1:1);
		unbuffedTCC = Math.exp( -0.006*nerfs );
		unbuffedBossHP = 10 + nerfs*0.4;
		unbuffedTimer = 30 - nerfs*2;
		unbuffedPBC = 25 - nerfs*2;
	
	$("#unbuffedMPZ").html( "Monsters per Zone: " + unbuffedMPZ.toFixed(1) );
	$("#unbuffedTCC").html( "Treasure Chests: " + unbuffedTCC.toFixed(6) + "x" );
	$("#unbuffedBossHP").html( "Boss Health: " + unbuffedBossHP.toFixed(1) + "x" );
	$("#unbuffedTimer").html( "Boss Timer: " + unbuffedTimer + "s" );
	$("#unbuffedPBC").html( "Primal Chance: " + unbuffedPBC + "%" );
	
	//Outsider Caps
	var outsiderCaps = {
		borb: Math.max( 0, Math.ceil( ((unbuffedMPZ-2)/-kuma-1)/(e11?0.125:0.1) ) ),
		rhageist: Math.ceil( ((100-unbuffedPBC)/atman-1)/0.25 ),
		kariqua: Math.ceil( ((unbuffedBossHP-5)/-bubos-1)/0.5 ),
		orphalas: Math.max( 1, Math.ceil( ((2-unbuffedTimer)/chronos-1)/0.75 ) ) + 2,
		senakhan: Math.max( 1, Math.ceil( (100/unbuffedTCC)/(dora/100+1)-1 ) )
	}
	
	//Outsider Levelling
	var outsiders = {};
	var outsiderCosts = {};
	
	/*if( inputAS<100 ) {
		outsiders.borb = spendAS( 0.4-inputAS/500, inputAS );
	}else {
		if( e11 ) {
			if( outsiderCaps.borb>10 ) outsiders.borb = outsiderCaps.borb;
			else if( inputAS>=275 ) outsiders.borb = 10;
			else outsiders.borb = spendAS( 0.2, inputAS );
		}else {
			if( outsiderCaps.borb>15 ) outsiders.borb = outsiderCaps.borb;
			else if( inputAS>=600 ) outsiders.borb = 15;
			else outsiders.borb = spendAS( 0.2, inputAS );
		}
	}*/
	if( e11 ) {
		var borb15 = Math.min(15,spendAS(0.5,inputAS));
			borb10pc = spendAS(0.1,inputAS);
			borbLate = inputAS>=10000?outsiderCaps.borb:0;
			b = Math.max(borb15,borb10pc,borbLate);
		outsiders.borb = totalCost(b)>(inputAS-5)?spendAS(1,inputAS-5):b;
	}else {
		var b = Math.max( (inputAS>=300)?15:spendAS(0.4,inputAS), outsiderCaps.borb );
		outsiders.borb = totalCost(b)>(inputAS-5)?spendAS(1,inputAS-5):b;
	}
	outsiderCosts.borb = totalCost(outsiders.borb);
	
	var ancientSouls = inputAS - outsiderCosts.borb;
		reservedAS = 0;
	if( $("#reserveAS").is(":checked") ) {
		reservedAS = Math.floor( ancientSouls*settings.reservedAS )
	}
	var spendableAS = ancientSouls - reservedAS;
	/*if( $("#levelXyliqil").is(":checked") ) {
		outsiders.xyliqil = spendAS( settings.xyliqilRatio, ancientSouls );
	}else*/ outsiders.xyliqil = 0;
	outsiderCosts.xyliqil = totalCost(outsiders.xyliqil);
	
	var limits = {
		rhageist: 107,
		kariqua: 164,
		orphalas: 147,
		senakhan: 71
	}
	for( var o in outsiderCaps ) {
		if( o=="borb" ) continue;
		if(outsiderCaps.hasOwnProperty(o)) {
			var ratio = settings[o+"Ratio"];
			if( inputAS<100 ) {
				ratio *= inputAS/100
			}
			var outsiderCap = Math.min( outsiderCaps[o], limits[o] );
			if( totalCost(outsiderCap)>(ancientSouls*ratio) ) {
				outsiders[o] = spendAS( ratio, ancientSouls );
			} else outsiders[o] = outsiderCap;
			outsiderCosts[o] = totalCost( outsiders[o] );
		}
	}
	
	//Points available to Chor/Phan/Pony
	var CPP = spendableAS;
	var totals = 0;
	for( var o in outsiderCosts ) {
		if( o=="borb" ) continue;
		if(outsiderCosts.hasOwnProperty(o)) {
			totals += outsiderCosts[o];
		}
	}
	CPP -= totals;
	var levels = nOS( CPP, tp, HZE );
		chor = levels[0];
		phan = levels[1];
		pony = levels[2];
	outsiders.chor = chor;
	outsiders.phan = phan;
	outsiders.pony = pony;
	outsiderCosts.chor = totalCost(chor);
	outsiderCosts.phan = phan;
	outsiderCosts.pony = totalCost(pony);
	
	//Outsiders Table
	outsiderCaps.xyliqil = "NA";
	outsiderCaps.chor = 150;
	outsiderCaps.phan = "NA";
	outsiderCaps.pony = "NA";
	var outsiderNames = ["Xyliqil","Chor'gorloth","Phandorys","Ponyboy","Borb","Rhageist","K'Ariqua","Orphalas","Sen-Akhan"];
		outsiderAlias = ["xyliqil","chor","phan","pony","borb","rhageist","kariqua","orphalas","senakhan"];
		toappend = "";
		quickshare = "";
	
	var totalAS = 0;
	
	for( i=0; i<outsiderAlias.length; i++ ) {
		var o = outsiderAlias[i];
		totalAS += outsiderCosts[o];
		toappend += "<tr><td>" + outsiderNames[i] + "</td><td>" + outsiders[o].toLocaleString() + "</td><td>" + outsiderCosts[o].toLocaleString() + "</td><td>";
		var cap = outsiderCaps[o];
		if( cap=="NA" ) {
			toappend += "NA</td><td>NA</td></tr>";
		}else{
			var tC = totalCost(cap);
			if( cap>=1e6 ) cap = cap.toExponential(3);
			else cap = cap.toLocaleString();
			if( tC>=1e6 ) tC = tC.toExponential(3);
			else tC = tC.toLocaleString();
			toappend += cap + "</td><td>" + tC + "</td><tr>";
		}
		
		quickshare += outsiders[o].toLocaleString();
		if( o!=="senakhan" ) quickshare += "/";
		if( o=="pony" ) quickshare += "/";
	}
	
	$("#OutsidersTable tbody").html(toappend);
	
	$("#share").html( quickshare );
	$("#spentAS").html( "Total: " + totalAS );
	$("#unspentAS").html( "Unspent: " + (inputAS-totalAS) );
	
	//Buffed Stats
	var buffedMPZ = Math.max( 2, unbuffedMPZ + kuma*( 1 + outsiders.borb/(e11?8:10) ) );
		buffedTCC = Math.max( 1, ( dora*( 1 + outsiders.senakhan)/100 + 1 )*unbuffedTCC );
		buffedBossHP = Math.floor( Math.max( 5, unbuffedBossHP + bubos*( 1 + outsiders.kariqua*0.5 ) ) );
		buffedTimer = Math.max( 2, unbuffedTimer + chronos*( 1 + outsiders.orphalas*0.75 ) );
		buffedPBC = Math.max( 5, unbuffedPBC + atman*( 1 + outsiders.rhageist*0.25 ) );
	
	$("#buffedMPZ").html( "Monsters per Zone: " + buffedMPZ.toFixed(2) );
	$("#buffedTCC").html( "Treasure Chests: " + buffedTCC.toFixed() + "%" );
	$("#buffedBossHP").html( "Boss Health: " + buffedBossHP.toFixed() + "x" );
	$("#buffedTimer").html( "Boss Timer: " + buffedTimer.toFixed() + "s" );
	$("#buffedPBC").html( "Primal Chance: " + buffedPBC.toFixed() + "%" );
	
	//Zone Breakpoints
	if( e11 ) {
		$("#3mpz").html( "3 monsters per zone: " + ( -35000 - Math.floor( kuma*( 1 + outsiders.borb/8 )*10 )*500 ).toLocaleString() );
	}else {
		$("#3mpz").html( "3 monsters per zone: " + ( -3500 - Math.floor( kuma*( 1 + outsiders.borb/10 ) )*500 ).toLocaleString() );
	}
	$("#5PBC").html( "5% primal chance: " + ( 5500 + Math.floor( atman*( 1 + outsiders.rhageist/4 )/2)*500 ).toLocaleString() );
	$("#90BHP").html( "90% boss health: " + ( Math.ceil( ( bubos*( 1 + outsiders.kariqua/2 )*-10 - 10 )/0.4 )*500 ).toLocaleString() );
	$("#2sTimer").html( "2s boss timer: " + ( 7000 + Math.floor( chronos*( 1 + outsiders.orphalas*0.75 )/2 )*500 ).toLocaleString() );
	$("#99TTC").html( "99% treasure chests: " + (Math.ceil( Math.log10( 0.995/( dora/10000*( 1 + outsiders.senakhan ) + 0.01 ) )/Math.log10( 0.99401 ) )*500 ).toLocaleString() );
	$("#1TTC").html( "1% treasure chests: " + (Math.ceil( Math.log10( 0.015/( dora/10000*( 1 + outsiders.senakhan ) + 0.01 ) )/Math.log10( 0.99401 ) )*500 ).toLocaleString() );
	
	//End of Transcension Adjustments
	var ponybonus = Math.pow( outsiders.pony, 2 )*(e11?1:10);
		series = 1/( 1 - 1/( 1 + tp/100 ) );
		pbcm = Math.min(buffedPBC,100)/100;
	
	logHS = Math.log10( 1 + tp/100 )*(HZE-105)/5 + Math.log10( ponybonus + 1 ) + Math.log10( 20*series*pbcm );
	AS = Math.max( inputAS, Math.floor( logHS*5 ));
	newTP = 25 - 23*Math.exp( -0.0003*AS );
	
	$("#predictedHS").html("logHS: " + logHS.toFixed(2).toLocaleString() );
	$("#predictedAS").html("AncientSouls: " + AS.toLocaleString() + " (+" + (AS-inputAS).toLocaleString() + ")");
	$("#predictedTP").html("TP: " + newTP.toFixed(4) + "%" );
	
}

$(setDefaults)
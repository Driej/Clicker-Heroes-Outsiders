var defaultSettings = {
	zoneOverride: 0,
	reservedAS: 0.1,
	xyliqilRatio: 0.05,
	rhageistRatio: 0.25,
	kariquaRatio: 0.002,
	orphalasRatio: 0.05,
	senakhanRatio: 0.048
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
    var damage_increase = ( phan+2 ) / ( phan+1 );
    var zone_increase = Math.log( damage_increase ) / Math.log( hp_multiplier );
    var phan_buff = Math.pow( hs_multiplier, zone_increase );
    
    if( phan < 3 ) phan_buff *= 1.5;
    
    if( chor<as && chor<150 ) {
      var chor_bpAS = Math.pow( chor_buff, 1/(chor+1) );
      if( chor_bpAS>=phan_buff ) {
        if( pony<as ) {
          var pony_buff = ( Math.pow( pony+1, 2 )*10 + 1 ) / ( Math.pow( pony, 2 )*10 + 1 );
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
      var pony_buff = ( Math.pow( pony+1, 2 )*10 + 1 ) / ( Math.pow( pony, 2 )*10 + 1 );
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
			var setting = parseFloat( ($( "#"+s ).val()) );
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
	if( tally>0.5 ) {
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
	
	var tp = 25 - 23*Math.exp( -0.0003*inputAS );
	var logHSSacrificed = inputAS/5;
	
	$("#TP").html("TP: " + tp.toFixed(4) + "%" );
	
	//End of Transcension
	var HZE = Math.floor(settings.zoneOverride);
	if ( HZE==0 ) {
		if ( inputAS<200 ) {
			var as = inputAS + 43;
			HZE = ( as/5 - 6 )*51.8*Math.log( 1.25 )/Math.log( 1 + tp/100 );
		}else if( inputAS<10500 ) {
			HZE = ( 1 - Math.exp(-inputAS/3900) )*200000 + 5000;
		}else{
			if( inputAS>=33000 ) {
				HZE = 1236000;
			}else if( inputAS>=19000 ) {
				HZE = 414000;
			}else if( inputAS>=15500 ) {
				HZE = 281000;
			}else{
				HZE = 205000;
			}
		}
		HZE = Math.floor(HZE);
	}
	
	var logHS = Math.log10( 1 + tp/100 )*HZE/5 + 6;
		AS = Math.floor( logHS*5 );
		newTP = 25 - 23*Math.exp( -0.0003*AS );
		ancientLevels = Math.floor( logHS*3.284 ) + 11;
		kuma = -100*( 1 - Math.exp( -0.0025*ancientLevels ) );
		atman = 75*( 1 - Math.exp( -0.0013*ancientLevels ) );
		bubos = -5*( 1 - Math.exp( -0.002*ancientLevels ) );
		chronos = 30*( 1 - Math.exp( -0.034*ancientLevels ) );
		dora = 9900*( 1 - Math.exp( -0.002*ancientLevels ) );
	
	$("#predictedHZE").html("Highest Zone: " + HZE);
	$("#predictedHS").html("logHS: " + logHS.toFixed(2) );
	$("#predictedAS").html("AncientSouls: " + AS );
	$("#predictedTP").html("TP: " + newTP.toFixed(4) + "%" );
	
	$("#predictedAncients").html("Ancient Levels: " + ancientLevels );
	$("#kuma").html( kuma.toFixed(2) + " monsters per zone" );
	$("#atman").html( atman.toFixed(2) + "% chance of primal" );
	$("#bubos").html( bubos.toFixed(2) + " boss life" );
	$("#chronos").html( chronos.toFixed(2) + "s boss fight timer" );
	$("#dora").html( dora.toFixed(2) + "% treasure chests" );
	
	//Unbuffed Stats
	var zone = Math.floor(HZE/500)*500;
		nerfs = zone/500;
		unbuffedMPZ = 10 + nerfs;
		unbuffedTCC = Math.pow( 0.99401, nerfs );
		unbuffedBossHP = 10 + nerfs*0.4;
		unbuffedTimer = 30 - nerfs*2;
		unbuffedPBC = 25 - nerfs*2;
	
	$("#unbuffedMPZ").html( "Monsters per Zone: " + unbuffedMPZ );
	$("#unbuffedTCC").html( "Treasure Chests: " + unbuffedTCC.toFixed(6) + "x" );
	$("#unbuffedBossHP").html( "Boss Health: " + unbuffedBossHP.toFixed(1) + "x" );
	$("#unbuffedTimer").html( "Boss Timer: " + unbuffedTimer + "s" );
	$("#unbuffedPBC").html( "Primal Chance: " + unbuffedPBC + "%" );
	
	//Outsider Caps
	var outsiderCaps = {
		borb: Math.max( 5, Math.ceil( ((unbuffedMPZ-2)/-kuma-1)/0.1 )),
		rhageist: Math.ceil( ((100-unbuffedPBC)/atman-1)/0.25 ),
		kariqua: Math.ceil( ((unbuffedBossHP-1)/-bubos-1)/0.5 ),
		orphalas: Math.max( 1, Math.ceil( ((2-unbuffedTimer)/chronos-1)/0.75 ) ) + 2,
		senakhan: Math.max( 1, Math.ceil( (100/unbuffedTCC)/(dora/100+1)-1 ) )
	}
	
	//Outsider Levelling
	var outsiders = {};
	var outsiderCosts = {};
	var borb = 0;
	if( inputAS<100 && ( totalCost(outsiderCaps.borb)>(inputAS*0.3) ) ) {
		outsiders.borb = spendAS( 0.3, inputAS );
	} else outsiders.borb = outsiderCaps.borb;
	outsiderCosts.borb = totalCost(outsiders.borb);
	var ancientSouls = inputAS - outsiderCosts.borb;
		reservedAS = 0;
	if( $("#reserveAS").is(":checked") ) {
		reservedAS = Math.floor( ancientSouls*settings.reservedAS )
	}
	var spendableAS = ancientSouls - reservedAS;
	if( $("#levelXyliqil").is(":checked") ) {
		outsiders.xyliqil = spendAS( settings.xyliqilRatio, ancientSouls );
	}else outsiders.xyliqil = 0;
	outsiderCosts.xyliqil = totalCost(outsiders.xyliqil);
	for( var o in outsiderCaps ) {
		if( o=="borb" ) continue;
		if(outsiderCaps.hasOwnProperty(o)) {
			var ratio = settings[o+"Ratio"]
			if( totalCost(outsiderCaps[o])>(ancientSouls*ratio) ) {
				outsiders[o] = spendAS( ratio, ancientSouls );
			} else outsiders[o] = outsiderCaps[o];
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
	
	var totalAS = 0;
	
	for( i=0; i<outsiderAlias.length; i++ ) {
		var o = outsiderAlias[i];
		totalAS += outsiderCosts[o];
		toappend += "<tr><td>" + outsiderNames[i] + "</td><td>" + outsiders[o] + "</td><td>" + outsiderCosts[o] + "</td><td>";
		var cap = outsiderCaps[o];
		if( cap=="NA" ) {
			toappend += "NA</td><td>NA</td></tr>";
		}else{
			toappend += cap + "</td><td>" + totalCost(cap) + "</td><tr>";
		}
	}
	
	$("#OutsidersTable tbody").html(toappend);
	
	$("#spentAS").html( "Total: " + totalAS );
	$("#unspentAS").html( "Unspent: " + (inputAS-totalAS) );
	
	//Buffed Stats
	var buffedMPZ = Math.max( 2, unbuffedMPZ + kuma*( 1 + outsiders.borb/10 ) );
		buffedTCC = Math.max( 1, ( dora*( 1 + outsiders.senakhan)/100 + 1 )*unbuffedTCC );
		buffedBossHP = Math.floor( Math.max( 1, unbuffedBossHP + bubos*( 1 + outsiders.kariqua*0.5 ) ) );
		buffedTimer = Math.max( 2, unbuffedTimer + chronos*( 1 + outsiders.orphalas*0.75 ) );
		buffedPBC = Math.max( 5, unbuffedPBC + atman*( 1 + outsiders.rhageist*0.25 ) );
	
	$("#buffedMPZ").html( "Monsters per Zone: " + buffedMPZ.toFixed(2) );
	$("#buffedTCC").html( "Treasure Chests: " + buffedTCC.toFixed() + "%" );
	$("#buffedBossHP").html( "Boss Health: " + buffedBossHP.toFixed() + "x" );
	$("#buffedTimer").html( "Boss Timer: " + buffedTimer.toFixed() + "s" );
	$("#buffedPBC").html( "Primal Chance: " + buffedPBC.toFixed() + "%" );
	
	
}

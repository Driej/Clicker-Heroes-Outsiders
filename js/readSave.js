function readSave() {
	let txt = $("#savegame").val();
	let data;
	let ANTI_CHEAT_CODE = "Fe12NAfA3R6z4k0z";
	let zlib = "7a990d405d2c6fb93aa8fbb0ec1a3b23";
	let deflate = "7e8bb5a89f2842ac4af01b3b7e228592";
	if (txt.indexOf(ANTI_CHEAT_CODE) > -1 || txt.substring(0, 32) == zlib || txt.substring(0, 32) == deflate) {
		if (txt.substring(0, 32) == zlib) {
			try {
				data = JSON.parse(pako.inflate(atob(txt.substring(32)), {to: 'string'}));
			} catch(e) {
				$("#savegame").val("");
				return;
			}
		} else if (txt.substring(0, 32) == deflate) {
			try {
				data = JSON.parse(pako.inflateRaw(atob(txt.substring(32)), {to: 'string'}));
			} catch(e) {
				$("#savegame").val("");
				return;
			}
		} else {
			var result = txt.split(ANTI_CHEAT_CODE);
			txt = "";
			for (var i = 0; i < result[0].length; i += 2) {
				txt += result[0][i];
			}
			data = JSON.parse(atob(txt));
		}
		let ancientSouls = data.ancientSoulsTotal;
		$("#ancient_souls").val(ancientSouls);
		let outsiders = refresh();
		const autolevelEnabled = $("#autolevel").is(":checked");
        if (outsiders && autolevelEnabled) {
            generateNewSave(data, outsiders);
			$("#autoLevelDiv").show();
        } else {
			$("#autoLevelDiv").hide();
		}
	} else if (txt)
		$("#savegame").val("");
}
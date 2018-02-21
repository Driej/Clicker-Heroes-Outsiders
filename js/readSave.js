function readSave() {
	let txt = $("#savegame").val();
	let data;
	if (txt.indexOf("Fe12NAfA3R6z4k0z") > -1 || txt.substring(0, 32) == "7a990d405d2c6fb93aa8fbb0ec1a3b23") {
		if (txt.substring(0, 32) == "7a990d405d2c6fb93aa8fbb0ec1a3b23") {
			try {
				data = JSON.parse(pako.inflate(atob(txt.substring(32)), {to: 'string'}));
			} catch(e) {
				$("#savegame").val("");
				return;
			}
		} else {
			var result = txt.split("Fe12NAfA3R6z4k0z");
			txt = "";
			for (var i = 0; i < result[0].length; i += 2) {
				txt += result[0][i];
			}
			data = JSON.parse(atob(txt));
		}
		let ancientSouls = data.ancientSoulsTotal + data.ancientSouls;
		$("#ancient_souls").val(ancientSouls);
		refresh();
	} else if (txt)
		$("#savegame").val("");
}
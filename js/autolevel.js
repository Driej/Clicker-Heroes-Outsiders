function generateNewSave(data, outsiders) {
    let txt = $("#savegame").val();
    let zlib = "7a990d405d2c6fb93aa8fbb0ec1a3b23";
	let deflate = "7e8bb5a89f2842ac4af01b3b7e228592";
    let a = [1, 2, 3, 5, 6, 7, 8, 9, 10];
    for (let i=0; i<9; i++) {
        let outsiderID = a[i];
        if (data.outsiders.outsiders[outsiderID].level > outsiders[i]) {
            $("#outputsave").val("Some outsiders were too high level, respec and try again.");
            return;
        } else {
            data.outsiders.outsiders[outsiderID].level = outsiders[i];
            data.outsiders.outsiders[outsiderID].spentAncientSouls = i === 2 ? outsiders[i] : getCostFromLevel(outsiders[i]);
        }
    }
    data.ancientSouls = outsiders[9];
    let dataString = JSON.stringify(data);
    encodedData = txt.substring(0, 32) == zlib ? pako.deflate(dataString, { to: 'string' }) : pako.deflateRaw(dataString, { to: 'string' });
    $("#outputsave").val(txt.substring(0, 32) == zlib ? zlib + btoa(encodedData) : deflate + btoa(encodedData));
    
}

function clearOutput() {
    $("#outputsave").val("");
}

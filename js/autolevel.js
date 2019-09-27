let autolevelEnabled = false;

function changeAutoLevel() {
    $("#autoLevelDiv").toggle(50, function(){
        autolevelEnabled = $("#autolevel").is(":checked");
    });
    if (localStorage) localStorage.setItem("autolevel", $("#autolevel").is(":checked"));
}

function generateNewSave(data, outsiders) {
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
    let encodedData = pako.deflate(dataString, { to: 'string' });
    $("#outputsave").val("7a990d405d2c6fb93aa8fbb0ec1a3b23" + btoa(encodedData));
}

function clearOutput() {
    $("#outputsave").val("");
}

$(function() {
    if (localStorage) {
        $("#autolevel").prop("checked", localStorage.getItem("autolevel")==="true");
        if (localStorage.getItem("autolevel")==="true") {
            changeAutoLevel();
        }
    }
});
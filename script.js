var text = new Blotter.Text("Welcome back!", {
    size: 125,
    fill: "#db7434"
})

var material = new Blotter.FliesMaterial();
material.uniforms.uPointCellWidth.value = 0.015;
material.uniforms.uPointRadius.value = 0.7;
material.uniforms.uSpeed.value = 20;


var blotter = new Blotter(material, {
    texts: text
})

var scope = blotter.forText(text);

scope.appendTo(document.getElementById('welcomeToLogin'));
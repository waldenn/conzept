  fetch('./data/data.geojson').then(res => res.json()).then(places => {
    Globe()
      .globeImageUrl('./img/earth-night.jpg')
      .backgroundImageUrl('./img/night-sky.png')
      .labelsData(places.features)
      .labelLat(d => d.properties.latitude)
      .labelLng(d => d.properties.longitude)
      .labelText(d => d.properties.name)
      .labelSize(d => Math.sqrt(d.properties.pop_max) * 4e-4)
      .labelDotRadius(d => Math.sqrt(d.properties.pop_max) * 4e-4)
      .labelColor(() => 'rgba(255, 165, 0, 0.75)')
      .labelResolution(2)
    (document.getElementById('globeViz'))
  });

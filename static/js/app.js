// An async function with "await" 
(async function(){

    // Read in JSON data
    const samplesData = await d3.json("samples.json").catch(function(error) {
      console.log(error);
    });

    // Create an array of sample objects from JSON data
    var names = samplesData.names;

    // Create array of sample objects
    var sample = samplesData.samples;

    // Create array of sample metadata objects
    var metadata = samplesData.metadata;

    // Select dropdown menu using D3
    var selectDrop = d3.select("#selDataset");
    
    // Add sample IDs as option to dropdown menu
    selectDrop.selectAll('option')
      .data(names)
      .enter()
      .append('option')
      .text(function(d) {
          return d;
      })
    
      // COULDN'T GET THIS TO WORK - USED D3 EVENT HANDLER INSTEAD
      // function optionChanged(selectObject) {
      //   console.log(selectObject);
      // }

    // Create event handler
    selectDrop.on("change",runEnter);
    // Event handler function
    function runEnter() {
      // Prevent the page from refreshing
      d3.event.preventDefault();
      // Select the input element and get HTML node
      var inputElement = d3.select("select");
      // Get the value property of the input element
      var userSample = inputElement.property("value");

      // Use the input to filter the data by ID
      var sampleResult = sample.filter(s => userSample === s.id)[0];
      var sampleMeta = metadata.filter(m => +userSample === m.id);

      // SORTING DATA
      // Combine the arrays from "samples" key
      var sampleObject = [];
      for (var i = 0; i < sampleResult.sample_values.length; i++) {
        sampleObject.push(
          {sample_values: sampleResult.sample_values[i], 
          otuIds: `OTU ${sampleResult.otu_ids[i]}`,
          otuLabels: sampleResult.otu_labels[i]});
      }
      // Sort the new array
      var sortedSample = sampleObject.sort((a, b) => b.sample_values - a.sample_values);
      // Create new arrays to hold sorted data
      var sampleValues = []
      var otuIds = []
      var otuLabels = []
      // Unpack objects from "sortedSample" into empty arrays
      for (var j = 0; j < sortedSample.length; j++) {
        sampleValues.push(sortedSample[j].sample_values);
        otuIds.push(sortedSample[j].otuIds);
        otuLabels.push(sortedSample[j].otuLabels);
      }

      // CREATE BAR CHART
      // Trace for bar chart
      var traceBar = [{
        x: sampleValues.slice(0,10).reverse(),
        y: otuIds.slice(0,10).reverse(),
        labels: otuIds.slice(0,10).reverse(),
        text: otuLabels.slice(0,10).reverse(),
        type:"bar",
        orientation: "h"
      }];
      // Layout for bar chart
      var barLayout = {
        height: 600,
        width: 500,
      };
      // Use Plotly to plot bar chart
      Plotly.newPlot("bar", traceBar, barLayout);

      // CREATE BUBBLE CHART
      // Trace for bubble chart
      var traceBubble = [{
        x: sampleResult.otu_ids,
        y: sampleValues,
        text: otuLabels,
        mode: 'markers',
        marker: {
          size: sampleValues,
          color: sampleResult.otu_ids
        }
      }];
      // Layout for bubble chart
      var bubbleLayout = {
        height: 600,
        width: 1200,
        xaxis: {title: "OTU ID"}
      };      
      // Use Plotly to plot bubble chart
      Plotly.newPlot('bubble', traceBubble, bubbleLayout);

      // CREATE GAUGE CHART
      // Trace for gauge chart
      var traceGauge = [
        {
        domain: {x: [0, 1], y: [0, 1]},
        value: sampleMeta[0].wfreq,
        title: {text: "Belly Button Wash Frequency (Scrubs Per Week)"},
        type: "indicator",
        mode: "gauge+number",
            gauge: {
              axis: {range: [null, 9]},
              bar: {color: "blue"},
              steps: [
                {range: [0, 1], color: "darkred"},
                {range: [1, 2], color: "red"},
                {range: [2, 3], color: "orange"},
                {range: [3, 4], color: "gold"},
                {range: [4, 5], color: "yellow"},
                {range: [5, 6], color: "lightyellow"},
                {range: [6, 7], color: "lightgreen"},
                {range: [7, 8], color: "green"},
                {range: [8, 9], color: "darkgreen"}
              ],
            }
        }
        ];
        // Layout for gauge chart
        var traceLayout = { width: 600, height: 500, margin: { t: 0, b: 0,}};
      // Use Plotly to plot gauge chart
        Plotly.newPlot('gauge', traceGauge, traceLayout);

      // POPULATE INFO BOX
      // Set selection variable to update metadata info
      var selection = d3.select("#sample-metadata").selectAll("div")
        .data(sampleMeta);
      // Populate the "Demographic Info" box with sample metadata info
      selection.enter()
        .append("div")
        .merge(selection)
        .html(function(d){
          return `<p>ID: ${d.id}</p>
                <p>Ethnicity: ${d.ethnicity}</p>
                <p>Gender: ${d.gender}</p>
                <p>Age: ${d.age}</p>
                <p>Location: ${d.location}</p>
                <p>bbtype: ${d.bbtype}</p>
                <p>wfreq: ${d.wfreq}</p>`
        });
      // Remove old data
      selection.exit().remove();
  }
})()

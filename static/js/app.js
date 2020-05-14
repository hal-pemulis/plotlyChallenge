// An async function with "await" 
(async function(){
    // Read in JSON data
    const samplesData = await d3.json("samples.json").catch(function(error) {
      console.log(error);
    });

    // Create an array of sample IDs from JSON data
    var names = samplesData.names;

    // Create array of smaple objects
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
      console.log(inputElement);

      // Get the value property of the input element
      var userSample = inputElement.property("value");
      console.log(userSample);

      // Use the input to filter the data by ID
      var sampleResult = sample.filter(s => userSample === s.id)[0];
      var sampleMeta = metadata.filter(m => +userSample === m.id);
      console.log(sampleMeta);

      // Trace for bar chart
      var trace1 = {
        x: sampleResult.otu_ids,
        y: sampleResult.sample_values,
        labels: sampleResult.otu_ids,
        text: sampleResult.otu_labels,
        type:"bar",
      };

      // Layout for bar chart
      var barLayout = {
        height: 600,
        width: 1000
      };

      // Put trace1 in an array
      var barData = [trace1];

      // Use Plotly to plot bar chart
      Plotly.newPlot("bar", barData, barLayout);
      
      // Trace for bubble chart
      var trace2 = {
        x: sampleResult.otu_ids,
        y: sampleResult.sample_values,
        text: sampleResult.otu_labels,
        mode: 'markers',
        marker: {
          size: sampleResult.sample_values,
          color: sampleResult.otu_ids
        }
      };
      
      // Put trace2 in an array
      var bubbleData = [trace2];
      
      // Layout for bubble chart
      var bubbleLayout = {
        height: 600,
        width: 1200
      };
            
      // Use Plotly to plot bubble chart
      Plotly.newPlot('bubble', bubbleData, bubbleLayout);

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

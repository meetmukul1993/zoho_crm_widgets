$(document).ready(function(){
	initializeWidget();
});

function initializeWidget()
{
	/*
	 * Subscribe to the EmbeddedApp onPageLoad event before initializing the widget 
	 */
	ZOHO.embeddedApp.on("PageLoad",function(data)
	{		
		/*
	 	 * Verify if EntityInformation is Passed 
	 	 */
		if(data && data.Entity)
		{
			/*
		 	 * Fetch Information of Record passed in PageLoad
		 	 * and insert the response into the dom
		 	 */
			ZOHO.CRM.API.getRecord({Entity:data.Entity,RecordID:data.EntityId})
			.then(function(response)
			{
				// console.log(typeof(response));
				console.log(response);
				var score = response.data[0].Score;
				makePieChart(score);
				// document.getElementById("recordInfo").innerHTML = JSON.stringify(response,null,2);
				// var score = response.data[0].Score;
				// var remaining = 100-score;
			});	
		}

		/*
		 * Fetch Current User Information from CRM
		 * and insert the response into the dom
		 */
		ZOHO.CRM.CONFIG.getCurrentUser()
		.then(function(response)
		{
			console.log(response);
			// document.getElementById("userInfo").innerHTML = JSON.stringify(response,null,2);
		});
		
	});
	/*
	 * initialize the widget.
	 */
	ZOHO.embeddedApp.init();
}

function makePieChart(score){
	var percent = score/100;

	var foregroundColor;
	var backgroundColor;

	// if(percent>=0.7){
	// 	foregroundColor = "#0a8";
	// 	backgroundColor = "#ccc";
	// }
	// if(percent<0.7 && percent>=0.5){
	// 	foregroundColor = "#ddc641";
	// 	backgroundColor = "#ccc";
	// }

	if(percent>=0.25){
		foregroundColor = "#0a8";
		backgroundColor = "#ccc";
	}
	if(percent<0.25 && percent>=0.15){
		foregroundColor = "#ddc641";
		backgroundColor = "#ccc";
	}

	if(percent<0.15){
		foregroundColor = "#42a2eb";
		backgroundColor = "#ccc";
	}


	// var percent = .9; // 0.0 to 1.0
	var text = (percent * 100) + "%";

	var width = 260;
	var height = 260;
	var thickness = 30;
	var duration = 750;
	// var foregroundColor = "#0a8";
	// var backgroundColor = "#ccc";

	var radius = Math.min(width, height) / 2;
	var color = d3.scaleOrdinal([foregroundColor, backgroundColor]);
	// var color = d3.scaleOrdinal(['red', 'black']);
	// console.log(color);
	// var color = ["black", "red"];
	var svg = d3.select("#chart")
	.append('svg')
	.attr('class', 'pie')
	.attr('width', width)
	.attr('height', height);

	var g = svg.append('g')
	.attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

	var arc = d3.arc()
	.innerRadius(radius - thickness)
	.outerRadius(radius);

	var pie = d3.pie()
	.sort(null);

	var path = g.selectAll('path')
	.data(pie([0, 1]))
	.enter()
	.append('path')
	.attr('d', arc)
	.attr('fill', function(d, i) {
	return color(i);
	})
	.each(function(d) { this._current = d; });


	path.data(pie([percent, 1-percent])).transition()
	.duration(duration)
	.attrTween('d', function(d) {
	var interpolate = d3.interpolate(this._current, d);
	this._current = interpolate(0);
	return function(t) {
		return arc(interpolate(t));
	}
	});

	g.append('text')
	.attr('text-anchor', 'middle')
	.attr('dy', '.35em')
	.text(text);
}
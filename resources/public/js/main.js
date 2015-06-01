/* init */
var h = new Hoquet();
var $iterationsList = $("#iterations");
var $keyspaceForm = $("#keyspace-form");
var $chartContainer = $("#chart-container");
var $showPropertiesAnchor = $("#show-properties");
var $propertiesForm = $("#properties-form");
var keyspace = "";

$keyspaceForm.on("submit", ajaxGetIterationsForKeyspace);
$iterationsList.on("click", "a", iterationClick);
$showPropertiesAnchor.on("click", togglePropertiesForm);
$propertiesForm.on("submit", ajaxRunTest);

/* main */
//var chart = new Chart(document.getElementById("chart").getContext("2d")).Line(data, options);

/* controllers */
function ajaxRunTest(e) {
  e.preventDefault();
  var properties = $(this).find("textarea").val();
  var http = new XMLHttpRequest();

  http.open("post", "/api/run-test", true);
  http.send(properties);
  return false;
}

function togglePropertiesForm(e) {
  $propertiesForm.toggle('fast');
}

function ajaxGetIterationsForKeyspace(e) {
  e.preventDefault();
  var http = new XMLHttpRequest();
  keyspace = $keyspaceForm[0].elements["keyspace"].value;

  $chartContainer.empty();

  http.onload = function(e) {
    $iterationsList.html(iterationsList(JSON.parse(http.response)));
  };
  http.open("get", "/api/iterations?keyspace=" + keyspace, true);
  http.send();
  return false;
}

function iterationClick(e) {
  e.preventDefault();
  var href = $(this).attr('href');
  var http = new XMLHttpRequest();

  $(this).parents("ul").find("li").removeClass("selected");
  $(this).parents("li").addClass("selected");
  $chartContainer.empty();

  http.onload = function(e) {
    // reload data into one chart
    var testdata = JSON.parse(http.response);
    testdata.forEach(function(attribute, idx) {
      $chartContainer.append(h.render(["div", {id: "container" + idx, class: "chart-container"}, ""]));
      var chart = new CanvasJS.Chart("container" + idx, {
        title: {
          text: attribute["object-name"],
          fontSize: 18
        },
        axisX: {
          valueFormatString: "H:mm:ss.fff"
        },
        axisY: {
          labelWrap: true,
          labelMaxWidth: 50
        },
        subtitles: [{
          text: attribute["attribute"]  + (
            ~attribute["object-name"].indexOf("Latency") ? " (microseconds)"
            : ~attribute["object-name"].indexOf("AllMemtablesDataSize") ? " (bytes)"
            : ""
          )
        },{
          text: "started " + (new Date(attribute.data[0].received))
        }],
        data: [{
          type: "stackedArea",
          dataPoints: attribute.data.map(function(record) {
            return {
              y: record.value,
              x: new Date(record.received)
            };
          })
        }]
      });
      chart.render();
    });
  };
  http.open("get", href + "?keyspace=" + keyspace, true);
  http.send();
};

/* views */
function iterationsList(iterations) {
  return h.render(!iterations.length ? ['h3', 'No test iterations found']
    : [
      ['h3', 'Choose from one of the iterations below'],
      ['ul', iterations.sort(function(a, b) {
        return b['run-date'] - a['run-date'];
      }).map(function(iteration) {
        return [
          'li', [
            'a', {href: '/api/iteration/' + iteration.iteration},
            iteration.iteration, " &ndash; ", new Date(iteration["run-date"]) + ""
          ]
        ];
      })]
    ]
  );
}


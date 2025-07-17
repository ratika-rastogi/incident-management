sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "ns/incidents/test/integration/FirstJourney",
    "ns/incidents/test/integration/pages/IncidentsList",
    "ns/incidents/test/integration/pages/IncidentsObjectPage",
  ],
  function (JourneyRunner, opaJourney, IncidentsList, IncidentsObjectPage) {
    "use strict";
    var journeyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: sap.ui.require.toUrl("ns/incidents") + "/index.html",
    });

    journeyRunner.run(
      {
        pages: {
          onTheIncidentsList: IncidentsList,
          onTheIncidentsObjectPage: IncidentsObjectPage,
        },
      },
      opaJourney.run,
    );
  },
);

const cds = require("@sap/cds");

class ProcessorService extends cds.ApplicationService {
  init() {
    this.before("UPDATE", "Incidents", (req) => {
      this.onBeforeUpdateIncident(req);
    });

    this.before("CREATE", "Incidents", (req) => {
      this.changeUrgencyDueToSubject(req);
    });

    this.after("UPDATE" , "Incidents" , (req) => {
      this.onAfterUpdateIncidents(req);
    })

    return super.init();
  }

  changeUrgencyDueToSubject(req) {
    const {data} = req
    if (data) {
      const incidents = Array.isArray(data) ? data : [data];
      incidents.forEach((incident) => {
        if (incident.title?.toLowerCase().includes("urgent")) {
          incident.urgency = {code: "H",descr: "High"};
        }
      });
    }
  }

  async onBeforeUpdateIncident(req) {
    const { status_code } = await SELECT.one(
      req.subject,
      (i) => i.status_code,
      req.data.ID
    );
    if (status_code === "C") {
      return req.reject("Can not update the closed incident");
    }
  }
}

module.exports = { ProcessorService };
 
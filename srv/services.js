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
    });

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
    console.log("onBeforeUpdateIncident")
    console.log(req.data)
    const { status_code } = await SELECT.from("Incidents",{ID:req.data.ID})
    console.log('status code',status_code)
    if (status_code === "C") {
      return req.reject("Can not update the closed incident");
    }
  }

  async onAfterUpdateIncidents(req) {
    console.log("onAfterUpdateIncidents")
    const  data  = req; 
    try {
        const { title } =await SELECT.from("Incidents",{ID:data.ID})
        console.log(title)
        await cds.tx(tx => tx.run(UPDATE("Incidents",{ID : data.ID})))
        await cds.tx( tx => tx.run(INSERT.into("IncidentsChangeLogs").entries({
          incidentId:data.ID,
          oldValue:title,
          newValue:data.titl,
          changeType:'Update'})))
        console.log('Update done successfully......',"info")
    } catch (error) {
      console.log("Update to change logs not done correctly",error)
    }
  }
}

module.exports = { ProcessorService };
 
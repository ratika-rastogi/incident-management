const cds = require("@sap/cds/lib");
const { default: axios } = require("axios");
const { GET, POST, DELETE, PATCH, expect } = cds.test(__dirname + "../../");

axios.defaults.auth = { username: "alice" };

jest.setTimeout(11111);

describe("Test the GET endpoints", () => {
  it("Should Check Processor Service", async () => {
    const processorService = await cds.connect.to("ProcessorService");
    const { Incidents } = processorService.entities;
    expect(await SELECT.from(Incidents)).to.have.length(4);
  });

  it("Should Check Customers", async () => {
    const processorService = await cds.connect.to("ProcessorService");
    const { Customers } = processorService.entities;
    expect(await SELECT.from(Customers)).to.have.length(3);
  });

  it("Test expand entity endpoint", async () => {
    const { data } =
      await GET`/odata/v4/processor/Customers?$select=firstName&$expand=incidents`;
    expect(data).to.be.an("object");
  });
});

describe("Draft APIs..", () => {
  let draftId, incidentId;
  it("Create an incident", async () => {
    const { status, statusText, data } = await POST(
      `/odata/v4/processor/Incidents`,
      {
        title: "Urgent attention Required",
        status_code: "N",
      },
    );
    draftId = data.ID;
    expect(status).to.equal(201);
    expect(statusText).to.equal("Created");
  });

  it("+ Activate the draft and check urgency code as H using the custom logic", async () => {
    const response = await POST(
      `/odata/v4/processor/Incidents(ID=${draftId},IsActiveEntity=false)/ProcessorService.draftActivate`,
    );
    expect(response.status).to.equal(201);
    expect(response.data.urgency_code).to.equal("H");
  });

  it("+ Test the Incident Status", async () => {
    const {
      status,
      data: { status_code, ID },
    } = await GET(
      `/odata/v4/processor/Incidents(ID=${draftId},IsActiveEntity=true)`,
    );
    ((incidentId = ID), expect(status).to.equal(200));
    expect(status_code).to.equal("N");
  });

  describe("Close Incident and open it again to check the custom logic", () => {
    it(`Should close the Incident - ${incidentId}`, async () => {
      const { status } = await POST(
        `odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=true)/ProcessorService.draftEdit`,
        {
          PreserveChanges: true,
        },
      );
      expect(status).to.equal(201);
    });

    it(`Should close the Incident - ${incidentId}`, async () => {
      const { status } = await PATCH(
        `odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=false)`,
        {
          status_code: "C",
        },
      );
      expect(status).to.equal(200);
    });

    it("+ Activate the draft and check the Incident status as C as per custom logic", async () => {
      const response = await POST(
        `odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=false)/ProcessorService.draftActivate`,
      );
      expect(response.status).to.equal(200);
    });

    it("+ Test the incident status to be closed", async () => {
      const {
        status,
        data: { status_code },
      } = await GET(
        `odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=true)`,
      );
      expect(status).to.equal(200);
      expect(status_code).to.equal("C");
    });

    describe("Should fail to re-open the closed Incident", () => {
      it(`Should re-open the closed Incident - ${draftId}`, async () => {
        const { status } = await POST(
          `/odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=true)/ProcessorService.draftEdit`,
          {
            PreserveChanges: true,
          },
        );
        expect(status).to.equal(201);
      });

      it(`Should re-open the Incident- ${draftId} but fail`, async () => {
        const { status } = await PATCH(
          `/odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=false)`,
          {
            status_code: "N",
          },
        );
        expect(status).to.equal(200);
      });

      // it(' `Should fail to activate draft trying to re-open the incidentt', async () => {
      //     try {
      //     const response = await POST(
      //         `/odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=false)/ProcessorService.draftActivate`
      //     )
      //     } catch (error) {
      //     expect(error.response.status).to.eql(500)
      //     expect(error.response.data.error.message).to.include(`Can't modify a closed incident`)
      //     }
      // })
    });
  });

  it("- Delete the draft", async () => {
    const response = await DELETE(
      `/odata/v4/processor/Incidents(ID=${draftId},IsActiveEntity=false)`,
    );
    expect(response.status).to.equal(204);
  });

  it("- Delete the Incident", async () => {
    const response = await DELETE(
      `/odata/v4/processor/Incidents(ID=${incidentId},IsActiveEntity=true)`,
    );
    expect(response.status).to.equal(204);
  });
});

using { cuid, managed,sap.common.CodeList} from '@sap/cds/common';
namespace sap.capire.incidents;

/**
 * Incidents created by customers
 */
entity Incidents    :   cuid,   managed    {
    customer        :   Association to Customers;
    title           :   String @title:'Title';
    urgency         :   Association to Urgency default 'M';
    status          :   Association to Status default 'N';
    conversation    :   Composition of many {
                            key ID : UUID;
                            timestamp   :   type of managed:createdAt;
                            author      :   type of managed:createdBy;
                            message     :   String;
                        };           
}

/**
 * Customers entitled to create support incidents
 */
entity Customers    :   managed {
    key ID      :   String;
    firstName   :   String;
    lastName    :   String;
    name        :   String= firstName || ' ' || lastName;
    email       :   EMailAddress;
    phone       :   PhoneNumber;
    incidents   :   Association to many Incidents on incidents.customer = $self;
    credicardNo :   String(16) @assert.format : '^[1-9]\d{15}$';
    addresses   :   Composition of many Addresses on addresses.customer= $self;
}

/**
 * Addresses of the customers
 */
entity Addresses    :   cuid,   managed    {
    customer        :   Association to Customers;
    city            :   String;
    postCode        :   String;
    streetAddress   :   String;
}

/**
 * Status of incidents
 */
entity Status   :   CodeList {
    key code    :   String enum {
        new = 'N';
        assigned = 'A';
        in_process = 'I';
        on_hold = 'H';
        resolved = 'R';
        closed = 'C';
    };
    criticality  : Integer;
}

/**
 * Urgency of Incidents
 */
entity Urgency  :   CodeList {
    key code    :   String enum {
        high = 'H';
        medium = 'M';
        low = 'L';
    };
}

//Incidents Change log entity to log the changes on an incident
entity IncidentsChangeLogs    :   cuid,   managed    {
    incidentId  :  UUID;
    oldValue    :   String;
    newValue    :   String;
    changeType  :   String;
}

type EMailAddress   :   String;
type PhoneNumber    :   String;


